import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { Application } from '@/models/Application.js';
import { User } from '@/models/User.js';
import { createAuditLog } from '@/lib/auditLog.js';
import emailService from '@/lib/emailService.js';
import getDatabase from '@/lib/database.js';

const db = getDatabase();

// PATCH /api/admin/applications/[id]/status - Update application status
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Simple admin check - in production, use proper role management
    if (session.user.email !== 'demo@passport.gov.sd') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const { status, notes } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get current application
    const currentApp = Application.findById(id);
    if (!currentApp) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const oldStatus = currentApp.status;

    // Update application status
    const stmt = db.prepare(`
      UPDATE applications 
      SET status = ?, reviewed_at = ?, reviewed_by = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `);

    const timestamp = new Date().toISOString();
    stmt.run(status, timestamp, session.user.id, notes || null, timestamp, id);

    // Get updated application
    const updatedApp = Application.findById(id);

    // Get user information for email
    const user = User.findById(currentApp.user_id);

    // Send status update email if user exists and status changed
    if (user && user.email && oldStatus !== status) {
      try {
        await emailService.sendStatusUpdateEmail(updatedApp, user, oldStatus, status);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    // Log the status change
    await createAuditLog({
      userId: session.user.id,
      action: 'APPLICATION_STATUS_UPDATED',
      resourceType: 'application',
      resourceId: id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { 
        applicationNumber: updatedApp.application_number,
        oldStatus,
        newStatus: status,
        reviewedBy: session.user.email,
        notes: notes || null
      }
    });

    return NextResponse.json({
      message: 'Application status updated successfully',
      application: updatedApp,
      oldStatus,
      newStatus: status
    });

  } catch (error) {
    console.error('Update application status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 