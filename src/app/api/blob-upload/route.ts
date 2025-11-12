/**
 * API Route: Blob Upload Token
 * 
 * Generates a client upload token for direct-to-blob uploads.
 * This endpoint does NOT receive the PDF - it only returns a token.
 * 
 * Flow:
 * 1. Client requests upload token (small request)
 * 2. Returns token + upload URL
 * 3. Client uploads PDF DIRECTLY to Vercel Blob (bypasses serverless)
 * 4. Returns blob URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file extension
        if (!pathname.endsWith('.pdf')) {
          throw new Error('Only PDF files are allowed');
        }
        
        console.log(`🔑 [API] Generating upload token for: ${pathname}`);
        
        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB max
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log(`✅ [API] Blob upload completed: ${blob.url}`);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('❌ [API] Token generation failed:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Token generation failed'
      },
      { status: 400 }
    );
  }
}

