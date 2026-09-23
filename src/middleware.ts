/**
 * ============================================================================
 * MIDDLEWARE — auth gate for /create-devis
 * ============================================================================
 *
 * Runs before the page itself loads (unlike a client-side check, which
 * would flash the real content first) -- an unauthenticated visitor to
 * /create-devis is redirected straight to /login, with ?next=/create-devis
 * so they land back here right after clicking their magic link.
 *
 * Beyond "is there a session" (Supabase's own signInWithOtp will create an
 * account for ANY email by default), this also checks that the session's
 * email is actually listed in the Sheet's Conseillers tab (client
 * decision: that tab is the authoritative allowlist -- conseillers are
 * added there at onboarding, office staff manually). This is the real
 * security boundary: unlike the login page's own pre-check, it can't be
 * bypassed by calling Supabase's client library directly, since it runs
 * server-side on every request to a gated page regardless of how the
 * session was obtained.
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

  const denyToLogin = (message: string) => {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    loginUrl.searchParams.set('error', message);
    return NextResponse.redirect(loginUrl);
  };

  if (!user) {
    return denyToLogin('Connectez-vous pour accéder au générateur de devis');
  }

  if (!user.email) {
    return denyToLogin("Votre compte n'a pas d'adresse email associée");
  }

  try {
    const checkUrl = new URL('/api/auth/authorized', request.nextUrl.origin);
    checkUrl.searchParams.set('email', user.email);
    const checkResponse = await fetch(checkUrl.toString());
    const { authorized } = await checkResponse.json();
    if (!authorized) {
      return denyToLogin("Cette adresse n'est pas autorisée à accéder à l'application");
    }
  } catch (error) {
    // Fail closed: if the authorization check itself can't be reached,
    // deny access rather than silently letting everyone through.
    console.error('❌ Middleware authorization check failed:', error);
    return denyToLogin('Impossible de vérifier votre accès pour le moment, réessayez');
  }

  return response;
}

export const config = {
  matcher: ['/create-devis/:path*'],
};
