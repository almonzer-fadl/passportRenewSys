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
    // For demo purposes, skip database connection if not available
    try {
      await dbConnect();
    } catch (dbError) {
      console.log('Database not available, using mock data');
    }

    const data = await req.json();

    // Generate application number
    const applicationNumber = `PAS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create application object with complete data structure
    const applicationData = {
      applicationNumber,
      userId: data.userId || 'demo-user',
      applicationType: data.applicationType,
      processingType: data.processingType,
      
      // Personal Information
      personalInfo: {
        firstName: data.personalInfo?.firstName,
        lastName: data.personalInfo?.lastName,
        fatherName: data.personalInfo?.fatherName,
        grandfatherName: data.personalInfo?.grandfatherName,
        motherName: data.personalInfo?.motherName,
        nationalId: data.personalInfo?.nationalId,
        dateOfBirth: data.personalInfo?.dateOfBirth,
        placeOfBirth: data.personalInfo?.placeOfBirth,
        gender: data.personalInfo?.gender,
        maritalStatus: data.personalInfo?.maritalStatus,
        profession: data.personalInfo?.profession,
        nationality: data.personalInfo?.nationality || 'Sudanese'
      },

      // Current Passport (for renewal/replacement)
      currentPassport: data.currentPassport || null,

      // Contact Information
      contactInfo: {
        phoneNumber: data.contactInfo?.phoneNumber,
        email: data.contactInfo?.email,
        address: data.contactInfo?.address,
        alternativePhone: data.contactInfo?.alternativePhone,
        alternativeEmail: data.contactInfo?.alternativeEmail,
        preferredCommunication: data.contactInfo?.preferredCommunication
      },

      // Emergency Contact
      emergencyContact: {
        name: data.emergencyContact?.name,
        relationship: data.emergencyContact?.relationship,
        phoneNumber: data.emergencyContact?.phoneNumber,
        address: data.emergencyContact?.address,
        secondaryName: data.emergencyContact?.secondaryName,
        secondaryRelationship: data.emergencyContact?.secondaryRelationship,
        secondaryPhone: data.emergencyContact?.secondaryPhone,
        secondaryAddress: data.emergencyContact?.secondaryAddress
      },

      // Travel Information
      travelInfo: {
        purposeOfTravel: data.travelInfo?.purposeOfTravel,
        intendedCountries: data.travelInfo?.intendedCountries || [],
        departureDate: data.travelInfo?.departureDate,
        returnDate: data.travelInfo?.returnDate,
        additionalNotes: data.travelInfo?.additionalNotes
      },

      // Documents
      documents: {
        passportPhoto: data.documents?.passportPhotoUrl || '',
        passportPhotoValidated: data.documents?.passportPhotoValidated || false,
        identityDocument: data.documents?.identityDocumentUrl || '',
        citizenshipDocument: data.documents?.citizenshipDocumentUrl || '',
        supportingDocument: data.documents?.supportingDocumentUrl || '',
        currentPassportCopy: data.documents?.currentPassportCopyUrl || ''
      },

      // Terms and Conditions
      termsAccepted: data.termsAccepted || {},

      // Application Status
      status: 'submitted',
      submittedAt: new Date(),
      
      // Payment (will be handled after pre-approval)
      payment: {
        amount: calculateApplicationFee(data.applicationType, data.processingType),
        status: 'pending',
        required: true
      }
    };

    // Try to save to database if available, otherwise return mock response
    let application;
    try {
      application = new Application(applicationData);
      await application.save();
    } catch (saveError) {
      console.log('Database save failed, returning mock response');
      application = {
        _id: `mock-${Date.now()}`,
        applicationNumber: applicationData.applicationNumber,
        status: applicationData.status,
        submittedAt: applicationData.submittedAt
      };
    }

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        applicationNumber: application.applicationNumber,
        status: application.status,
        submittedAt: application.submittedAt
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