import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../auth/[...nextauth]/route.js';
import { Document } from '../../../../../../models/Document.js';
import { createAuditLog } from '../../../../../../lib/auditLog.js';

// PATCH /api/admin/documents/[id]/status - Update document validation status
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
    const { status, validationNotes } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get current document
    const currentDoc = Document.findById(id);
    if (!currentDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update document validation status
    const updatedDoc = Document.updateValidation(
      id, 
      status === 'approved', 
      status === 'approved' ? 1.0 : 0.0, 
      validationNotes
    );

    // Log the status change
    await createAuditLog({
      userId: session.user.id,
      action: 'DOCUMENT_STATUS_UPDATED',
      resourceType: 'document',
      resourceId: id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { 
        documentId: id,
        oldStatus: currentDoc.validation_status,
        newStatus: status,
        validatedBy: session.user.email,
        validationNotes: validationNotes || null
      }
    });

    return NextResponse.json({
      message: 'Document status updated successfully',
      document: updatedDoc
    });

  } catch (error) {
    console.error('Update document status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 