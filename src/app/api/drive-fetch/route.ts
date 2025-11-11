/**
 * API Route: Drive Fetch
 * 
 * Fetches a document from Google Drive by file ID.
 * Returns the PDF as an ArrayBuffer.
 * 
 * This replaces the fetchBaseDocument functionality from script.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/services/google-drive.service';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId parameter is required' },
        { status: 400 }
      );
    }
    
    console.log('📥 [API] Fetching document from Drive:', fileId);
    
    // Fetch the file from Google Drive
    const fileBuffer = await googleDriveService.downloadFile(fileId);
    
    console.log('✅ [API] Document fetched:', fileBuffer.length, 'bytes');
    
    // Return the PDF as ArrayBuffer
    return new NextResponse(Buffer.from(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, immutable', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('❌ [API] Error fetching document:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch document',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

