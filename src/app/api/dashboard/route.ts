/**
 * ============================================================================
 * DASHBOARD DATA API ROUTE
 * ============================================================================
 * 
 * GET /api/dashboard
 * Returns dashboard statistics and analytics
 * 
 * Provides data for the dashboard visualization
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats, getQuotes } from '@/lib/services/database.service';
import { z } from 'zod';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Query params validation
const DashboardQuerySchema = z.object({
  commercial: z.string().optional(),
  quoteType: z.enum(['alarme', 'video']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if it's a stats request or quotes list request
    const action = searchParams.get('action');
    
    if (action === 'stats' || !action) {
      // Get dashboard statistics
      console.log('📊 Fetching dashboard stats...');
      const stats = await getDashboardStats();
      
      return NextResponse.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    }
    
    if (action === 'quotes') {
      // Get filtered quotes list
      const params = {
        commercial: searchParams.get('commercial') || undefined,
        quoteType: searchParams.get('quoteType') as 'alarme' | 'video' | undefined,
        limit: parseInt(searchParams.get('limit') || '20'),
        offset: parseInt(searchParams.get('offset') || '0'),
      };
      
      const validatedParams = DashboardQuerySchema.parse(params);
      
      console.log('📋 Fetching quotes list:', validatedParams);
      const quotes = await getQuotes(validatedParams);
      
      return NextResponse.json({
        success: true,
        data: quotes,
        count: quotes.length,
        params: validatedParams,
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action. Use ?action=stats or ?action=quotes',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Dashboard API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Dashboard data fetch failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

