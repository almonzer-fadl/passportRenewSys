import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/application';
import { emailService } from '@/lib/emailService';

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

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    const application = await Application.findById(params.id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const data = await req.json();

    // For status updates, add review information
    if (data.status) {
      const oldStatus = application.status;
      application.status = data.status;
      application.updatedAt = new Date();
      
      // Add review information if status is being changed
      if (data.status !== oldStatus) {
        application.review = {
          ...application.review,
          status: data.status,
          reviewedAt: new Date(),
          reviewedBy: 'admin-user', // In a real app, this would be the actual admin user ID
          notes: data.notes || ''
        };
      }
    }

    // Update other fields if provided
    if (data.notes) {
      application.review = {
        ...application.review,
        notes: data.notes,
        reviewedAt: new Date()
      };
    }
    
    await application.save();

    // Send status update email if status changed
    if (data.status && data.status !== application.status) {
      try {
        // Get user data from application
        const userData = {
          firstName: application.personalInfo?.firstName || 'User',
          lastName: application.personalInfo?.lastName || 'Demo',
          email: application.contactInfo?.email || 'demo@example.com'
        };
        
        await emailService.sendStatusUpdate(
          userData, 
          { applicationNumber: application.applicationNumber },
          data.status,
          data.notes || ''
        );
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    return NextResponse.json({
      message: 'Application status updated successfully',
      application
    });

  } catch (error) {
    console.error('Error updating application status:', error);
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