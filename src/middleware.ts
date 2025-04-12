import { NextRequest, NextResponse } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/trains',
  '/schedules',
  '/pnr',
  '/contact',
  '/about',
  '/faq'
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public or static file
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/api/stations') ||
    pathname.startsWith('/api/trains') ||
    pathname.startsWith('/api/schedules') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Get the token from the cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // If no token is present, redirect to login
  if (!token) {
    console.log('No auth token found, redirecting to login');
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // Since we can't use jsonwebtoken in Edge runtime,
  // we'll just check if the token exists and let the API routes
  // handle validation for specific data access
  
  return NextResponse.next();
}

// Configure matcher for middleware
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/auth routes (login, register)
     * 2. Static files (_next, public)
     * 3. favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 