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
import { createSupabaseServerClient } from '@/lib/supabase/server';
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
    // Previously wide open — anyone with the URL could pull every
    // conseiller's quote history. Now requires a logged-in session, and for
    // the 'quotes' action the 'commercial' param is forced to the caller's
    // own resolved name below (no admin role exists yet, so nobody can
    // query anyone else's history through this route).
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

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
      const { data: profile } = await supabase
        .from('profiles')
        .select('commercial_name')
        .eq('user_id', user.id)
        .single();

      if (!profile?.commercial_name) {
        return NextResponse.json(
          { success: false, error: "Compte non relié à un nom de conseiller" },
          { status: 403 }
        );
      }

      // Get filtered quotes list — commercial is always the caller's own
      // name, regardless of what (if anything) was passed in the query.
      const params = {
        commercial: profile.commercial_name,
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

