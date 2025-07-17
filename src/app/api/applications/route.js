import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth.js';
import { Application } from '../../../models/Application.js';
import { User } from '../../../models/User.js';
import { createAuditLog } from '../../../lib/auditLog.js';
import emailService from '../../../lib/emailService.js';

// GET /api/applications - Get user's applications
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');

    // Get applications with pagination
    const result = Application.findByUserId(session.user.id, {
      page,
      limit,
      status
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/applications - Create new application
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const {
      applicationType,
      processingSpeed,
      currentPassportNumber,
      currentPassportIssueDate,
      currentPassportExpiryDate,
      currentPassportIssuingOffice,
      currentPassportStatus,
      replacementReason,
      travelPurpose,
      travelCountries,
      travelDepartureDate,
      travelReturnDate
    } = body;

    // Basic validation
    if (!applicationType) {
      return NextResponse.json(
        { error: 'Missing required application data' },
        { status: 400 }
      );
    }

    // Create new application
    const applicationData = {
      userId: session.user.id,
      applicationType,
      processingSpeed: processingSpeed || 'regular',
      currentPassportNumber,
      currentPassportIssueDate,
      currentPassportExpiryDate,
      currentPassportIssuingOffice,
      currentPassportStatus,
      replacementReason,
      travelPurpose,
      travelCountries,
      travelDepartureDate,
      travelReturnDate
    };

    const newApplication = Application.create(applicationData);

    // Log application creation
    await createAuditLog({
      userId: session.user.id,
      action: 'APPLICATION_CREATED',
      resourceType: 'application',
      resourceId: newApplication.id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { 
        applicationNumber: newApplication.applicationNumber,
        applicationType: newApplication.applicationType
      }
    });

    // Send confirmation email
    try {
      const user = User.findById(session.user.id);
      if (user && user.email) {
        await emailService.sendApplicationSubmissionEmail(newApplication, user);
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the application creation if email fails
    }

    return NextResponse.json(
      {
        message: 'Application created successfully',
        application: newApplication
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 