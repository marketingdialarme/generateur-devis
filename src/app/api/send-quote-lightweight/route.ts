/**
 * API Route: Send Quote (Lightweight)
 * 
 * Handles email and logging after PDF is already uploaded to Drive.
 * This is used in conjunction with drive-upload-direct for large files.
 * 
 * Flow:
 * 1. PDF already uploaded to Drive (via drive-upload-direct)
 * 2. This endpoint sends email and logs to database
 * 3. No PDF data in request body - only metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteEmail } from '@/lib/services/email.service';
import { logQuote } from '@/lib/services/database.service';
import { downloadFileFromDrive } from '@/lib/services/google-drive.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SendQuoteLightweightRequest {
  driveFileId: string;
  driveLink: string;
  filename: string;
  commercial: string;
  clientName: string;
  type: 'alarme' | 'video';
  centralType?: 'titane' | 'jablotron';
  produits: string[];
  frontendAssemblyInfo?: {
    baseDossier: string;
    productsFound: number;
    totalPages: number;
  };
}

interface SendQuoteLightweightResponse {
  success: boolean;
  message: string;
  emailSent?: boolean;
  logged?: boolean;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SendQuoteLightweightResponse>> {
  try {
    console.log('📧 [API] Send Quote Lightweight - Starting...');
    
    // Parse request body
    const body: SendQuoteLightweightRequest = await request.json();
    
    const {
      driveFileId,
      driveLink,
      filename,
      commercial,
      clientName,
      type,
      centralType,
      produits,
      frontendAssemblyInfo
    } = body;
    
    // Validate required fields
    if (!driveFileId || !driveLink || !filename || !commercial || !clientName || !type) {
      console.error('❌ [API] Missing required fields');
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          error: 'driveFileId, driveLink, filename, commercial, clientName, and type are required'
        },
        { status: 400 }
      );
    }
    
    console.log(`📧 [API] Sending email for: ${filename}`);
    console.log(`👤 [API] Commercial: ${commercial}, Client: ${clientName}`);
    
    let emailSent = false;
    let logged = false;
    
    // Download PDF from Drive for email attachment
    console.log('📥 [API] Downloading PDF from Drive for email...');
    let pdfBuffer: Buffer | null = null;
    
    try {
      pdfBuffer = await downloadFileFromDrive(driveFileId);
      console.log(`✅ [API] PDF downloaded: ${pdfBuffer.length} bytes`);
    } catch (downloadError) {
      console.error('⚠️ [API] PDF download failed, will send email without attachment:', downloadError);
    }
    
    // Send email
    if (pdfBuffer) {
      try {
        await sendQuoteEmail({
          clientName,
          commercial,
          fileName: filename,
          pdfBuffer,
          driveLink,
          assemblyInfo: frontendAssemblyInfo
        });
        emailSent = true;
        console.log('✅ [API] Email sent successfully');
      } catch (emailError) {
        console.error('❌ [API] Email send failed:', emailError);
        // Continue even if email fails
      }
    } else {
      console.warn('⚠️ [API] Skipping email (no PDF buffer available)');
    }
    
    // Log to database
    try {
      await logQuote({
        client_name: clientName,
        commercial,
        quote_type: type,
        central_type: centralType,
        products: produits,
        products_count: produits.length,
        file_name: filename,
        drive_url: driveLink,
        email_sent: emailSent
      });
      logged = true;
      console.log('✅ [API] Quote logged to database');
    } catch (logError) {
      console.error('❌ [API] Database logging failed:', logError);
      // Continue even if logging fails
    }
    
    console.log('✅ [API] Quote workflow completed');
    
    return NextResponse.json({
      success: true,
      message: 'Quote sent successfully',
      emailSent,
      logged
    });
    
  } catch (error) {
    console.error('❌ [API] Lightweight send failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send quote',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

