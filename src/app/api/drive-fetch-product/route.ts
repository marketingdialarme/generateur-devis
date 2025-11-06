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
    
    // Search for the product sheet in the product sheets folder
    const productSheetsFolderId = config.google.drive.folders.productSheets;
    
    try {
      const fileBuffer = await googleDriveService.findAndDownloadFile(
        productSheetsFolderId,
        productName
      );
      
      if (!fileBuffer) {
        console.warn('⚠️ [API] Product sheet not found:', productName);
        return NextResponse.json(
          { error: 'Product sheet not found' },
          { status: 404 }
        );
      }
      
      console.log('✅ [API] Product sheet fetched:', fileBuffer.length, 'bytes');
      
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

