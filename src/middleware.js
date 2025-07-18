import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // For demo purposes, allow access to all routes
  // In a real application, you would implement proper authentication checks here
  
  // Optional: Add some demo logging
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    console.log(`Demo: Accessing ${pathname}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 