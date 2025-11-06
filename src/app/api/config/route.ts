/**
 * ============================================================================
 * CONFIGURATION API ROUTE
 * ============================================================================
 * 
 * GET /api/config
 * Returns public configuration data (commercials list, etc.)
 * 
 * Provides configuration to the frontend without exposing sensitive data
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { getAllCommercials, CONFIG, validateConfig } from '@/lib/config';

export async function GET() {
  try {
    // Validate configuration
    const validation = validateConfig();
    
    if (!validation.valid) {
      console.warn('⚠️ Configuration validation warnings:', validation.errors);
    }
    
    // Return public configuration
    return NextResponse.json({
      success: true,
      data: {
        commercials: getAllCommercials(),
        app: {
          name: CONFIG.app.name,
          version: CONFIG.app.version,
        },
        configValid: validation.valid,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Config API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Configuration fetch failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

