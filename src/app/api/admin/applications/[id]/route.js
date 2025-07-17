import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route.js';
import { Application } from '../../../../../models/Application.js';
import { User } from '../../../../../models/User.js';
import getDatabase from '../../../../../lib/database.js';

const db = getDatabase();

// GET /api/admin/applications/[id] - Get specific application details
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

    // Get application with user information
    const applicationQuery = `
      SELECT 
        a.*,
        u.first_name,
        u.last_name,
        u.middle_name,
        u.email,
        u.phone,
        u.date_of_birth,
        u.place_of_birth,
        u.gender,
        u.nationality,
        u.national_id,
        u.address,
        u.city,
        u.state,
        u.country,
        u.emergency_contact_name,
        u.emergency_contact_relationship,
        u.emergency_contact_phone
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `;

    const stmt = db.prepare(applicationQuery);
    const result = stmt.get(id);

    if (!result) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Separate application and user data
    const application = {
      id: result.id,
      application_number: result.application_number,
      user_id: result.user_id,
      application_type: result.application_type,
      processing_speed: result.processing_speed,
      current_passport_number: result.current_passport_number,
      current_passport_issue_date: result.current_passport_issue_date,
      current_passport_expiry_date: result.current_passport_expiry_date,
      current_passport_issuing_office: result.current_passport_issuing_office,
      current_passport_status: result.current_passport_status,
      replacement_reason: result.replacement_reason,
      travel_purpose: result.travel_purpose,
      travel_countries: result.travel_countries,
      travel_departure_date: result.travel_departure_date,
      travel_return_date: result.travel_return_date,
      status: result.status,
      submitted_at: result.submitted_at,
      reviewed_at: result.reviewed_at,
      reviewed_by: result.reviewed_by,
      notes: result.notes,
      base_fee: result.base_fee,
      express_fee: result.express_fee,
      service_fee: result.service_fee,
      total_fee: result.total_fee,
      created_at: result.created_at,
      updated_at: result.updated_at
    };

    const user = result.first_name ? {
      id: result.user_id,
      first_name: result.first_name,
      last_name: result.last_name,
      middle_name: result.middle_name,
      email: result.email,
      phone: result.phone,
      date_of_birth: result.date_of_birth,
      place_of_birth: result.place_of_birth,
      gender: result.gender,
      nationality: result.nationality,
      national_id: result.national_id,
      address: result.address,
      city: result.city,
      state: result.state,
      country: result.country,
      emergency_contact_name: result.emergency_contact_name,
      emergency_contact_relationship: result.emergency_contact_relationship,
      emergency_contact_phone: result.emergency_contact_phone
    } : null;

    return NextResponse.json({
      application,
      user
    });

  } catch (error) {
    console.error('Get application details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 