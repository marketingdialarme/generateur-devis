/**
 * ============================================================================
 * GOOGLE DRIVE UPLOAD API ROUTE
 * ============================================================================
 * 
 * POST /api/drive-upload
 * Uploads a PDF file to Google Drive in the appropriate commercial folder
 * 
 * Replaces Google Apps Script Drive.createFile() functionality
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToDrive, getOrCreateCommercialFolder } from '@/lib/services/google-drive.service';
import { z } from 'zod';

// Request validation schema
const UploadRequestSchema = z.object({
  pdfBase64: z.string().min(1, 'PDF data is required'),
  fileName: z.string().min(1, 'File name is required'),
  commercial: z.string().min(1, 'Commercial name is required'),
  clientName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = UploadRequestSchema.parse(body);
    
    console.log('☁️ Drive Upload Request:', {
      fileName: validatedData.fileName,
      commercial: validatedData.commercial,
      fileSize: Math.round(validatedData.pdfBase64.length / 1024),
    });
    
    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(validatedData.pdfBase64, 'base64');
    
    // Get or create commercial folder
    console.log(`📁 Getting folder for commercial: ${validatedData.commercial}`);
    const folderId = await getOrCreateCommercialFolder(validatedData.commercial);
    console.log(`✅ Folder ID: ${folderId}`);
    
    // Upload file to Drive
    console.log('⬆️ Uploading to Drive...');
    const uploadResult = await uploadFileToDrive(
      pdfBuffer,
      validatedData.fileName,
      'application/pdf',
      folderId
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Upload completed in ${duration}s`);
    console.log(`🔗 Drive URL: ${uploadResult.webViewLink}`);
    
    return NextResponse.json({
      success: true,
      file: {
        id: uploadResult.id,
        name: uploadResult.name,
        url: uploadResult.webViewLink,
        downloadUrl: uploadResult.webContentLink,
      },
      duration: parseFloat(duration),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Drive upload error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Drive upload failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Google Drive Upload API',
    methods: ['POST'],
    timestamp: new Date().toISOString(),
  });
}

