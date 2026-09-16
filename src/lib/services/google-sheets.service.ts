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
import { type VisiophoProduct, type FogProduct, type AlarmProduct } from '../quote-generator';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '';
const CONSEILLER_RANGE = 'Conseillers!A2:D';
// Includes the header row (row 1) on purpose — see rowsByHeader below.
// Column *position* is never assumed for product sheets: after the
// Visiophone PRIX column turning out to be F, not E as an earlier manual
// read suggested, every product fetch below looks columns up by their
// header text instead of a fixed index, so it stays correct regardless of
// column order.
const VISIOPHONE_RANGE = 'Produits_Visiophone!A1:Z';
const FOG_RANGE = 'Produits_Générateur_de_brouillard!A1:Z';
const ALARM_RANGE = 'Produits_Alarme!A1:Z';
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { data: Record<string, CommercialInfo>; fetchedAt: number } | null = null;
let visiophoneCache: { data: { products: VisiophoProduct[]; installationPrice: number | null }; fetchedAt: number } | null = null;
let fogCache: { data: FogProduct[]; fetchedAt: number } | null = null;
let alarmCache: { data: { products: AlarmProduct[]; kits: Record<string, { ref: string; quantity: number }[]> }; fetchedAt: number } | null = null;

/**
 * Turns [header, ...dataRows] into row objects keyed by header text
 * ("Nom" -> value, "PRIX" -> value, ...) instead of by column position.
 * Missing/blank headers are skipped. Throws if any of `required` headers
 * is not found, so a renamed or reordered column fails loudly at the API
 * boundary instead of silently reading the wrong cell.
 */
function rowsByHeader(rows: string[][], required: string[]): Record<string, string>[] {
  const [header, ...dataRows] = rows;
  if (!header) return [];

  const indexOf: Record<string, number> = {};
  header.forEach((h, i) => {
    const key = (h || '').trim();
    if (key) indexOf[key] = i;
  });

  const missing = required.filter((col) => !(col in indexOf));
  if (missing.length > 0) {
    throw new Error(`Colonne(s) introuvable(s) dans l'en-tête : ${missing.join(', ')}`);
  }

  return dataRows
    .filter((row) => row.some((cell) => cell))
    .map((row) => {
      const obj: Record<string, string> = {};
      Object.entries(indexOf).forEach(([colName, i]) => {
        obj[colName] = row[i] ?? '';
      });
      return obj;
    });
}

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
 * Fetch the "Produits_Visiophone" tab and return it as a VisiophoProduct[]
 * plus the separately-tracked Installation price. Chosen as the first
 * category wired to the Sheet because it has zero conditional logic tied
 * to product identity anywhere in the codebase (verified against
 * quote-generator.ts, calculations.ts, pdf-generator.ts and
 * product-line-adapter.ts) — the safest starting point before Caméras,
 * Alarme, or Fog, which do have such conditions and need their own
 * "rôle"/flag columns first.
 *
 * Columns are read by header text ("Nom", "PRIX"...), never by position —
 * see rowsByHeader. Ids are assigned deterministically by row order (300 +
 * index): nothing in the app reads a specific numeric id for Visiophone
 * products (unlike Alarme's central detection or Caméras'
 * CAMERA_DEVICE_IDS), so this is safe. The "Autre" (id 99, custom product)
 * entry is a code-level UI feature, not a real product, and is not sourced
 * from the sheet. The "Installation et paramétrage" row is excluded from
 * `products` — its PRIX is returned separately as `installationPrice` and
 * used to seed the Installation section's price in the UI.
 *
 * On any failure (sheet unreachable, credentials expired, tab renamed,
 * expected column missing), this throws rather than falling back to
 * hardcoded data — there is no hardcoded Visiophone catalog anymore. The
 * Sheet is the single source of truth by design (client decision); the
 * caller (the API route, then the UI) is responsible for showing a clear
 * error rather than masking a broken connection with stale duplicate data.
 */
export async function fetchVisiophoneProductsFromSheet(): Promise<{ products: VisiophoProduct[]; installationPrice: number | null }> {
  if (visiophoneCache && Date.now() - visiophoneCache.fetchedAt < CACHE_TTL_MS) {
    return visiophoneCache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID is not configured');
  }

  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: VISIOPHONE_RANGE,
  });

  const rawRows = response.data.values || [];
  const rows = rowsByHeader(rawRows, ['Nom', 'PRIX']);

  const products: VisiophoProduct[] = [];
  let installationPrice: number | null = null;
  let nextId = 300;

  for (const row of rows) {
    const nom = row['Nom'];
    if (!nom) continue;

    const price = parseFloat(row['PRIX']);
    if (isNaN(price)) continue;

    if (nom.includes('Installation')) {
      installationPrice = price;
      continue;
    }

    products.push({ id: nextId, name: nom.trim(), price });
    nextId += 1;
  }

  if (products.length === 0) {
    throw new Error('Produits_Visiophone returned no usable rows');
  }

  const data = { products, installationPrice };
  visiophoneCache = { data, fetchedAt: Date.now() };
  return data;
}

/**
 * Fetch the "Produits_Générateur_de_brouillard" tab and return it as a
 * FogProduct[]. Columns are read by header text, not position (see
 * rowsByHeader) — same reasoning as Visiophone. This sheet already has a
 * REF column (client added it), so every product carries its stable
 * reference — the app matches on `ref`, not `name`, wherever a ref exists.
 * "Installation" is excluded (priced via feesConfig, not a selectable
 * material line, same as Visiophone — not yet wired to live install
 * pricing here). "Autre" (id 99) stays code-defined.
 *
 * No fallback on failure, same reasoning as fetchVisiophoneProductsFromSheet.
 */
