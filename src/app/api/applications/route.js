import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Application, AuditLog } from '@/models';

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

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');

    // Build query
    const query = { userId: session.user.id };
    if (status) {
      query.status = status;
    }

    // Get applications with pagination
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('userId', 'firstName lastName email');

    const total = await Application.countDocuments(query);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

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
      processingType,
      currentPassport,
      personalInfo,
      contactInfo,
      emergencyContact,
      travelInfo
    } = body;

    // Basic validation
    if (!applicationType || !currentPassport || !personalInfo || !contactInfo || !emergencyContact) {
      return NextResponse.json(
        { error: 'Missing required application data' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new application
    const newApplication = new Application({
      userId: session.user.id,
      applicationType: applicationType || 'renewal',
      processingType: processingType || 'regular',
      currentPassport,
      personalInfo,
      contactInfo,
      emergencyContact,
      travelInfo: travelInfo || {},
      status: 'draft'
    });

    await newApplication.save();

    // Log application creation
    await AuditLog.logUserAction(
      'application_created',
      session.user.id,
      `New passport application created: ${newApplication.applicationNumber}`,
      {
        resourceType: 'application',
        resourceId: newApplication._id.toString(),
        resourceName: newApplication.applicationNumber,
        applicationNumber: newApplication.applicationNumber
      },
      {
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    );

    return NextResponse.json(
      {
        message: 'Application created successfully',
        application: newApplication
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create application error:', error);

    // Log system error
    await AuditLog.logSystemEvent(
      'api_error',
      `Create application API error: ${error.message}`,
      {
        resourceType: 'api',
        resourceId: '/api/applications'
      },
      'high'
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 