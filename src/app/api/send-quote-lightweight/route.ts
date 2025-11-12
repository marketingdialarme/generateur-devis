/**
 * API Route: Send Quote (Lightweight)
 * 
 * Handles email and logging after PDF is uploaded to blob storage.
 * This is used in conjunction with blob-upload for large files.
 * 
 * Flow:
 * 1. PDF already uploaded to Vercel Blob
 * 2. Download PDF from blob
 * 3. Upload to Google Drive
 * 4. Send email with attachment
 * 5. Log to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteEmail } from '@/lib/services/email.service';
import { logQuote } from '@/lib/services/database.service';
import { uploadFileToDrive, getOrCreateCommercialFolder } from '@/lib/services/google-drive.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface SendQuoteLightweightRequest {
  blobUrl: string;
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
  driveLink?: string;
  driveFileId?: string;
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
      blobUrl,
      filename,
      commercial,
      clientName,
      type,
      centralType,
      produits,
      frontendAssemblyInfo
    } = body;
    
    // Validate required fields
    if (!blobUrl || !filename || !commercial || !clientName || !type) {
      console.error('❌ [API] Missing required fields');
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          error: 'blobUrl, filename, commercial, clientName, and type are required'
        },
        { status: 400 }
      );
    }
    
    console.log(`📧 [API] Processing quote: ${filename}`);
    console.log(`👤 [API] Commercial: ${commercial}, Client: ${clientName}`);
    console.log(`🔗 [API] Blob URL: ${blobUrl}`);
    
    let emailSent = false;
    let logged = false;
    let driveLink = '';
    let driveFileId = '';
    
    // Step 1: Download PDF from Vercel Blob
    console.log('📥 [API] Downloading PDF from Blob...');
    let pdfBuffer: Buffer | null = null;
    
    try {
      const blobResponse = await fetch(blobUrl);
      if (!blobResponse.ok) {
        throw new Error(`Blob download failed: HTTP ${blobResponse.status}`);
      }
      const arrayBuffer = await blobResponse.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
      console.log(`✅ [API] PDF downloaded from Blob: ${pdfBuffer.length} bytes (${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
    } catch (downloadError) {
      console.error('❌ [API] Blob download failed:', downloadError);
      throw new Error('Failed to download PDF from blob storage');
    }
    
    // Step 2: Upload to Google Drive
    if (pdfBuffer) {
      try {
        console.log('📤 [API] Uploading to Google Drive...');
        const folderId = await getOrCreateCommercialFolder(commercial);
        const driveFile = await uploadFileToDrive(
          pdfBuffer,
          filename,
          'application/pdf',
          folderId
        );
        
        driveFileId = driveFile.id || '';
        driveLink = `https://drive.google.com/file/d/${driveFileId}/view`;
        console.log(`✅ [API] Uploaded to Drive: ${driveLink}`);
      } catch (driveError) {
        console.error('❌ [API] Drive upload failed:', driveError);
        // Continue - we can still send email
      }
    }
    
    // Step 3: Send email with PDF attachment
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
    }
    
    // Step 4: Log to database
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
      driveLink,
      driveFileId,
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

