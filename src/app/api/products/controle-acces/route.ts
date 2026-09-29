/**
 * ============================================================================
 * CONTRÔLE D'ACCÈS PRODUCTS API ROUTE
 * ============================================================================
 *
 * GET /api/products/controle-acces
 * Returns the Contrôle d'accès product catalog live from the
 * "Produits_Controle_Acces" tab of the Google Sheet. Mirrors
 * /api/products/visiophone exactly.
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { fetchControleAccesProductsFromSheet } from '@/lib/services/google-sheets.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { products, installationPrice, defaultKit } = await fetchControleAccesProductsFromSheet();

    return NextResponse.json({
      success: true,
      data: { products, installationPrice, defaultKit },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Contrôle d\'accès products API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Contrôle d\'accès products',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
