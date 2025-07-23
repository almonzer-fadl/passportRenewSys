import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Application from '@/models/application';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    if (session.user.role === 'citizen') {
      query.userId = session.user.id;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('userId', 'email profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    return NextResponse.json({
      applications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const data = await req.json();

    // Create application object
    const applicationData = {
      userId: session.user.id,
      personalInfo: {
        firstName: data.personalInfo?.firstName || session.user.firstName,
        lastName: data.personalInfo?.lastName || session.user.lastName,
        dateOfBirth: data.personalInfo?.dateOfBirth,
        placeOfBirth: data.personalInfo?.placeOfBirth,
        nationality: data.personalInfo?.nationality || 'Sudanese',
        gender: data.personalInfo?.gender,
        email: data.contactInfo?.email || session.user.email,
        phoneNumber: data.contactInfo?.phoneNumber,
        address: data.contactInfo?.address
      },
      currentPassport: data.currentPassport,
      documents: {
        passportPhoto: data.documents?.passportPhoto || '',
        signature: data.documents?.signature || '',
        facePhoto: data.documents?.facePhoto || '',
        currentPassportScan: data.documents?.currentPassportScan || ''
      },
      status: 'draft',
      payment: {
        amount: calculateApplicationFee(data.applicationType, data.processingType),
        status: 'pending'
      }
    };

    const application = new Application(applicationData);
    await application.save();

    return NextResponse.json({
      message: 'Application created successfully',
      application: {
        id: application._id,
        applicationNumber: application.applicationNumber,
        status: application.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateApplicationFee(applicationType, processingType = 'regular') {
  const baseFees = {
    new: 150,
    renewal: 100,
    replacement: 120,
    correction: 80
  };

  const processingFees = {
    regular: 0,
    express: 50,
    urgent: 100
  };

  return (baseFees[applicationType] || 100) + (processingFees[processingType] || 0);
} 