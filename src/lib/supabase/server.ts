/**
 * ============================================================================
 * SUPABASE SERVER CLIENT
 * ============================================================================
 *
 * For Server Components and Route Handlers. Reads/writes the Supabase auth
 * cookies via next/headers, so `supabase.auth.getUser()` reflects whoever is
 * actually logged in on this request. Uses the anon key (not the service
 * role key) so Postgres RLS still applies — e.g. the "Users can read their
 * own profile" policy on `profiles`.
 * ============================================================================
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component that can't set cookies (e.g. a
            // page render, not a Route Handler / Server Action) — safe to
            // ignore as long as a Route Handler refreshes the session
            // elsewhere (our /auth/callback route does this on sign-in).
          }
        },
      },
    }
  );
}
