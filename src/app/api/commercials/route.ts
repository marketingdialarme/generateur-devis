/**
 * ============================================================================
 * COMMERCIALS API ROUTE
 * ============================================================================
 *
 * GET /api/commercials
 * Returns the commercial/conseiller directory live from the "Conseiller" tab
 * of the Google Sheet configured via GOOGLE_SHEETS_ID. No static fallback —
 * on failure the client is expected to show the dropdown as unavailable
 * rather than silently serving stale hardcoded names.
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { fetchCommercialsFromSheet } from '@/lib/services/google-sheets.service';

export async function GET() {
  try {
    const commercials = await fetchCommercialsFromSheet();

    return NextResponse.json({
      success: true,
      data: { commercials },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Commercials API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch commercials',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
