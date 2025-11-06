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
import { uploadFileToDrive } from '@/lib/services/google-drive.service';
import { sendQuoteEmail } from '@/lib/services/email.service';
import { logQuote } from '@/lib/services/database.service';
import { config } from '@/lib/config';

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
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    console.log(`📄 [API] PDF buffer size: ${pdfBuffer.length} bytes`);
    
    // Step 1: Upload to Google Drive
    console.log('📁 [API] Step 1: Uploading to Google Drive...');
    let driveResult;
    
    try {
      // Determine folder based on quote type
      let folderId: string;
      
      if (type === 'alarme') {
        if (centralType === 'jablotron') {
          folderId = config.google.drive.folders.jablotron;
          console.log('📂 [API] Using Jablotron folder');
        } else {
          folderId = config.google.drive.folders.titane;
          console.log('📂 [API] Using Titane folder');
        }
      } else if (type === 'video') {
        folderId = config.google.drive.folders.video;
        console.log('📂 [API] Using Video folder');
      } else {
        throw new Error(`Invalid quote type: ${type}`);
      }
      
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
        pdfBuffer
      });
      
      emailSent = true;
      console.log('✅ [API] Email sent successfully');
    } catch (error) {
      console.error('❌ [API] Email send failed:', error);
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

