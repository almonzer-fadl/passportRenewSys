import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login?error=unauthorized', req.url));
      }
      // For now, allow access to admin routes for any authenticated user
      // You can implement proper role checking later
    }

    // Dashboard routes protection
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(pathname), req.url));
      }
    }

    // API routes protection
    if (pathname.startsWith('/api/')) {
      // Public API routes (no authentication required)
      const publicApiRoutes = [
        '/api/auth',
        '/api/register',
        '/api/health',
        '/api/public'
      ];

      const isPublicRoute = publicApiRoutes.some(route => pathname.startsWith(route));
      
      if (!isPublicRoute && !token) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }

      // Admin API routes protection
      if (pathname.startsWith('/api/admin')) {
        if (!token) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'Admin access required' },
            { status: 403 }
          );
        }
        // For now, allow access to admin API routes for any authenticated user
        // You can implement proper role checking later
      }
    }

    // Application routes protection
    if (pathname.startsWith('/applications')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(pathname), req.url));
      }
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith('/auth/') && token) {
      const authPages = ['/auth/login', '/auth/register'];
      if (authPages.includes(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes
        const publicRoutes = [
          '/',
          '/about',
          '/contact',
          '/privacy',
          '/terms',
          '/auth/login',
          '/auth/register',
          '/auth/error',
          '/auth/verify-request',
  
        ];

        if (publicRoutes.includes(pathname)) {
          return true;
        }

        // Allow access to API auth routes
        if (pathname.startsWith('/api/auth/')) {
          return true;
        }

        // Allow access to public API routes
        if (pathname.startsWith('/api/register') || pathname.startsWith('/api/health')) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

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