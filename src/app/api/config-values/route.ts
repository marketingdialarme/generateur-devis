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
import { fetchConfigFromSheet } from '@/lib/services/google-sheets.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await fetchConfigFromSheet();

    return NextResponse.json({
      success: true,
      data: { config },
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
