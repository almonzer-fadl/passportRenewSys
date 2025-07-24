import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/register',
    '/api/test',
    '/auth-test'
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')
  );

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/apply',
    '/profile',
    '/admin'
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Admin routes that require admin role
  const adminRoutes = [
    '/admin'
  ];

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // For demo purposes, we'll allow access but log the protection
  // In a real application, you would check for valid JWT tokens or session cookies
  
  if (isProtectedRoute) {
    console.log(`🔒 Protected route accessed: ${pathname}`);
  }

  if (isAdminRoute) {
    console.log(`👑 Admin route accessed: ${pathname}`);
  }

  // In a real application, you would implement proper authentication checks here:
  // 1. Check for valid JWT token in Authorization header or session cookie
  // 2. Verify token with your authentication service
  // 3. For admin routes, check if user has admin role
  // 4. Redirect to login if not authenticated
  // 5. Redirect to dashboard if not admin but trying to access admin routes

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