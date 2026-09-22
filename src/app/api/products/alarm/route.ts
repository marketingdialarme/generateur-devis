/**
 * ============================================================================
 * ALARM PRODUCTS API ROUTE
 * ============================================================================
 *
 * GET /api/products/alarm
 * Returns the product catalog live from the "Produits_Alarme" tab for
 * every known centrale (Titane, Jablotron, or a future one added via the
 * Sheet -- see fetchAlarmCentralsFromSheet), plus the kit-inclusion map
 * used to build the "Kit 1"/"Kit 2" quick-apply buttons, and the list of
 * centrales themselves (from Kit_Base_Alarme) so the UI can build its
 * centrale-choice cards without a hardcoded Titane/Jablotron list. Also
 * returns xtoProducts (the location "Chantier" catalog, same sheet,
 * XTO- refs) and its own KIT-XTO entry in the kits map.
 *
 * No fallback: on failure the client shows a clear error rather than stale
 * duplicate data.
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { fetchAlarmProductsFromSheet, fetchAlarmCentralsFromSheet } from '@/lib/services/google-sheets.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [{ products, xtoProducts, kits, installationPrices }, centrals] = await Promise.all([
      fetchAlarmProductsFromSheet(),
      fetchAlarmCentralsFromSheet(),
    ]);

    return NextResponse.json({
      success: true,
      data: { products, xtoProducts, kits, installationPrices, centrals },
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
