import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // For demo purposes, just return success
    // The actual logout is handled client-side by clearing localStorage
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Logout failed'
    }, { status: 500 });
  }
} 