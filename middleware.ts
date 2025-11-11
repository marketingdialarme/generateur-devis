/**
 * ============================================================================
 * MIDDLEWARE - Edge-level routing and redirects
 * ============================================================================
 * 
 * Runs on Vercel Edge Network before any page rendering
 * Handles global redirects at the fastest possible layer
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect root path to quote generator
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/create-devis', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/',
};

