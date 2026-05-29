/**
 * API Route: Drive Fetch Product
 * 
 * Fetches a product sheet PDF from Google Drive by product name.
 * Searches for the product in the product sheets folder.
 * 
 * This replaces the fetchProductSheet functionality from script.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/services/google-drive.service';
import { config } from '@/lib/config';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const productName = searchParams.get('productName');
    
    if (!productName) {
      return NextResponse.json(
        { error: 'productName parameter is required' },
        { status: 400 }
      );
    }
    
    console.log('📥 [API] Fetching product sheet for:', productName);

    // Prefer direct Drive ID lookup when configured (more reliable than name search).
    const directId = config.google.drive.baseDocuments.cameraSheetIds?.[productName];
    if (directId) {
      try {
        console.log('🎯 [API] Direct ID lookup for:', productName, '→', directId);
        const buffer = await googleDriveService.downloadFile(directId);
        console.log('✅ [API] Product sheet fetched via direct ID:', buffer.length, 'bytes');
        return new NextResponse(Buffer.from(buffer), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Length': buffer.length.toString(),
            'X-File-Id': directId,
            'Cache-Control': 'public, max-age=86400, immutable',
          },
        });
      } catch (directErr) {
        console.warn('⚠️ [API] Direct ID fetch failed, falling back to name search:', directErr);
        // fall through to legacy name-based search
      }
    }

    // Legacy fallback: search by product name in the product sheets folder.
    const productSheetsFolderId = config.google.drive.folders.productSheets;

    try {
      const result = await googleDriveService.findAndDownloadFileWithMetadata(
        productSheetsFolderId,
        productName
      );

      if (!result) {
        console.warn('⚠️ [API] Product sheet not found:', productName);
        return NextResponse.json(
          { error: 'Product sheet not found' },
          { status: 404 }
        );
      }

      console.log('✅ [API] Product sheet fetched:', result.buffer.length, 'bytes', `(fileId: ${result.fileId})`);

      // Return the PDF as ArrayBuffer with fileId in headers
      return new NextResponse(Buffer.from(result.buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': result.buffer.length.toString(),
          'X-File-Id': result.fileId, // Include fileId for deduplication
          'Cache-Control': 'public, max-age=86400, immutable', // Cache for 24 hours
        },
      });
    } catch (error) {
      console.warn('⚠️ [API] Product sheet not found:', productName);
      return NextResponse.json(
        { error: 'Product sheet not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('❌ [API] Error fetching product sheet:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch product sheet',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

