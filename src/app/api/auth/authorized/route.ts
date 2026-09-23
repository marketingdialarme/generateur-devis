/**
 * ============================================================================
 * AUTHORIZED-EMAIL CHECK
 * ============================================================================
 *
 * GET /api/auth/authorized?email=...
 * Returns { authorized: boolean } -- true only if the email (case-
 * insensitive) matches a conseiller listed in the Sheet's Conseillers tab.
 * That tab is the source of truth for who may use the app (client
 * decision): conseillers are added there at onboarding, office staff who
 * aren't conseillers are added manually. Reuses fetchCommercialsFromSheet,
 * the same reader /api/commercials already uses, so both stay in sync with
 * a single Sheet read (and its 5-minute cache).
 *
 * Called from both the login page (better UX: reject before sending a
 * magic-link email that would just get blocked) and the middleware (the
 * real security boundary: blocks access even for a session obtained by
 * calling Supabase directly, bypassing the login page's own check).
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchCommercialsFromSheet } from '@/lib/services/google-sheets.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const email = (request.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ authorized: false, error: 'email query param is required' }, { status: 400 });
    }

    const commercials = await fetchCommercialsFromSheet();
    const authorized = Object.values(commercials).some(
      (c) => (c.email || '').trim().toLowerCase() === email
    );

    return NextResponse.json({ authorized });
  } catch (error) {
    console.error('❌ /api/auth/authorized error:', error);
    // Fail closed: if the Sheet can't be read, nobody gets through rather
    // than everybody -- this is a security check, not a convenience one.
    return NextResponse.json(
      { authorized: false, error: error instanceof Error ? error.message : 'Failed to check authorization' },
      { status: 500 }
    );
  }
}
