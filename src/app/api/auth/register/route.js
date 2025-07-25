import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import bcrypt from 'bcryptjs';
import { emailService } from '@/lib/emailService';

export async function POST(req) {
  try {
    await dbConnect();

    const { firstName, lastName, email, password, phoneNumber, nationalId } = await req.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phoneNumber || !nationalId) {
      return NextResponse.json(
        { error: 'All fields are required' }, 
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' }, 
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { 'profile.nationalId': nationalId }
      ]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or national ID already exists' }, 
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      role: 'citizen',
      profile: {
        firstName,
        lastName,
        phoneNumber,
        nationalId
      }
    });

    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail({
        firstName,
        lastName,
        email
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Return success without password
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.profile
    };

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userResponse
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
