/**
 * ============================================================================
 * AUTH CALLBACK ROUTE
 * ============================================================================
 *
 * Where Supabase sends the conseiller after they click the magic link in
 * their email. Exchanges the one-time code for a real session (sets the
 * auth cookies via the server client), then redirects to wherever the
 * login page asked for (?next=/mes-devis).
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/mes-devis';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code, or the exchange failed (expired/already-used link) — send back
  // to login with a message rather than a bare error page.
  return NextResponse.redirect(`${origin}/login?error=Lien invalide ou expiré, redemandez-en un`);
}
