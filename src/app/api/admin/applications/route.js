import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { Application } from '@/models/Application.js';
import { User } from '@/models/User.js';
import getDatabase from '@/lib/database.js';

const db = getDatabase();

// GET /api/admin/applications - Get all applications (admin only)
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    // Build the SQL query
    let whereConditions = [];
    let params = [];

    if (status && status !== 'all') {
      whereConditions.push('a.status = ?');
      params.push(status);
    }

    if (type && type !== 'all') {
      whereConditions.push('a.application_type = ?');
      params.push(type);
    }

    if (search) {
      whereConditions.push(`(
        a.application_number LIKE ? OR 
        u.first_name LIKE ? OR 
        u.last_name LIKE ? OR 
        u.email LIKE ?
      )`);
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get applications with user information
    const applicationsQuery = `
      SELECT 
        a.*,
        u.first_name,
        u.last_name,
        u.email,
        (u.first_name || ' ' || u.last_name) as user_name,
        u.email as user_email
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, (page - 1) * limit);
    const stmt = db.prepare(applicationsQuery);
    const applications = stmt.all(...params);

    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as underReview,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM applications
    `;
    
    const statsStmt = db.prepare(statsQuery);
    const stats = statsStmt.get();

    return NextResponse.json({
      applications,
      stats: {
        total: stats.total,
        pending: stats.pending,
        underReview: stats.underReview,
        approved: stats.approved,
        rejected: stats.rejected
      },
      pagination: {
        page,
        limit,
        total: stats.total,
        pages: Math.ceil(stats.total / limit)
      }
    });

  } catch (error) {
    console.error('Admin applications fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 