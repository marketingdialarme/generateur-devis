/**
 * ============================================================================
 * MIDDLEWARE — auth gate for /create-devis
 * ============================================================================
 *
 * Runs before the page itself loads (unlike a client-side check, which
 * would flash the real content first) -- an unauthenticated visitor to
 * /create-devis is redirected straight to /login, with ?next=/create-devis
 * so they land back here right after clicking their magic link. Anyone
 * without a Dialarme account link simply never sees the quote generator
 * (client feedback).
 * ============================================================================
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/create-devis/:path*'],
};
