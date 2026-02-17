import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
  '/dashboard/vendor',
  '/dashboard/super_admin',
  '/dashboard/koperasi',
  '/dashboard/affiliator',
  '/dashboard/reseller',
];

const roleRouteMap: Record<string, string> = {
  vendor: '/dashboard/vendor',
  super_admin: '/dashboard/super_admin',
  koperasi: '/dashboard/koperasi',
  affiliator: '/dashboard/affiliator',
  reseller: '/dashboard/reseller',
};

const oldLoginRoutes = ['/login/vendor', '/login/super_admin', '/login/koperasi', '/login/affiliator'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;
  const userRole = request.cookies.get('role')?.value;

  // 1. Redirect old login routes to /login
  if (oldLoginRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Redirect authenticated users away from /login or /register
  if (accessToken && (pathname === '/login' || pathname.startsWith('/register'))) {
    if (userRole && roleRouteMap[userRole]) {
      return NextResponse.redirect(new URL(roleRouteMap[userRole], request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Handle /dashboard landing page redirect
  if (pathname === '/dashboard') {
    if (accessToken && userRole && roleRouteMap[userRole]) {
      return NextResponse.redirect(new URL(roleRouteMap[userRole], request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Protect dashboard routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Role-based access within protected routes
  // (Optional: can be added here if we want strictly strict middleware checks)
  // For now, layouts handle specific permission checks for better UI/UX (Access Denied page).

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register/:path*',
  ],
};
