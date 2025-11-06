/**
 * API Route: Drive Fetch Accessories
 * 
 * Fetches the accessories sheet PDF from Google Drive.
 * 
 * This replaces the fetchAccessoriesSheet functionality from script.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/services/google-drive.service';
import { config } from '@/lib/config';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📥 [API] Fetching accessories sheet...');
    
    // Get accessories sheet file ID from config
    const accessoriesFileId = config.google.drive.baseDocuments.accessories;
    
    if (!accessoriesFileId) {
      console.warn('⚠️ [API] Accessories file ID not configured');
      return NextResponse.json(
        { error: 'Accessories file ID not configured' },
        { status: 404 }
      );
    }
    
    // Fetch the accessories sheet from Google Drive
    const fileBuffer = await googleDriveService.downloadFile(accessoriesFileId);
    
    console.log('✅ [API] Accessories sheet fetched:', fileBuffer.length, 'bytes');
    
    // Return the PDF as ArrayBuffer
    return new NextResponse(Buffer.from(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('❌ [API] Error fetching accessories sheet:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch accessories sheet',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

