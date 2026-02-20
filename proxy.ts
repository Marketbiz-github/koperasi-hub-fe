import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
  '/dashboard/vendor',
  '/dashboard/super_admin',
  '/dashboard/koperasi',
  '/dashboard/promotor',
  '/dashboard/reseller',
];

const roleRouteMap: Record<string, string> = {
  vendor: '/dashboard/vendor',
  super_admin: '/dashboard/super_admin',
  koperasi: '/dashboard/koperasi',
  affiliator: '/dashboard/promotor',
  reseller: '/dashboard/reseller',
};

const oldLoginRoutes = ['/login/vendor', '/login/super_admin', '/login/koperasi', '/login/affiliator'];

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;
  const hostname = request.headers.get('host') || '';
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

  // 4. Protect dashboard routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // --- Subdomain / Multi-tenant Logic ---
  const mainDomains = [
    'koperasi-hub-fe.test',
    'localhost:3000',
    'koperasihub.com',
    'koperasi-hub-fe.vercel.app'
  ];

  let subdomain = '';
  if (hostname.endsWith('.koperasi-hub-fe.test')) {
    subdomain = hostname.replace('.koperasi-hub-fe.test', '');
  } else if (hostname.endsWith('.localhost:3000')) {
    subdomain = hostname.replace('.localhost:3000', '');
  } else if (!mainDomains.includes(hostname)) {
    subdomain = hostname;
  } else if (hostname.endsWith('.koperasi-hub-fe.vercel.app')) {
    subdomain = hostname.replace('.koperasi-hub-fe.vercel.app', '');
  }

  if (subdomain && subdomain !== 'www' && !mainDomains.includes(hostname)) {
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/static') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/store/${subdomain}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
