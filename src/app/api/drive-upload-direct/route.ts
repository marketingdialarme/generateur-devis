/**
 * API Route: Direct Drive Upload
 * 
 * Handles large PDF uploads by accepting FormData instead of JSON base64.
 * This bypasses the 4.5MB body size limit for JSON payloads.
 * 
 * Flow:
 * 1. Frontend sends PDF as multipart/form-data
 * 2. Upload directly to Google Drive
 * 3. Return file ID for subsequent operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToDrive } from '@/lib/services/google-drive.service';
import { config } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface UploadResponse {
  success: boolean;
  fileId?: string;
  driveLink?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    console.log('📤 [API] Direct Drive Upload - Starting...');
    
    // Parse multipart form data
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;
    const commercial = formData.get('commercial') as string;
    const type = formData.get('type') as string;
    const centralType = formData.get('centralType') as string | null;
    
    // Validate required fields
    if (!file || !filename || !commercial || !type) {
      console.error('❌ [API] Missing required fields');
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: file, filename, commercial, type are required'
        },
        { status: 400 }
      );
    }
    
    console.log(`📄 [API] File: ${filename}, Size: ${file.size} bytes (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`👤 [API] Commercial: ${commercial}, Type: ${type}`);
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Determine parent folder based on type
    let parentFolderId: string | undefined;
    if (type === 'alarme' && centralType) {
      if (centralType === 'titane' && config.google.drive.folders.titane) {
        parentFolderId = config.google.drive.folders.titane;
        console.log('📁 [API] Using Titane folder');
      } else if (centralType === 'jablotron' && config.google.drive.folders.jablotron) {
        parentFolderId = config.google.drive.folders.jablotron;
        console.log('📁 [API] Using Jablotron folder');
      }
    } else if (type === 'video' && config.google.drive.folders.video) {
      parentFolderId = config.google.drive.folders.video;
      console.log('📁 [API] Using Video folder');
    }
    
    // If no specific folder is configured, use the main devis folder
    if (!parentFolderId) {
      parentFolderId = config.google.drive.folders.devis;
      console.log('⚠️ [API] Using default Devis folder (specific type folder not configured)');
    }
    
    // Upload to Drive
    console.log(`☁️ [API] Uploading to Google Drive (folder: ${parentFolderId})...`);
    const driveFile = await uploadFileToDrive(
      buffer,
      filename,
      'application/pdf',
      parentFolderId
    );
    
    const driveLink = `https://drive.google.com/file/d/${driveFile.id}/view`;
    
    console.log(`✅ [API] Uploaded to Drive: ${driveLink}`);
    
    return NextResponse.json({
      success: true,
      fileId: driveFile.id,
      driveLink
    });
    
  } catch (error) {
    console.error('❌ [API] Direct upload failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

