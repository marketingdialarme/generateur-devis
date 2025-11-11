/**
 * API Route: Send Quote
 * 
 * Handles the complete quote sending workflow:
 * 1. Receives PDF blob (base64) and metadata
 * 2. Uploads PDF to Google Drive
 * 3. Sends email with PDF attachment
 * 4. Logs quote to database
 * 5. Returns success/error response
 * 
 * This replaces the Google Apps Script backend endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToDrive, getOrCreateCommercialFolder } from '@/lib/services/google-drive.service';
import { sendQuoteEmail } from '@/lib/services/email.service';
import { logQuote } from '@/lib/services/database.service';
import { config } from '@/lib/config';
import { PDFDocument } from 'pdf-lib';

interface SendQuoteRequest {
  pdfBase64: string;
  filename: string;
  commercial: string;
  clientName: string;
  type: 'alarme' | 'video';
  centralType?: 'titane' | 'jablotron';
  produits: string[];
  addCommercialOverlay?: boolean;
  mergedByFrontend?: boolean;
  frontendAssemblyInfo?: {
    baseDossier: string;
    productsFound: number;
    totalPages: number;
  };
  timestamp: string;
}

interface SendQuoteResponse {
  success: boolean;
  message: string;
  driveLink?: string;
  driveId?: string;
  emailSent?: boolean;
  logged?: boolean;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SendQuoteResponse>> {
  const startTime = Date.now();
  
  try {
    console.log('📤 [API] Send Quote - Starting...');
    
    // Parse request body
    const body: SendQuoteRequest = await request.json();
    
    const {
      pdfBase64,
      filename,
      commercial,
      clientName,
      type,
      centralType,
      produits,
      mergedByFrontend,
      frontendAssemblyInfo,
      timestamp
    } = body;
    
    // Validate required fields
    if (!pdfBase64 || !filename || !commercial || !clientName || !type) {
      console.error('❌ [API] Missing required fields');
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          error: 'pdfBase64, filename, commercial, clientName, and type are required'
        },
        { status: 400 }
      );
    }
    
    console.log('📦 [API] Request details:', {
      filename,
      commercial,
      clientName,
      type,
      centralType,
      productsCount: produits?.length || 0,
      mergedByFrontend,
      pdfSize: pdfBase64.length,
      timestamp
    });
    
    if (frontendAssemblyInfo) {
      console.log('📋 [API] Frontend assembly info:', frontendAssemblyInfo);
    }
    
    // Convert base64 to buffer
    let pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const originalSize = pdfBuffer.length;
    console.log(`📄 [API] PDF buffer size: ${originalSize} bytes (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);
    
    // Compress PDF if it's larger than 5MB to avoid email issues
    if (originalSize > 5 * 1024 * 1024) {
      console.log('⚠️ [API] PDF is large, attempting compression...');
      try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const compressedPdfBytes = await pdfDoc.save({ 
          useObjectStreams: true,
          addDefaultPage: false
        });
        const compressedBuffer = Buffer.from(compressedPdfBytes);
        const compressionRatio = ((1 - compressedBuffer.length / originalSize) * 100).toFixed(1);
        console.log(`✅ [API] PDF compressed: ${originalSize} → ${compressedBuffer.length} bytes (${compressionRatio}% reduction)`);
        pdfBuffer = compressedBuffer;
      } catch (compressionError) {
        console.warn('⚠️ [API] PDF compression failed, using original:', compressionError);
      }
    }
    
    // Step 1: Upload to Google Drive
    console.log('📁 [API] Step 1: Uploading to Google Drive...');
    let driveResult;
    
    try {
      // Get or create folder for this commercial
      console.log(`📂 [API] Getting folder for commercial: ${commercial}`);
      const folderId = await getOrCreateCommercialFolder(commercial);
      console.log(`✅ [API] Using folder ID: ${folderId}`);
      
      driveResult = await uploadFileToDrive(
        pdfBuffer,
        filename,
        'application/pdf',
        folderId
      );
      
      console.log('✅ [API] Drive upload successful:', {
        id: driveResult.id,
        webViewLink: driveResult.webViewLink
      });
    } catch (error) {
      console.error('❌ [API] Drive upload failed:', error);
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to upload PDF to Google Drive',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
    // Step 2: Send email
    console.log('📧 [API] Step 2: Sending email...');
    let emailSent = false;
    
    try {
      await sendQuoteEmail({
        clientName,
        commercial,
        fileName: filename,
        pdfBuffer,
        driveLink: driveResult.webViewLink
      });
      
      emailSent = true;
      console.log('✅ [API] Email sent successfully');
    } catch (error) {
      console.error('❌ [API] Email send failed:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
      }
      // Don't fail the entire request if email fails
      // The PDF is already in Drive, which is the most important part
    }
    
    // Step 3: Log to database
    console.log('📊 [API] Step 3: Logging to database...');
    let logged = false;
    
    try {
      await logQuote({
        client_name: clientName,
        commercial,
        quote_type: type,
        central_type: centralType,
        products: produits || [],
        products_count: (produits || []).length,
        file_name: filename,
        drive_url: driveResult.webViewLink,
        email_sent: emailSent
      });
      
      logged = true;
      console.log('✅ [API] Database log successful');
    } catch (error) {
      console.error('❌ [API] Database log failed:', error);
      // Don't fail the entire request if logging fails
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ [API] Send Quote completed in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      message: 'Quote sent successfully',
      driveLink: driveResult.webViewLink,
      driveId: driveResult.id,
      emailSent,
      logged
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [API] Send Quote failed after ${duration}ms:`, error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
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

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

