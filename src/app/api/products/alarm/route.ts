/**
 * ============================================================================
 * ALARM PRODUCTS API ROUTE
 * ============================================================================
 *
 * GET /api/products/alarm
 * Returns the Titane/Jablotron product catalog live from the
 * "Produits_Alarme" tab, plus the kit-inclusion map used to build the
 * "Kit 1"/"Kit 2" quick-apply buttons. XTO is NOT included here — it stays
 * on its own hardcoded rental-pricing model for now (see
 * fetchAlarmProductsFromSheet's doc comment for why).
 *
 * No fallback: on failure the client shows a clear error rather than stale
 * duplicate data.
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { fetchAlarmProductsFromSheet } from '@/lib/services/google-sheets.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { products, kits } = await fetchAlarmProductsFromSheet();

    return NextResponse.json({
      success: true,
      data: { products, kits },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Alarm products API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Alarm products',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
