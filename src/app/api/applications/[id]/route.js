import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db';
import Application from '@/models/application';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const application = await Application.findById(params.id)
      .populate('userId', 'email profile.firstName profile.lastName')
      .populate('review.reviewedBy', 'profile.firstName profile.lastName');

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check permissions
    const isOwner = application.userId._id.toString() === session.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(session.user.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ application });

  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const application = await Application.findById(params.id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check permissions
    const isOwner = application.userId.toString() === session.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(session.user.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();

    // Citizens can only update draft applications
    if (isOwner && !isAdmin && application.status !== 'draft') {
      return NextResponse.json({ 
        error: 'Cannot update application after submission' 
      }, { status: 400 });
    }

    // Update application
    Object.assign(application, data);
    application.updatedAt = new Date();
    
    await application.save();

    return NextResponse.json({
      message: 'Application updated successfully',
      application
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const application = await Application.findById(params.id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check permissions - only owner or admin can delete
    const isOwner = application.userId.toString() === session.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(session.user.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow deletion of draft applications
    if (application.status !== 'draft') {
      return NextResponse.json({ 
        error: 'Cannot delete submitted application' 
      }, { status: 400 });
    }

    await Application.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Application deleted successfully' });

  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 