/**
 * ============================================================================
 * CAMERA PRODUCTS API ROUTE
 * ============================================================================
 *
 * GET /api/products/camera
 * Returns the Camera product catalog live from the "Produits_Cameras" tab,
 * plus the Installation-specific products (INS-1/INS-DEMI-J/INS-J/INS-4G)
 * separately. No fallback: on failure the client shows a clear error rather
 * than stale duplicate data.
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { fetchCameraProductsFromSheet } from '@/lib/services/google-sheets.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { products, installationProducts } = await fetchCameraProductsFromSheet();

    return NextResponse.json({
      success: true,
      data: { products, installationProducts },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Camera products API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Camera products',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