export async function fetchFogProductsFromSheet(): Promise<FogProduct[]> {
  if (fogCache && Date.now() - fogCache.fetchedAt < CACHE_TTL_MS) {
    return fogCache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID is not configured');
  }

  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: FOG_RANGE,
  });

  const rawRows = response.data.values || [];
  const rows = rowsByHeader(rawRows, ['Nom', 'PRIX']);

  const products: FogProduct[] = [];
  let nextId = 200;

  for (const row of rows) {
    const nom = row['Nom'];
    if (!nom || nom.includes('Installation')) continue;

    const price = parseFloat(row['PRIX']);
    if (isNaN(price)) continue;

    const ref = row['REF'];
    products.push({ id: nextId, name: nom.trim(), price, ref: ref ? ref.trim() : undefined });
    nextId += 1;
  }

  if (products.length === 0) {
    throw new Error('Produits_Générateur_de_brouillard returned no usable rows');
  }

  fogCache = { data: products, fetchedAt: Date.now() };
  return products;
}

/**
 * Fetch the "Produits_Alarme" tab, scoped to Titane/Jablotron rows only
 * (ref starting with TIT- or JAB-) — XTO rows in the same tab are ignored
 * here; XTO keeps its own separate hardcoded rental-pricing model for now
 * (see CATALOG_XTO_PRODUCTS / XTO_KIT_LINES in quote-generator.ts),
 * migrated separately since it's structurally unrelated (monthly-only, no
 * cash price).
 *
 * Returns both the flat product list (id, name, price, ref — one row per
 * product, single price, since Titane and Jablotron are now separate rows
 * rather than one entry with priceTitane/priceJablotron) and a `kits` map
 * used to build the "Kit 1"/"Kit 2" quick-apply buttons: which refs are
 * included in KIT-TIT-1/KIT-TIT-2/KIT-JAB-1/KIT-JAB-2, and at what
 * quantity, replacing the old hardcoded kit1Products/kit2Products arrays.
 *
 * The sheet's kit-inclusion columns are matched by *pattern*
 * (containing "KIT-TIT-1" etc., disambiguated by whether the header also
 * contains "QTE"), not by an exact header string — the same lesson as
 * Visiophone's PRIX column being in a different position than expected:
 * safer to be robust to small wording differences than to assume exact text.
 */
export async function fetchAlarmProductsFromSheet(): Promise<{ products: AlarmProduct[]; kits: Record<string, { ref: string; quantity: number }[]> }> {
  if (alarmCache && Date.now() - alarmCache.fetchedAt < CACHE_TTL_MS) {
    return alarmCache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID is not configured');
  }

  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: ALARM_RANGE,
  });

  const rawRows = response.data.values || [];
  const [headerRow] = rawRows;
  if (!headerRow) {
    throw new Error('Produits_Alarme: en-tête introuvable');
  }

  const idxOf: Record<string, number> = {};
  headerRow.forEach((h: string, i: number) => {
    const key = (h || '').trim();
    if (key) idxOf[key] = i;
  });
  for (const col of ['Nom', 'REF', 'PRIX']) {
    if (!(col in idxOf)) {
      throw new Error(`Colonne introuvable dans Produits_Alarme : ${col}`);
    }
  }

  const KIT_CODES = ['KIT-TIT-1', 'KIT-TIT-2', 'KIT-JAB-1', 'KIT-JAB-2'];
  const kitColumns: Record<string, { incluIdx?: number; qteIdx?: number }> = {};
  headerRow.forEach((h: string, i: number) => {
    const cell = (h || '').toUpperCase();
    for (const code of KIT_CODES) {
      if (cell.includes(code)) {
        kitColumns[code] = kitColumns[code] || {};
        if (cell.includes('QTE')) {
          kitColumns[code].qteIdx = i;
        } else {
          kitColumns[code].incluIdx = i;
        }
      }
    }
  });

  const missingKitCols = KIT_CODES.filter((c) => kitColumns[c]?.incluIdx === undefined || kitColumns[c]?.qteIdx === undefined);
  if (missingKitCols.length > 0) {
    throw new Error(`Colonnes de kit introuvables dans Produits_Alarme : ${missingKitCols.join(', ')}`);
  }

  const products: AlarmProduct[] = [];
  const kits: Record<string, { ref: string; quantity: number }[]> = {
    'KIT-TIT-1': [], 'KIT-TIT-2': [], 'KIT-JAB-1': [], 'KIT-JAB-2': [],
  };
  let nextId = 600;

  rawRows.slice(1).forEach((row) => {
    const ref = (row[idxOf['REF']] || '').trim();
    if (!ref || !(ref.startsWith('TIT-') || ref.startsWith('JAB-'))) return; // XTO or blank rows: skip

    const nom = (row[idxOf['Nom']] || '').trim();
    if (!nom) return;

    const price = parseFloat(row[idxOf['PRIX']] || '');
    if (!isNaN(price)) {
      products.push({ id: nextId, name: nom, price, ref });
      nextId += 1;
    }

    KIT_CODES.forEach((code) => {
      const { incluIdx, qteIdx } = kitColumns[code];
      const included = row[incluIdx!] === '1' || (row[incluIdx!] || '').toUpperCase() === 'TRUE';
      if (included) {
        const qty = parseInt(row[qteIdx!] || '1', 10) || 1;
        kits[code].push({ ref, quantity: qty });
      }
    });
  });

  if (products.length === 0) {
    throw new Error('Produits_Alarme: aucune ligne Titane/Jablotron exploitable');
  }

  const data = { products, kits };
  alarmCache = { data, fetchedAt: Date.now() };
  return data;
}
