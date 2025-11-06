/**
 * ============================================================================
 * EMAIL SENDING API ROUTE
 * ============================================================================
 * 
 * POST /api/email
 * Sends quote email with PDF attachment
 * 
 * Replaces Google Apps Script MailApp.sendEmail() functionality
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteEmail, sendTestEmail } from '@/lib/services/email.service';
import { z } from 'zod';

// Request validation schema
const EmailRequestSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  commercial: z.string().min(1, 'Commercial is required'),
  fileName: z.string().min(1, 'File name is required'),
  pdfBase64: z.string().min(1, 'PDF data is required'),
  assemblyInfo: z.object({
    baseDossier: z.string(),
    productsFound: z.number(),
    totalPages: z.number(),
  }).optional(),
});

const TestEmailSchema = z.object({
  toEmail: z.string().email('Valid email is required'),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check if it's a test email request
    const body = await request.json();
    
    if ('toEmail' in body) {
      // Test email
      const validatedData = TestEmailSchema.parse(body);
      console.log('📧 Test email request to:', validatedData.toEmail);
      
      const success = await sendTestEmail(validatedData.toEmail);
      
      return NextResponse.json({
        success,
        message: success ? 'Test email sent successfully' : 'Failed to send test email',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Regular quote email
    const validatedData = EmailRequestSchema.parse(body);
    
    console.log('📧 Email Sending Request:', {
      client: validatedData.clientName,
      commercial: validatedData.commercial,
      fileName: validatedData.fileName,
    });
    
    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(validatedData.pdfBase64, 'base64');
    
    // Send email
    const success = await sendQuoteEmail({
      clientName: validatedData.clientName,
      commercial: validatedData.commercial,
      fileName: validatedData.fileName,
      pdfBuffer,
      assemblyInfo: validatedData.assemblyInfo,
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (success) {
      console.log(`✅ Email sent successfully in ${duration}s`);
    } else {
      console.error('❌ Email sending failed');
    }
    
    return NextResponse.json({
      success,
      message: success ? 'Email sent successfully' : 'Failed to send email',
      duration: parseFloat(duration),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Email sending error:', error);
    
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
        error: error instanceof Error ? error.message : 'Email sending failed',
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
    endpoint: 'Email Sending API',
    methods: ['POST'],
    timestamp: new Date().toISOString(),
  });
}

