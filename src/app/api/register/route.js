import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User, AuditLog } from '@/models';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      nationalId,
      phoneNumber,
      dateOfBirth,
      address
    } = body;

    // Input validation
    if (!email || !password || !confirmPassword || !firstName || !lastName || 
        !nationalId || !phoneNumber || !dateOfBirth || !address) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Password validation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // National ID validation (Sudan format - 10 digits)
    const nationalIdRegex = /^[0-9]{10}$/;
    if (!nationalIdRegex.test(nationalId)) {
      return NextResponse.json(
        { error: 'National ID must be exactly 10 digits' },
        { status: 400 }
      );
    }

    // Phone number validation (Sudan format)
    const phoneRegex = /^\+249[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Phone number must be in format +249xxxxxxxxx' },
        { status: 400 }
      );
    }

    // Date of birth validation
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 18) {
      return NextResponse.json(
        { error: 'You must be at least 18 years old to apply for a passport' },
        { status: 400 }
      );
    }

    if (birthDate >= today) {
      return NextResponse.json(
        { error: 'Date of birth must be in the past' },
        { status: 400 }
      );
    }

    // Address validation
    if (!address.street || !address.city || !address.state) {
      return NextResponse.json(
        { error: 'Complete address (street, city, state) is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { nationalId: nationalId }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'national ID';
      
      // Log registration attempt with existing credentials
      await AuditLog.logSecurityEvent(
        'user_created',
        `Registration attempt with existing ${field}: ${field === 'email' ? email : nationalId}`,
        {
          ipAddress: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        },
        'medium',
        60
      );

      return NextResponse.json(
        { error: `An account with this ${field} already exists` },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nationalId: nationalId.trim(),
      phoneNumber: phoneNumber.trim(),
      dateOfBirth: birthDate,
      address: {
        street: address.street.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        postalCode: address.postalCode?.trim() || '',
        country: 'Sudan'
      },
      status: 'pending', // Requires email verification
      role: 'citizen'
    });

    // Generate email verification token
    const verificationToken = newUser.generateVerificationToken();
    
    await newUser.save();

    // Log successful registration
    await AuditLog.logUserAction(
      'user_created',
      newUser._id,
      `New user registered: ${email}`,
      {
        resourceType: 'user',
        resourceId: newUser._id.toString(),
        resourceName: newUser.fullName
      },
      {
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    );

    // TODO: Send verification email
    // await sendVerificationEmail(newUser.email, verificationToken);

    return NextResponse.json(
      {
        message: 'Account created successfully. Please check your email to verify your account.',
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          status: newUser.status
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);

    // Log system error
    await AuditLog.logSystemEvent(
      'api_error',
      `Registration API error: ${error.message}`,
      {
        resourceType: 'api',
        resourceId: '/api/register'
      },
      'high',
      {
        response: {
          statusCode: 500,
          errorMessage: error.message
        }
      }
    );

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 