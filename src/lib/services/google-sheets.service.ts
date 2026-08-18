/**
 * ============================================================================
 * GOOGLE SHEETS SERVICE
 * ============================================================================
 *
 * Reads live business data (currently: the commercial/conseiller directory)
 * from the "Variables_Generateur_Devis" Google Sheet, instead of hardcoding
 * it in source. Uses the same OAuth2 credentials as the Drive service
 * (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN) — that
 * refresh token's `drive` scope is accepted by the Sheets API as well, so no
 * extra consent flow is required, but the spreadsheet must be shared with
 * the same Google account the refresh token belongs to.
 * ============================================================================
 */

import { google } from 'googleapis';
import { CommercialInfo } from '../config';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '';
const CONSEILLER_RANGE = 'Conseillers!A2:D';
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { data: Record<string, CommercialInfo>; fetchedAt: number } | null = null;

async function getSheetsClient() {
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  ) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    try {
      await oauth2Client.getAccessToken();
    } catch (error) {
      console.error('OAuth token refresh failed (Sheets):', error);
      throw new Error('Google OAuth authentication failed for Sheets API. GOOGLE_REFRESH_TOKEN may be expired.');
    }

    return google.sheets({ version: 'v4', auth: oauth2Client });
  }

  throw new Error(
    'No Google OAuth credentials configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN.'
  );
}

/**
 * Fetch the "Conseiller" tab and return it as a map keyed by "Prénom Nom"
 * (exactly as the sheet spells them — no casing normalization), matching
 * the shape previously hardcoded in config.ts's `commercials` object.
 *
 * Cached in memory for CACHE_TTL_MS to avoid hitting the Sheets API on
 * every request; throws on any failure (no static fallback — a broken
 * sheet connection should surface immediately rather than silently serve
 * stale hardcoded data).
 */
export async function fetchCommercialsFromSheet(): Promise<Record<string, CommercialInfo>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID is not configured');
  }

  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: CONSEILLER_RANGE,
  });

  const rows = response.data.values || [];
  const commercials: Record<string, CommercialInfo> = {};

  for (const row of rows) {
    const [nom, prenom, phone, email] = row;
    if (!nom || !prenom) continue;

    const fullName = `${prenom} ${nom}`.trim();
    commercials[fullName] = {
      phone: phone || '',
      email: email || '',
    };
  }

  cache = { data: commercials, fetchedAt: Date.now() };
  return commercials;
}
