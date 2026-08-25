import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // ---- Admin panel: everything under /admin except /admin/login ----
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('lt_admin_session')?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // ---- Client dashboard (clients only) ----
  if (pathname.startsWith('/dashboard')) {
    const token = req.cookies.get('lt_session')?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || (payload.role !== 'client' && payload.role !== 'lawyer')) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (payload.role === 'lawyer') {
      const url = req.nextUrl.clone();
      url.pathname = '/lawyer-dashboard';
      return NextResponse.redirect(url);
    }
  }

  // ---- Lawyer dashboard (lawyers only) ----
  if (pathname.startsWith('/lawyer-dashboard')) {
    const token = req.cookies.get('lt_session')?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || (payload.role !== 'client' && payload.role !== 'lawyer')) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (payload.role === 'client') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/lawyer-dashboard/:path*'],
};
