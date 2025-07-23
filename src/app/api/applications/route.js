import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/application';

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
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
    await dbConnect();

    const data = await req.json();

    // Create application object
    const applicationData = {
      userId: data.userId || 'temp-user-id',
      personalInfo: {
        firstName: data.personalInfo?.firstName || 'Test',
        lastName: data.personalInfo?.lastName || 'User',
        dateOfBirth: data.personalInfo?.dateOfBirth,
        placeOfBirth: data.personalInfo?.placeOfBirth,
        nationality: data.personalInfo?.nationality || 'Sudanese',
        gender: data.personalInfo?.gender,
        email: data.contactInfo?.email || 'test@example.com',
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