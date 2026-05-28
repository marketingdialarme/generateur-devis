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
import { uploadFileToDrive, getOrCreateCommercialFolder, getOrCreateCommercialFolderInParent } from '@/lib/services/google-drive.service';
import { config } from '@/lib/config';

/** SSRF guard — only accept URLs pointing at our own Vercel Blob storage. */
function isValidBlobUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

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
  isXtoAlarm?: boolean;
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
      isXtoAlarm,
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

    // SSRF guard — only fetch from our own Vercel Blob storage
    if (!isValidBlobUrl(blobUrl)) {
      console.error('❌ [API] Invalid blob URL:', blobUrl);
      return NextResponse.json(
        { success: false, message: 'Invalid blob URL', error: 'blobUrl must be a Vercel Blob storage URL' },
        { status: 400 }
      );
    }

    // Length sanity — prevent abuse-sized fields landing in Drive/email/DB
    if (filename.length > 255 || commercial.length > 100 || clientName.length > 200) {
      return NextResponse.json(
        { success: false, message: 'Field too long', error: 'filename/commercial/clientName exceed length limits' },
        { status: 400 }
      );
    }

    // Type allowlist
    if (type !== 'alarme' && type !== 'video') {
      return NextResponse.json(
        { success: false, message: 'Invalid type', error: "type must be 'alarme' or 'video'" },
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
    
    // Step 2: Upload to Google Drive (with retry logic)
    if (pdfBuffer) {
      const maxRetries = 3;
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`📤 [API] Uploading to Google Drive (attempt ${attempt}/${maxRetries})...`);
          const parentFolderId = isXtoAlarm
            ? (config.google.drive.folders.xto || config.google.drive.folders.devis)
            : config.google.drive.folders.devis;
          const folderId = isXtoAlarm
            ? await getOrCreateCommercialFolderInParent(commercial, parentFolderId)
            : await getOrCreateCommercialFolder(commercial);
          const driveFile = await uploadFileToDrive(
            pdfBuffer,
            filename,
            'application/pdf',
            folderId
          );
          
          driveFileId = driveFile.id || '';
          driveLink = `https://drive.google.com/file/d/${driveFileId}/view`;
          console.log(`✅ [API] Uploaded to Drive: ${driveLink}`);
          break; // Success, exit retry loop
        } catch (driveError) {
          lastError = driveError instanceof Error ? driveError : new Error(String(driveError));
          console.error(`❌ [API] Drive upload failed (attempt ${attempt}/${maxRetries}):`, lastError.message);
          
          // If it's an auth error and not the last attempt, wait and retry
          if (attempt < maxRetries && (lastError.message.includes('invalid_grant') || lastError.message.includes('auth'))) {
            const delay = 1000 * attempt; // Exponential backoff
            console.log(`⏳ [API] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else if (attempt === maxRetries) {
            console.error(`❌ [API] Drive upload failed after ${maxRetries} attempts:`, lastError.message);
            // Continue - we can still send email
          }
        }
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

