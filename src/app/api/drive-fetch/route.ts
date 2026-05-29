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
import { config } from '@/lib/config';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/** Allowlist of file IDs this route may proxy.
 *  Prevents the route from acting as an open authenticated Drive read proxy. */
function getAllowedFileIds(): Set<string> {
  const docs = config.google.drive.baseDocuments;
  const ids = new Set<string>();
  if (docs.alarmTitane) ids.add(docs.alarmTitane);
  if (docs.alarmJablotron) ids.add(docs.alarmJablotron);
  if (docs.video) ids.add(docs.video);
  if (docs.fog) ids.add(docs.fog);
  if (docs.visiophone) ids.add(docs.visiophone);
  if (docs.accessories) ids.add(docs.accessories);
  if (docs.policeDoc) ids.add(docs.policeDoc);
  Object.values(docs.propertyTypeDocs || {}).forEach((id) => { if (id) ids.add(id); });
  Object.values(docs.cameraSheetIds || {}).forEach((id) => { if (id) ids.add(id); });
  return ids;
}

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

    // Allowlist guard — refuse arbitrary Drive file IDs
    if (!getAllowedFileIds().has(fileId)) {
      console.warn('❌ [API] Refused fileId (not in allowlist):', fileId);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
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
        // Drive file content can change while the file ID stays the same
        // (client re-uploads the same base template in place). Previously this
        // route returned `immutable, max-age=86400`, which made Vercel's edge
        // serve stale PDF bytes for 24h after the Drive file was updated —
        // visible as "the dossier is still the old one" complaints.
        //
        // New policy: keep a tight edge window with stale-while-revalidate so
        // Drive updates propagate within ~1 minute under typical load while
        // still amortising the multi-MB fetch across same-session quotes.
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
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

