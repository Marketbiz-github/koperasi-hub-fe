import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  const role = req.cookies.get('role')?.value;
  const path = req.nextUrl.pathname;

  // belum login
  if (!token && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // role protection
  if (path.startsWith('/dashboard/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  if (path.startsWith('/dashboard/vendor') && role !== 'vendor') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (path.startsWith('/dashboard/reseller') && role !== 'reseller') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (path.startsWith('/dashboard/affiliator') && role !== 'affiliator') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
