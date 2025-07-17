import { NextResponse } from 'next/server';
import { User } from '@/models/User.js';
import { createAuditLog } from '@/lib/auditLog.js';

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

    // Check if user already exists
    const existingUserByEmail = User.findByEmail(email.toLowerCase());
    const existingUserByNationalId = User.findByNationalId(nationalId);

    if (existingUserByEmail) {
      // Log registration attempt with existing email
      await createAuditLog({
        action: 'REGISTRATION_FAILED',
        resourceType: 'authentication',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { 
          email: email,
          reason: 'email_already_exists'
        }
      });

      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    if (existingUserByNationalId) {
      // Log registration attempt with existing national ID
      await createAuditLog({
        action: 'REGISTRATION_FAILED',
        resourceType: 'authentication',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { 
          nationalId: nationalId,
          reason: 'national_id_already_exists'
        }
      });

      return NextResponse.json(
        { error: 'An account with this national ID already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const userData = {
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nationalId: nationalId.trim(),
      phone: phoneNumber.trim(),
      dateOfBirth: birthDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      address: address.street.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      postalCode: address.postalCode?.trim() || '',
      country: 'Sudan'
    };

    const newUser = await User.create(userData);

    // Log successful registration
    await createAuditLog({
      userId: newUser.id,
      action: 'USER_REGISTERED',
      resourceType: 'user',
      resourceId: newUser.id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { 
        email: newUser.email,
        registration_method: 'web_form'
      }
    });

    return NextResponse.json(
      {
        message: 'Account created successfully. You can now log in.',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 