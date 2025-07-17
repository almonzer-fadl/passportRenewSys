import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route.js';
import { User } from '../../../../models/User.js';
import { createAuditLog } from '../../../../lib/auditLog.js';

// GET /api/user/profile - Get user profile
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information
    const { password, ...userProfile } = user;

    return NextResponse.json({
      user: userProfile
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    
    // Validate allowed fields for update
    const allowedFields = [
      'first_name', 'last_name', 'middle_name', 'phone', 'address', 
      'city', 'state', 'postal_code', 'country',
      'emergency_contact_name', 'emergency_contact_relationship', 
      'emergency_contact_phone'
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = User.update(session.user.id, filteredUpdates);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    // Log profile update
    await createAuditLog({
      userId: session.user.id,
      action: 'PROFILE_UPDATED',
      resourceType: 'user',
      resourceId: session.user.id,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { 
        updatedFields: Object.keys(filteredUpdates)
      }
    });

    // Remove sensitive information
    const { password, ...userProfile } = updatedUser;

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userProfile
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 