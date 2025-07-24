import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
}

export async function POST(req) {
  try {
    const data = await req.json();
    return NextResponse.json({ 
      message: 'POST request received',
      data: data,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid JSON',
      status: 'error'
    }, { status: 400 });
  }
} 