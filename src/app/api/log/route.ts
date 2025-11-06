/**
 * ============================================================================
 * QUOTE LOGGING API ROUTE
 * ============================================================================
 * 
 * POST /api/log
 * Logs quote information to Supabase for dashboard and analytics
 * 
 * Replaces Google Apps Script logging to Google Sheets
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { logQuote } from '@/lib/services/database.service';
import { z } from 'zod';

// Request validation schema
const LogRequestSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  commercial: z.string().min(1, 'Commercial is required'),
  quoteType: z.enum(['alarme', 'video']),
  centralType: z.enum(['titane', 'jablotron']).optional(),
  products: z.array(z.string()).default([]),
  fileName: z.string().min(1, 'File name is required'),
  driveUrl: z.string().url('Valid Drive URL is required'),
  emailSent: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = LogRequestSchema.parse(body);
    
    console.log('📊 Logging Quote:', {
      client: validatedData.clientName,
      commercial: validatedData.commercial,
      type: validatedData.quoteType,
    });
    
    // Log to database
    const success = await logQuote({
      client_name: validatedData.clientName,
      commercial: validatedData.commercial,
      quote_type: validatedData.quoteType,
      central_type: validatedData.centralType,
      products: validatedData.products,
      products_count: validatedData.products.length,
      file_name: validatedData.fileName,
      drive_url: validatedData.driveUrl,
      email_sent: validatedData.emailSent,
    });
    
    if (success) {
      console.log('✅ Quote logged successfully');
    } else {
      console.error('⚠️ Quote logging failed (non-critical)');
    }
    
    return NextResponse.json({
      success,
      message: success ? 'Quote logged successfully' : 'Logging failed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Logging error:', error);
    
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
    
    // Non-critical error - return success to not block main flow
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Logging failed',
        timestamp: new Date().toISOString(),
      },
      { status: 200 } // 200 to not break the flow
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Quote Logging API',
    methods: ['POST'],
    timestamp: new Date().toISOString(),
  });
}

