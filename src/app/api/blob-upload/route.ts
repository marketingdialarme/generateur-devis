/**
 * API Route: Blob Upload
 * 
 * Handles large PDF uploads via Vercel Blob storage.
 * This bypasses the 4.5 MB serverless function body limit.
 * 
 * Flow:
 * 1. Client uploads PDF to this endpoint
 * 2. Upload to Vercel Blob (supports up to 5 GB)
 * 3. Return blob URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface BlobUploadResponse {
  success: boolean;
  blobUrl?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<BlobUploadResponse>> {
  try {
    console.log('📤 [API] Blob Upload - Starting...');
    
    // Parse multipart form data
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;
    
    // Validate required fields
    if (!file || !filename) {
      console.error('❌ [API] Missing required fields');
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: file and filename are required'
        },
        { status: 400 }
      );
    }
    
    console.log(`📄 [API] File: ${filename}, Size: ${file.size} bytes (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Upload to Vercel Blob
    console.log(`☁️ [API] Uploading to Vercel Blob...`);
    
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });
    
    console.log(`✅ [API] Uploaded to Blob: ${blob.url}`);
    
    return NextResponse.json({
      success: true,
      blobUrl: blob.url
    });
    
  } catch (error) {
    console.error('❌ [API] Blob upload failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

