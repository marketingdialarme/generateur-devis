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
import { linkConseillerProfile } from '@/lib/services/database.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/mes-devis';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Best-effort: if this account isn't linked to a conseiller yet, try
      // to match it against the Conseillers Sheet by email. Doesn't block
      // the redirect either way -- /mes-devis shows a clear message if no
      // match was found, and can retry the link itself too.
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        await linkConseillerProfile(user.id, user.email).catch((e) =>
          console.error('linkConseillerProfile failed in /auth/callback:', e)
        );
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code, or the exchange failed (expired/already-used link) — send back
  // to login with a message rather than a bare error page.
  return NextResponse.redirect(`${origin}/login?error=Lien invalide ou expiré, redemandez-en un`);
}
