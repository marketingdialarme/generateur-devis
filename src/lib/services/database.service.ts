/**
 * ============================================================================
 * DATABASE SERVICE
 * ============================================================================
 * 
 * Replaces Google Sheets logging with Supabase database
 * Stores quote history for dashboard and analytics
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  return supabase;
}

export interface QuoteLog {
  id?: string;
  client_name: string;
  commercial: string;
  quote_type: 'alarme' | 'video';
  central_type?: 'titane' | 'jablotron';
  products: string[];
  products_count: number;
  file_name: string;
  drive_url: string;
  email_sent: boolean;
  created_at?: string;
}

export interface DashboardStats {
  totalQuotes: number;
  quotesThisWeek: number;
  quotesThisMonth: number;
  topCommercials: Array<{ commercial: string; count: number }>;
  topProducts: Array<{ product: string; count: number }>;
  quotesByType: Array<{ type: string; count: number }>;
  recentQuotes: QuoteLog[];
}

/**
 * Log a new quote to the database
 */
export async function logQuote(quoteData: Omit<QuoteLog, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await (client
      .from('quotes')
      .insert as any)([
        {
          client_name: quoteData.client_name,
          commercial: quoteData.commercial,
          quote_type: quoteData.quote_type,
          central_type: quoteData.central_type,
          products: quoteData.products,
          products_count: quoteData.products_count,
          file_name: quoteData.file_name,
          drive_url: quoteData.drive_url,
          email_sent: quoteData.email_sent,
        },
      ])
      .select();
    
    if (error) {
      console.error('Error logging quote:', error);
      return false;
    }
    
    console.log('✅ Quote logged to database:', data?.[0]?.id);
    return true;
  } catch (error) {
    console.error('Error in logQuote:', error);
    return false;
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const client = getSupabaseClient();
    
    // Get total quotes
    const { count: totalQuotes } = await client
      .from('quotes')
      .select('*', { count: 'exact', head: true });
    
    // Get quotes this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: quotesThisWeek } = await client
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString());
    
    // Get quotes this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const { count: quotesThisMonth } = await client
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneMonthAgo.toISOString());
    
    // Get top commercials (last 30 days)
    const { data: commercialsData } = await client
      .from('quotes')
      .select('commercial')
      .gte('created_at', oneMonthAgo.toISOString());
    
    const commercialsCount = (commercialsData || []).reduce((acc, item: any) => {
      acc[item.commercial] = (acc[item.commercial] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCommercials = Object.entries(commercialsCount)
      .map(([commercial, count]) => ({ commercial, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Get top products (last 30 days)
    const { data: productsData } = await client
      .from('quotes')
      .select('products')
      .gte('created_at', oneMonthAgo.toISOString());
    
    const productsCount: Record<string, number> = {};
    (productsData || []).forEach((item: any) => {
      if (Array.isArray(item.products)) {
        item.products.forEach((product: string) => {
          productsCount[product] = (productsCount[product] || 0) + 1;
        });
      }
    });
    
    const topProducts = Object.entries(productsCount)
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Get quotes by type
    const { data: typeData } = await client
      .from('quotes')
      .select('quote_type')
      .gte('created_at', oneMonthAgo.toISOString());
    
    const typeCount = (typeData || []).reduce((acc, item: any) => {
      acc[item.quote_type] = (acc[item.quote_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const quotesByType = Object.entries(typeCount)
      .map(([type, count]) => ({ type, count }));
    
    // Get recent quotes
    const { data: recentQuotesData } = await client
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    return {
      totalQuotes: totalQuotes || 0,
      quotesThisWeek: quotesThisWeek || 0,
      quotesThisMonth: quotesThisMonth || 0,
      topCommercials,
      topProducts,
      quotesByType,
      recentQuotes: (recentQuotesData || []) as QuoteLog[],
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    
    // Return empty stats on error
    return {
      totalQuotes: 0,
      quotesThisWeek: 0,
      quotesThisMonth: 0,
      topCommercials: [],
      topProducts: [],
      quotesByType: [],
      recentQuotes: [],
    };
  }
}

/**
 * Get all quotes with optional filtering
 */
export async function getQuotes(options?: {
  commercial?: string;
  quoteType?: 'alarme' | 'video';
  limit?: number;
  offset?: number;
}): Promise<QuoteLog[]> {
  try {
    const client = getSupabaseClient();
    
    let query = client
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (options?.commercial) {
      query = query.eq('commercial', options.commercial);
    }
    
    if (options?.quoteType) {
      query = query.eq('quote_type', options.quoteType);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
    
    return (data || []) as QuoteLog[];
  } catch (error) {
    console.error('Error in getQuotes:', error);
    return [];
  }
}

/**
 * Initialize database schema (run once during setup)
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    
    // Check if table exists by trying to query it
    const { error } = await client
      .from('quotes')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Database table might not exist. Please create it manually using the SQL below:');
      console.log(`
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  commercial TEXT NOT NULL,
  quote_type TEXT NOT NULL,
  central_type TEXT,
  products TEXT[] DEFAULT '{}',
  products_count INTEGER DEFAULT 0,
  file_name TEXT NOT NULL,
  drive_url TEXT NOT NULL,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_commercial ON quotes(commercial);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_type ON quotes(quote_type);
      `);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

