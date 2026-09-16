/**
 * ============================================================================
 * FOG PRODUCTS API ROUTE
 * ============================================================================
 *
 * GET /api/products/fog
 * Returns the "Générateur de brouillard" product catalog live from the
 * "Produits_Générateur_de_brouillard" tab of the Google Sheet configured via
 * GOOGLE_SHEETS_ID. No fallback: on failure the client shows a clear error
 * rather than stale duplicate data (see fetchFogProductsFromSheet).
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { fetchFogProductsFromSheet } from '@/lib/services/google-sheets.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await fetchFogProductsFromSheet();

    return NextResponse.json({
      success: true,
      data: { products },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Fog products API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Fog products',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
