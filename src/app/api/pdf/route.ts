/**
 * ============================================================================
 * PDF GENERATION API ROUTE
 * ============================================================================
 * 
 * POST /api/pdf
 * Generates a complete PDF quote with base template and product sheets
 * 
 * Replaces the Google Apps Script PDF assembly logic
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCompletePdf, createQuotePdf } from '@/lib/services/pdf.service';
import { z } from 'zod';

// Request validation schema
const QuoteRequestSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  commercial: z.string().min(1, 'Commercial is required'),
  quoteType: z.enum(['alarme', 'video'], {
    errorMap: () => ({ message: 'Quote type must be "alarme" or "video"' }),
  }),
  centralType: z.enum(['titane', 'jablotron']).optional(),
  products: z.array(z.string()).default([]),
  includeAccessories: z.boolean().default(false),
  addCommercialOverlay: z.boolean().default(true),
  // Optional: pre-generated quote PDF as base64
  quotePdfBase64: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = QuoteRequestSchema.parse(body);
    
    console.log('📄 PDF Generation Request:', {
      client: validatedData.clientName,
      commercial: validatedData.commercial,
      type: validatedData.quoteType,
      productsCount: validatedData.products.length,
    });
    
    // Generate or use provided quote PDF
    let quotePdfBuffer: Buffer;
    
    if (validatedData.quotePdfBase64) {
      // Use provided quote PDF
      console.log('📥 Using provided quote PDF (base64)');
      quotePdfBuffer = Buffer.from(validatedData.quotePdfBase64, 'base64');
    } else {
      // Generate basic quote PDF from data
      console.log('📝 Generating quote PDF from data');
      quotePdfBuffer = await createQuotePdf({
        clientName: validatedData.clientName,
        commercial: validatedData.commercial,
        quoteType: validatedData.quoteType,
        centralType: validatedData.centralType,
        products: validatedData.products,
        includeAccessories: validatedData.includeAccessories,
        addCommercialOverlay: validatedData.addCommercialOverlay,
      });
    }
    
    // Generate complete PDF with assembly
    const result = await generateCompletePdf(
      {
        clientName: validatedData.clientName,
        commercial: validatedData.commercial,
        quoteType: validatedData.quoteType,
        centralType: validatedData.centralType,
        products: validatedData.products,
        includeAccessories: validatedData.includeAccessories,
        addCommercialOverlay: validatedData.addCommercialOverlay,
      },
      quotePdfBuffer
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ PDF generated successfully in ${duration}s`);
    
    // Return PDF as base64
    return NextResponse.json({
      success: true,
      pdfBase64: result.pdfBuffer.toString('base64'),
      fileName: result.fileName,
      assemblyInfo: result.assemblyInfo,
      duration: parseFloat(duration),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    
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
        error: error instanceof Error ? error.message : 'PDF generation failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'PDF Generation API',
    methods: ['POST'],
    timestamp: new Date().toISOString(),
  });
}

