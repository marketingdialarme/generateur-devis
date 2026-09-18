/**
 * ============================================================================
 * CONFIG VALUES API ROUTE
 * ============================================================================
 *
 * GET /api/config-values
 * Returns the "Config" tab as a flat { REF: number } map — TVA, SIM, FD,
 * the Alarme surveillance service prices, and the Camera vision-à-distance/
 * maintenance prices. Named differently from the existing /api/config
 * (which serves the commercials list) to avoid confusion.
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { fetchConfigFromSheet, fetchPropertyTypeLabelsFromSheet } from '@/lib/services/google-sheets.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [config, propertyTypes] = await Promise.all([
      fetchConfigFromSheet(),
      fetchPropertyTypeLabelsFromSheet().catch((err) => {
        // Property-type labels are a smaller, separate concern -- don't
        // fail the whole (heavily-used) config-values endpoint over them.
        console.error('⚠️ Property type labels unavailable, falling back:', err);
        return null;
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { config, propertyTypes },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Config values API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Config values',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
