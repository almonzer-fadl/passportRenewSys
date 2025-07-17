import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { Document } from '@/models/Document.js';

// GET /api/admin/applications/[id]/documents - Get documents for a specific application
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Simple admin check - in production, use proper role management
    if (session.user.email !== 'demo@passport.gov.sd') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Get documents for the application
    const documents = Document.findByApplicationId(id);

    return NextResponse.json({
      documents
    });

  } catch (error) {
    console.error('Get application documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 