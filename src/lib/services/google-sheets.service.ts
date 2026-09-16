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
import { CATALOG_VISIOPHONE_PRODUCTS, type VisiophoProduct } from '../quote-generator';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '';
const CONSEILLER_RANGE = 'Conseillers!A2:D';
const VISIOPHONE_RANGE = 'Produits_Visiophone!A2:J';
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { data: Record<string, CommercialInfo>; fetchedAt: number } | null = null;
let visiophoneCache: { data: VisiophoProduct[]; fetchedAt: number } | null = null;

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

/**
 * Fetch the "Produits_Visiophone" tab and return it as a VisiophoProduct[],
 * in the shape the app already expects (id, name, price). Chosen as the
 * first category wired to the Sheet because it has zero conditional logic
 * tied to product identity anywhere in the codebase (verified against
 * quote-generator.ts, calculations.ts, pdf-generator.ts and
 * product-line-adapter.ts) — the safest starting point before Caméras,
 * Alarme, or Fog, which do have such conditions and need their own
 * "rôle"/flag columns first.
 *
 * The sheet has no REF/ID column yet for this tab, so ids are assigned
 * deterministically by row order (300 + index) — nothing in the app reads
 * a specific numeric id for Visiophone products (unlike Alarme's central
 * detection or Caméras' CAMERA_DEVICE_IDS), so this is safe. The "Autre"
 * (id 99, custom product) entry is a code-level UI feature, not a real
 * product, and is not sourced from the sheet. "Installation et
 * paramétrage" is excluded from the catalog: it's priced separately via
 * feesConfig.installationPrice, not selectable as a material line.
 *
 * On any failure (sheet unreachable, credentials expired, tab renamed),
 * falls back to the hardcoded CATALOG_VISIOPHONE_PRODUCTS rather than
 * throwing — unlike the Conseillers directory, an empty product list
 * would block conseillers from generating quotes at all, which is worse
 * than serving slightly-stale prices. The fallback is logged so it
 * doesn't go unnoticed.
 */
export async function fetchVisiophoneProductsFromSheet(): Promise<VisiophoProduct[]> {
  if (visiophoneCache && Date.now() - visiophoneCache.fetchedAt < CACHE_TTL_MS) {
    return visiophoneCache.data;
  }

  try {
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEETS_ID is not configured');
    }

    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: VISIOPHONE_RANGE,
    });

    const rows = response.data.values || [];
    const products: VisiophoProduct[] = [];
    let nextId = 300;

    for (const row of rows) {
      const [, nom, , , prix] = row; // Groupe, Nom, Inclut kit de base, Quantite kit de base, PRIX
      if (!nom || nom.includes('Installation')) continue;

      const price = parseFloat(prix);
      if (isNaN(price)) continue;

      products.push({ id: nextId, name: nom.trim(), price });
      nextId += 1;
    }

    if (products.length === 0) {
      throw new Error('Produits_Visiophone returned no usable rows');
    }

    visiophoneCache = { data: products, fetchedAt: Date.now() };
    return products;
  } catch (error) {
    console.error('⚠️ Falling back to hardcoded Visiophone catalog — live sheet fetch failed:', error);
    return CATALOG_VISIOPHONE_PRODUCTS.filter((p) => !p.isCustom);
  }
}
