/**
 * ============================================================================
 * VISIOPHONE PRODUCTS API ROUTE
 * ============================================================================
 *
 * GET /api/products/visiophone
 * Returns the Visiophone product catalog live from the "Produits_Visiophone"
 * tab of the Google Sheet configured via GOOGLE_SHEETS_ID. Falls back to the
 * hardcoded catalog on failure (see fetchVisiophoneProductsFromSheet) so a
 * broken sheet connection never blocks quote generation.
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { fetchVisiophoneProductsFromSheet } from '@/lib/services/google-sheets.service';

// Same reasoning as /api/commercials: without this, Next statically
// prerenders the handler at build time and a Sheet edit never appears
// until the next redeploy.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await fetchVisiophoneProductsFromSheet();

    return NextResponse.json({
      success: true,
      data: { products },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Visiophone products API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Visiophone products',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
