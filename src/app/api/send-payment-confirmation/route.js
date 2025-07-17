import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { User } from '@/models/User.js';
import { Application } from '@/models/Application.js';
import emailService from '@/lib/emailService.js';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { payment, applicationNumber } = await request.json();

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment data is required' },
        { status: 400 }
      );
    }

    // Get user information
    const user = User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create mock application object for email
    const application = {
      application_number: applicationNumber,
      id: 'temp'
    };

    // Send payment confirmation email
    const emailResult = await emailService.sendPaymentConfirmationEmail(
      application,
      user,
      payment
    );

    return NextResponse.json({
      message: 'Payment confirmation email sent successfully',
      emailResult
    });

  } catch (error) {
    console.error('Send payment confirmation email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 