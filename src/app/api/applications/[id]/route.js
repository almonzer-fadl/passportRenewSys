import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/application';

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const application = await Application.findById(params.id)
      .populate('userId', 'email profile.firstName profile.lastName')
      .populate('review.reviewedBy', 'profile.firstName profile.lastName');

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application });

  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const application = await Application.findById(params.id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const data = await req.json();

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
    await dbConnect();

    const application = await Application.findById(params.id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
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