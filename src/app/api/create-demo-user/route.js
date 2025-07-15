import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, AuditLog } from '@/models';

export async function POST(request) {
  try {
    console.log('🚀 Starting demo user creation via API...');
    
    // Connect to database using existing connection utility
    await connectDB();
    console.log('✅ Connected to database');

    // Check if demo user already exists
    const existingUser = await User.findOne({ 
      email: 'demo@passport.gov.sd' 
    });

    if (existingUser) {
      console.log('⚠️  Demo user already exists');
      return NextResponse.json({
        success: true,
        message: 'Demo user already exists',
        user: {
          email: existingUser.email,
          name: existingUser.fullName,
          status: existingUser.status,
          role: existingUser.role,
          nationalId: existingUser.nationalId
        },
        credentials: {
          email: 'demo@passport.gov.sd',
          password: 'Demo123456!'
        }
      });
    }

    // Create demo user with all required fields
    const demoUser = new User({
      email: 'demo@passport.gov.sd',
      password: 'Demo123456!', // Will be hashed by pre-save middleware
      firstName: 'Ahmed',
      lastName: 'Al-Sudani',
      nationalId: '1234567890', // Sudan format: 10 digits
      phoneNumber: '+249123456789', // Sudan format
      dateOfBirth: new Date('1990-01-15'), // Over 18 years old
      address: {
        street: '123 Nile Avenue',
        city: 'Khartoum',
        state: 'Khartoum State',
        postalCode: '11111',
        country: 'Sudan'
      },
      role: 'citizen',
      status: 'active', // Set to active so user can login immediately
      emailVerified: true, // Skip email verification for demo
      phoneVerified: true // Skip phone verification for demo
    });

    // Save the user (password will be automatically hashed)
    await demoUser.save();
    console.log('✅ Demo user created successfully!');

    // Log the creation in audit log
    try {
      await AuditLog.logUserAction(
        'user_created',
        demoUser._id,
        'Demo user created for testing purposes',
        {
          resourceType: 'user',
          resourceId: demoUser._id.toString(),
          resourceName: demoUser.fullName
        },
        {
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || '127.0.0.1',
          userAgent: request.headers.get('user-agent') || 'Demo API'
        }
      );
    } catch (auditError) {
      console.warn('Warning: Could not create audit log entry:', auditError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Demo user created successfully!',
      user: {
        id: demoUser._id,
        email: demoUser.email,
        name: demoUser.fullName,
        nationalId: demoUser.nationalId,
        phone: demoUser.phoneNumber,
        role: demoUser.role,
        status: demoUser.status
      },
      credentials: {
        email: 'demo@passport.gov.sd',
        password: 'Demo123456!'
      },
      note: 'You can now login to the application with these credentials!'
    });

  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    
    let errorMessage = 'Failed to create demo user';
    let errorDetails = {};

    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      errorMessage = `Duplicate ${field}: ${value} already exists in database`;
    } else if (error.errors) {
      // Validation errors
      errorMessage = 'Validation errors occurred';
      errorDetails = {};
      Object.keys(error.errors).forEach(field => {
        errorDetails[field] = error.errors[field].message;
      });
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails
    }, { status: 500 });
  }
}

// Also allow GET requests to check if demo user exists
export async function GET(request) {
  try {
    await connectDB();
    
    const existingUser = await User.findOne({ 
      email: 'demo@passport.gov.sd' 
    });

    if (existingUser) {
      return NextResponse.json({
        exists: true,
        user: {
          email: existingUser.email,
          name: existingUser.fullName,
          status: existingUser.status,
          role: existingUser.role,
          createdAt: existingUser.createdAt
        },
        credentials: {
          email: 'demo@passport.gov.sd',
          password: 'Demo123456!'
        }
      });
    } else {
      return NextResponse.json({
        exists: false,
        message: 'Demo user does not exist. Call POST to create it.'
      });
    }
  } catch (error) {
    console.error('Error checking demo user:', error);
    return NextResponse.json({
      error: 'Failed to check demo user status',
      details: error.message
    }, { status: 500 });
  }
} 