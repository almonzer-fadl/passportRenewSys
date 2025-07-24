import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Demo authentication
    const demoUsers = [
      {
        id: '1',
        email: 'demo@passport.gov.sd',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user'
      },
      {
        id: '2',
        email: 'admin@passport.gov.sd',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    ];

    const user = demoUsers.find(u => 
      u.email === email && u.password === password
    );

    if (user) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        message: 'Authentication successful'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request'
    }, { status: 400 });
  }
} 