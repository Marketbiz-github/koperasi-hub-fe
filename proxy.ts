import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
  '/dashboard/vendor',
  '/dashboard/admin',
  '/dashboard/koperasi',
  '/dashboard/affiliator',
];

const roleRouteMap: Record<string, string> = {
  vendor: '/dashboard/vendor',
  admin: '/dashboard/admin',
  koperasi: '/dashboard/koperasi',
  affiliator: '/dashboard/affiliator',
};

const oldLoginRoutes = ['/login/vendor', '/login/admin', '/login/koperasi', '/login/affiliator'];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get('access_token')?.value;
  const userRole = request.cookies.get('role')?.value;

  // Redirect old login routes ke /login
  if (oldLoginRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect /dashboard ke role-specific dashboard (hanya jika sudah login)
  if (pathname === '/dashboard') {
    if (accessToken && userRole && roleRouteMap[userRole]) {
      // Sudah login dan role valid, redirect ke dashboard role-nya
      return NextResponse.redirect(new URL(roleRouteMap[userRole], request.url));
    } else if (!accessToken) {
      // Belum login, redirect ke login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Jika ada akses token tapi role tidak valid, biarkan page handle
  }

  // Cek apakah route yang diakses adalah protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Jika tidak ada token, redirect ke login
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Jika ada token, biarkan page load (layoutnya akan handle permission check dan show access denied jika role tidak sesuai)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login/:path*'],
};
