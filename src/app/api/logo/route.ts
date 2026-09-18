/**
 * ============================================================================
 * LOGO API ROUTE
 * ============================================================================
 *
 * GET /api/logo
 * Serves the Dialarme logo (with slogan) from Google Drive, same-origin,
 * so the PDF-generation code (createPDFHeader in pdf-generator.ts) can
 * embed it via a plain fetch() without depending on an external host's
 * CORS policy. Returns 404 if GOOGLE_DRIVE_FILE_LOGO isn't configured yet
 * (nothing uploaded/linked), so the caller can fall back to the text
 * wordmark cleanly.
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { googleDriveService } from '@/lib/services/google-drive.service';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fileId = config.google.drive.baseDocuments.logoFileId;
    if (!fileId) {
      return NextResponse.json(
        { error: 'GOOGLE_DRIVE_FILE_LOGO is not configured' },
        { status: 404 }
      );
    }

    const buffer = await googleDriveService.downloadFile(fileId);

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('❌ Logo fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch logo' },
      { status: 500 }
    );
  }
}
