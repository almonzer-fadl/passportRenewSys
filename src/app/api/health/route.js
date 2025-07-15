import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    // Check database connection
    await connectDB();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      database: 'connected',
      services: {
        authentication: 'operational',
        fileUpload: 'operational',
        payment: 'operational'
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    return NextResponse.json(healthStatus, { status: 200 });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      database: 'disconnected',
      error: error.message,
      services: {
        authentication: 'unknown',
        fileUpload: 'unknown',
        payment: 'unknown'
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    return NextResponse.json(healthStatus, { status: 503 });
  }
} 