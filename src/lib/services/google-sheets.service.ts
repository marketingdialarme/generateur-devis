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
import { type VisiophoProduct, type FogProduct, type AlarmProduct, type CameraProduct } from '../quote-generator';

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
const KIT_BASE_ALARME_RANGE = 'Kit_Base_Alarme!A1:F';
const CAMERA_RANGE = 'Produits_Cameras!A1:Z';
const CONFIG_RANGE = 'Config!A1:K';
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { data: Record<string, CommercialInfo>; fetchedAt: number } | null = null;
let visiophoneCache: { data: { products: VisiophoProduct[]; installationPrice: number | null; defaultKit: { name: string; quantity: number }[] }; fetchedAt: number } | null = null;
let fogCache: { data: { products: FogProduct[]; defaultKit: { ref: string; quantity: number }[] }; fetchedAt: number } | null = null;
let alarmCache: { data: { products: AlarmProduct[]; xtoProducts: AlarmProduct[]; kits: Record<string, { ref: string; quantity: number }[]>; installationPrices: Record<string, number | null> }; fetchedAt: number } | null = null;
let cameraCache: { data: { products: CameraProduct[]; installationProducts: CameraProduct[] }; fetchedAt: number } | null = null;
let configCache: { data: Record<string, number>; fetchedAt: number } | null = null;
let propertyTypeCache: { data: Record<string, string>; fetchedAt: number } | null = null;
let alarmCentralsCache: { data: AlarmCentral[]; fetchedAt: number } | null = null;
let surveillanceOptionsCache: { data: SurveillanceOption[]; fetchedAt: number } | null = null;

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

/**
 * Accepts either a bare Drive file ID or a full shareable Drive link (any of
 * the common URL shapes) and returns just the file ID -- so the "Fiche"
 * column in the Sheet can hold whatever the client naturally copies from
 * Drive's "Share" dialog, not a raw ID they'd have to extract by hand.
 * Returns the input unchanged (trimmed) if it doesn't look like a URL --
 * i.e. it's presumably already a bare ID.
 */
function extractDriveFileId(value: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]{10,})/) // .../file/d/<id>/view
    || trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/); // ...open?id=<id>
  return match ? match[1] : trimmed;
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
export async function fetchVisiophoneProductsFromSheet(): Promise<{ products: VisiophoProduct[]; installationPrice: number | null; defaultKit: { name: string; quantity: number }[] }> {
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
  // "Inclut kit de base" / "Quantite kit de base" -- read from the Sheet
  // now (client feedback), keyed by Nom since Visiophone has no REF column.
  const defaultKit: { name: string; quantity: number }[] = [];
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

    const fiche = row['Fiche'] ? extractDriveFileId(row['Fiche']) : undefined;
    products.push({ id: nextId, name: nom.trim(), price, fiche });
    nextId += 1;

    const inclu = String(row['Inclut kit de base'] ?? '').trim().toUpperCase();
    if (['1', 'TRUE', 'VRAI', 'OUI', 'YES', 'X'].includes(inclu)) {
      const qty = parseInt(row['Quantite kit de base'] || '1', 10) || 1;
      defaultKit.push({ name: nom.trim(), quantity: qty });
    }
  }

  if (products.length === 0) {
    throw new Error('Produits_Visiophone returned no usable rows');
  }

  const data = { products, installationPrice, defaultKit };
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
export async function fetchFogProductsFromSheet(): Promise<{ products: FogProduct[]; defaultKit: { ref: string; quantity: number }[] }> {
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
  // "Inclut kit de base" / "Quantite kit de base" -- read straight from the
  // Sheet now (client feedback: easier to adjust than a hardcoded default).
  const defaultKit: { ref: string; quantity: number }[] = [];
  let nextId = 200;

  for (const row of rows) {
    const nom = row['Nom'];
    if (!nom || nom.includes('Installation')) continue;

    const price = parseFloat(row['PRIX']);
    if (isNaN(price)) continue;

    const ref = row['REF'] ? row['REF'].trim() : undefined;
    const fiche = row['Fiche'] ? extractDriveFileId(row['Fiche']) : undefined;
    products.push({ id: nextId, name: nom.trim(), price, ref, fiche });
    nextId += 1;

    const inclu = String(row['Inclut kit de base'] ?? '').trim().toUpperCase();
    if (ref && ['1', 'TRUE', 'VRAI', 'OUI', 'YES', 'X'].includes(inclu)) {
      const qty = parseInt(row['Quantite kit de base'] || '1', 10) || 1;
      defaultKit.push({ ref, quantity: qty });
    }
  }

  if (products.length === 0) {
    throw new Error('Produits_Générateur_de_brouillard returned no usable rows');
  }

  const data = { products, defaultKit };
  fogCache = { data, fetchedAt: Date.now() };
  return data;
}

/**
 * Fetch the "Produits_Alarme" tab, scoped to rows belonging to a known
 * centrale (Titane, Jablotron, or any future one discovered via
 * fetchAlarmCentralsFromSheet -- ref prefix matched against
 * "{PREFIX}-") plus XTO (still its own separate, hardcoded-prefix case,
 * per client instruction -- not part of the generic centrale list).
 *
 * Returns both the flat product list (id, name, price, ref) and a `kits`
 * map used to build the "Kit 1"/"Kit 2" quick-apply buttons: which refs
 * are included in each kit and at what quantity. Kit membership columns
 * (one "inclu KIT-XXX" / "QTE KIT-XXX" pair per kit) are found by
 * scanning the header row for that exact wording -- NOT by fixed column
 * letters -- so a new centrale's kit columns can go anywhere in the
 * sheet. This reintroduces header-text scanning after an earlier version
 * of this function was moved away from it (a past bug conflated the
 * "inclu" and "QTE" columns for at least one kit) -- the two are now
 * matched by strict, distinct keywords ("inclu " vs "qte "/"quantite ")
 * at the START of the header text, and only ever read from the header
 * itself, never inferred from a row's data values, which is what the
 * earlier bug actually did wrong.
 */
/**
 * One "centrale" (Titane, Jablotron, or a future one added the same way),
 * discovered from Kit_Base_Alarme's Groupe column rather than hardcoded --
 * this is what lets a new centrale be added via the Sheet alone. XTO and
 * Location are deliberately excluded here (client instruction: they're a
 * different, monthly-only rental model, not "a centrale like Titane" --
 * they keep their own separate, hand-written logic elsewhere).
 */
export interface AlarmCentral {
  /** REF prefix used to match this centrale's rows elsewhere (Produits_Alarme,
   * Config) -- derived from its kit refs, e.g. "TIT" from "KIT-TIT-1". */
  prefix: string;
  /** Display name, from Kit_Base_Alarme's "Nom" column for its first kit
   * with the article stripped (e.g. "Titane 1" -> "Titane"). Falls back to
   * the Groupe value itself if that doesn't parse. */
  name: string;
  /** This centrale's kits, in the Sheet's row order (normally 2). */
  kits: { ref: string; name: string; price: number | null; fiche?: string }[];
}

export async function fetchAlarmCentralsFromSheet(): Promise<AlarmCentral[]> {
  if (alarmCentralsCache && Date.now() - alarmCentralsCache.fetchedAt < CACHE_TTL_MS) {
    return alarmCentralsCache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID is not configured');
  }

  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: KIT_BASE_ALARME_RANGE,
  });

  const rawRows = response.data.values || [];
  const rows = rowsByHeader(rawRows, ['REF', 'Nom', 'Groupe']);

  // KIT-{PREFIX}-{N} -- the numbered-kit shape every generic centrale's
  // rows follow (KIT-TIT-1, KIT-JAB-2...). KIT-XTO / KIT-LOC don't match
  // (no trailing -N), which is a second, independent signal alongside the
  // Groupe check below that they're not part of this generic list.
  const KIT_REF_PATTERN = /^KIT-([A-Z0-9]+)-\d+$/i;
  const EXCLUDED_GROUPS = new Set(['xto', 'location']);

  const byPrefix = new Map<string, AlarmCentral>();

  for (const row of rows) {
    const ref = (row['REF'] || '').trim();
    const groupe = (row['Groupe'] || '').trim();
    if (!ref || EXCLUDED_GROUPS.has(groupe.toLowerCase())) continue;

    const match = ref.match(KIT_REF_PATTERN);
    if (!match) continue; // not a numbered generic kit (e.g. KIT-XTO, KIT-LOC, or a typo) -- skip
    const prefix = match[1].toUpperCase();

    const nom = (row['Nom'] || '').trim();
    const price = parseFloat(row['Prix'] || '');
    const ficheRaw = row['ID Drive fiche technique'] ? row['ID Drive fiche technique'].trim() : '';
    const fiche = ficheRaw ? extractDriveFileId(ficheRaw) : undefined;

    if (!byPrefix.has(prefix)) {
      // Display name: the Groupe column as-is (e.g. "Titane") is the
      // intended display name -- more reliable than trying to strip a
      // trailing "1"/"2" off the per-kit Nom.
      byPrefix.set(prefix, { prefix, name: groupe || prefix, kits: [] });
    }
    byPrefix.get(prefix)!.kits.push({
      ref,
      name: nom || ref,
      price: isNaN(price) ? null : price,
      fiche,
    });
  }

  const centrals = Array.from(byPrefix.values());

  if (centrals.length === 0) {
    throw new Error('Kit_Base_Alarme: aucune centrale generique trouvee (colonnes REF/Nom/Groupe, hors XTO/Location)');
  }

  alarmCentralsCache = { data: centrals, fetchedAt: Date.now() };
  return centrals;
}

export async function fetchAlarmProductsFromSheet(): Promise<{ products: AlarmProduct[]; xtoProducts: AlarmProduct[]; kits: Record<string, { ref: string; quantity: number }[]>; installationPrices: Record<string, number | null> }> {
  if (alarmCache && Date.now() - alarmCache.fetchedAt < CACHE_TTL_MS) {
    return alarmCache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID is not configured');
  }

  // The list of "generic" centrales (Titane, Jablotron, and any future one)
  // comes from Kit_Base_Alarme, not hardcoded -- this is what lets a new
  // centrale be added via the Sheet alone.
  const centrals = await fetchAlarmCentralsFromSheet();

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

  // Every kit we expect to find a column pair for: each generic centrale's
  // kits, plus XTO and Location's (still hardcoded refs -- excluded from
  // the generic centrale list per client instruction, but their columns
  // are found the same header-driven way).
  const expectedKitRefs = [
    ...centrals.flatMap((c) => c.kits.map((k) => k.ref)),
    'KIT-XTO',
    'KIT-LOC',
  ];

  // Kit membership columns are found by scanning the header row for
  // "inclu KIT-XXX" / "qte KIT-XXX" (or "quantite KIT-XXX"), matched as
  // the first word(s) of the header text -- strict, distinct keywords, so
  // "inclu" and "qte" can never be confused with each other, and nothing
  // here ever looks at a row's data values to decide a column's role
  // (that inference, not header-text matching itself, was the earlier bug).
  const kitColumns: Record<string, { incluIdx?: number; qteIdx?: number }> = {};
  headerRow.forEach((h: string, i: number) => {
    const header = (h || '').trim();
    if (!header) return;
    const incluMatch = header.match(/^inclu[a-zé]*\s+(KIT-\S+)$/i);
    if (incluMatch) {
      const kitRef = incluMatch[1].toUpperCase();
      kitColumns[kitRef] = { ...(kitColumns[kitRef] || {}), incluIdx: i };
      return;
    }
    const qteMatch = header.match(/^(?:qte|quantit[ée])\s+(KIT-\S+)$/i);
    if (qteMatch) {
      const kitRef = qteMatch[1].toUpperCase();
      kitColumns[kitRef] = { ...(kitColumns[kitRef] || {}), qteIdx: i };
      return;
    }
  });

  const missingKitCols = expectedKitRefs.filter((ref) => {
    const cols = kitColumns[ref];
    return !cols || cols.incluIdx === undefined || cols.qteIdx === undefined;
  });
  if (missingKitCols.length > 0) {
    throw new Error(`Produits_Alarme: colonnes "inclu ${missingKitCols[0]}" / "QTE ${missingKitCols[0]}" introuvables (et pour: ${missingKitCols.join(', ')}) -- verifier le texte exact des en-tetes`);
  }

  const products: AlarmProduct[] = [];
  // XTO rows (location "Chantier") live in the same sheet but are priced and
  // used completely differently from any centrale (monthly, no central
  // choice) -- kept in a separate array rather than mixed into `products`.
  const xtoProducts: AlarmProduct[] = [];
  const kits: Record<string, { ref: string; quantity: number }[]> = {};
  expectedKitRefs.forEach((ref) => { kits[ref] = []; });
  // Keyed by lowercased centrale name (e.g. "titane", "jablotron") --
  // matches what the UI already reads (installationPrices.titane etc.)
  // for the two existing centrales, and a new one slots in the same way.
  const installationPrices: Record<string, number | null> = {};
  centrals.forEach((c) => { installationPrices[c.name.toLowerCase()] = null; });
  let nextId = 600;
  let nextXtoId = 900;

  rawRows.slice(1).forEach((row) => {
    const ref = (row[idxOf['REF']] || '').trim();
    if (!ref) return; // blank rows: skip

    const nom = (row[idxOf['Nom']] || '').trim();
    if (!nom) return;

    const price = parseFloat(row[idxOf['PRIX']] || '');
    const ficheRaw = idxOf['Fiche'] !== undefined ? (row[idxOf['Fiche']] || '').trim() : '';
    const fiche = ficheRaw ? extractDriveFileId(ficheRaw) : undefined;

    const matchingCentral = centrals.find((c) => ref.startsWith(`${c.prefix}-`));

    if (ref.startsWith('XTO-')) {
      // Unlike centrale rows, a blank price here is valid -- items that
      // only exist as part of the kit (XTO-CON, XTO-MIS, XTO-SIG...) have
      // no standalone sale price in the Sheet. Skipping them on NaN
      // silently dropped them from the kit display even though their
      // Inclu/QTE was correctly set (client-reported bug) -- default to 0
      // instead so every XTO row is captured.
      xtoProducts.push({ id: nextXtoId, name: nom, price: isNaN(price) ? 0 : price, ref, fiche });
      nextXtoId += 1;
      // XTO rows also feed KIT-XTO the same way centrale rows feed their
      // own kits, via the shared kit-membership loop below.
    } else if (!matchingCentral) {
      return; // unrelated row (no known centrale prefix, not XTO-): skip
    }

    // Installation (e.g. TIT-INS/JAB-INS) is not a selectable material
    // line -- its price feeds the separate "🔧 Installation" section
    // instead (client request), same treatment as Visiophone's
    // Installation et paramétrage.
    if (matchingCentral && ref === `${matchingCentral.prefix}-INS`) {
      if (!isNaN(price)) {
        installationPrices[matchingCentral.name.toLowerCase()] = price;
      }
      return;
    }

    if (!isNaN(price) && !ref.startsWith('XTO-')) {
      products.push({ id: nextId, name: nom, price, ref, fiche });
      nextId += 1;
    }

    expectedKitRefs.forEach((code) => {
      const { incluIdx, qteIdx } = kitColumns[code];
      const rawIncluValue = String(row[incluIdx!] ?? '').trim().toUpperCase();
      const included = ['1', 'TRUE', 'VRAI', 'OUI', 'YES', 'X'].includes(rawIncluValue);
      if (included) {
        const qty = parseInt(row[qteIdx!] || '1', 10) || 1;
        kits[code].push({ ref, quantity: qty });
      }
    });
  });

  if (products.length === 0) {
    throw new Error('Produits_Alarme: aucune ligne de centrale exploitable');
  }

  const data = { products, xtoProducts, kits, installationPrices };
  alarmCache = { data, fetchedAt: Date.now() };
  return data;
}

/**
 * Fetch the "Produits_Cameras" tab. Columns matched by header text, not
 * position (same lesson as Visiophone/Alarme): "Nom" and "REF" exact,
 * "Prix de vente" as a substring (exact header is "Prix de vente (CHF)"),
 * "Type" exact, "4G" as a substring (safe — no other header contains it).
 *
 * Installation rows (ref starting "INS-") are split out into
 * installationProducts rather than the main catalog — matches how
 * Visiophone/Alarme keep Installation out of the selectable material list.
 * INS-4G ("Installation caméra 4G + P. solaire") carries a sheet note:
 * "à ne montrer que si Mini Solar sélectionnée" — enforced in the UI by
 * checking for CAM-MINI-SOLAR in the material lines, not here.
 *
 * `type` and `is4G` replace the old hardcoded CAMERA_DEVICE_IDS set and
 * name.includes('4G') checks used by calculateRemoteAccessPrice and the
 * maintenance-counting logic.
 *
 * No fallback on failure, same reasoning as the other categories.
 */
export async function fetchCameraProductsFromSheet(): Promise<{ products: CameraProduct[]; installationProducts: CameraProduct[] }> {
  if (cameraCache && Date.now() - cameraCache.fetchedAt < CACHE_TTL_MS) {
    return cameraCache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID is not configured');
  }

  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: CAMERA_RANGE,
  });

  const rawRows = response.data.values || [];
  const [headerRow] = rawRows;
  if (!headerRow) {
    throw new Error('Produits_Cameras: en-tête introuvable');
  }

  const findIdx = (needle: string, exact = false) =>
    headerRow.findIndex((h: string) => {
      const cell = (h || '').trim().toUpperCase();
      return exact ? cell === needle.toUpperCase() : cell.includes(needle.toUpperCase());
    });

  const nomIdx = findIdx('Nom', true);
  const refIdx = findIdx('REF', true);
  const prixIdx = findIdx('Prix de vente');
  const typeIdx = findIdx('Type', true);
  const g4Idx = findIdx('4G');
  const ficheIdx = findIdx('ID Drive fiche technique', true);

  const missingCols = [
    ['Nom', nomIdx], ['REF', refIdx], ['Prix de vente', prixIdx], ['Type', typeIdx], ['4G', g4Idx],
  ].filter(([, idx]) => idx === -1).map(([name]) => name);
  if (missingCols.length > 0) {
    throw new Error(`Produits_Cameras: colonne(s) introuvable(s) : ${missingCols.join(', ')}`);
  }

  const products: CameraProduct[] = [];
  const installationProducts: CameraProduct[] = [];
  let nextId = 700;

  rawRows.slice(1).forEach((row) => {
    const nom = (row[nomIdx] || '').trim();
    const ref = (row[refIdx] || '').trim();
    if (!nom || !ref) return;

    const price = parseFloat(row[prixIdx as number] || '');
    if (isNaN(price)) return;

    const type = (row[typeIdx as number] || '').trim() || undefined;
    const is4GRaw = String(row[g4Idx as number] ?? '').trim().toUpperCase();
    const is4G = ['1', 'TRUE', 'VRAI', 'OUI', 'YES', 'X'].includes(is4GRaw);

    const product: CameraProduct = { id: nextId, name: nom, price, ref, type, is4G };
    if (ficheIdx !== -1) {
      const ficheRaw = (row[ficheIdx] || '').trim();
      if (ficheRaw) product.fiche = extractDriveFileId(ficheRaw);
    }
    nextId += 1;

    if (ref.startsWith('INS-')) {
      installationProducts.push(product);
    } else {
      products.push(product);
    }
  });

  if (products.length === 0) {
    throw new Error('Produits_Cameras: aucune ligne produit exploitable');
  }

  const data = { products, installationProducts };
  cameraCache = { data, fetchedAt: Date.now() };
  return data;
}

/**
 * Fetch the "Config" tab as a flat map keyed by REF (TVA, SIM, FD,
 * TIT-AUTO-SIM, CAM-VIS-DIS, etc. -> numeric value). Backs the shared
 * TVA/Carte SIM/Frais de dossier values (now single global rows, client
 * consolidated the old per-category duplicates), the Alarme surveillance
 * service prices, and the Camera vision-à-distance/maintenance prices.
 *
 * "Valeur" is parsed with comma-as-decimal-separator (Google Sheets
 * exports "8,1" for 8.1 in this locale) — plain parseFloat would read
 * "8,1" as 8, so the comma is replaced before parsing.
 */
export async function fetchConfigFromSheet(): Promise<Record<string, number>> {
  if (configCache && Date.now() - configCache.fetchedAt < CACHE_TTL_MS) {
    return configCache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID is not configured');
  }

  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: CONFIG_RANGE,
  });

  const rawRows = response.data.values || [];
  const rows = rowsByHeader(rawRows, ['REF', 'Valeur']);

  const config: Record<string, number> = {};
  for (const row of rows) {
    const ref = (row['REF'] || '').trim();
    if (!ref) continue;
    const value = parseFloat((row['Valeur'] || '').replace(',', '.'));
    if (isNaN(value)) continue;
    config[ref] = value;
  }

  if (Object.keys(config).length === 0) {
    throw new Error('Config: aucune ligne exploitable');
  }

  configCache = { data: config, fetchedAt: Date.now() };
  return config;
}

/**
 * Fetch the property-type options ("Type de bien") from the same Config
 * tab -- TYP-APP/TYP-COM/TYP-ENT/TYP-HAB/TYP-LOC/TYP-VIL rows, REF -> the
 * Variable column as the display label (e.g. TYP-APP -> "Appartement").
 * Separate from fetchConfigFromSheet: these rows have no numeric Valeur
 * (label-only by design), so they're invisible to that function's
 * isNaN(value) filter, and mixing a label map into a Record<string,number>
 * would change a return type several other callers already depend on.
 */
export async function fetchPropertyTypeLabelsFromSheet(): Promise<Record<string, string>> {
  if (propertyTypeCache && Date.now() - propertyTypeCache.fetchedAt < CACHE_TTL_MS) {
    return propertyTypeCache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID is not configured');
  }

  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: CONFIG_RANGE,
  });

  const rawRows = response.data.values || [];
  const rows = rowsByHeader(rawRows, ['REF', 'Variable']);

  const labels: Record<string, string> = {};
  for (const row of rows) {
    const ref = (row['REF'] || '').trim();
    if (!ref.startsWith('TYP-')) continue;
    const label = (row['Variable'] || '').trim();
    if (!label) continue;
    labels[ref] = label;
  }

  if (Object.keys(labels).length === 0) {
    throw new Error('Config: aucune ligne TYP- exploitable');
  }

  propertyTypeCache = { data: labels, fetchedAt: Date.now() };
  return labels;
}

/**
 * One selectable "service de surveillance" option, read from Config rows
 * where Type = "Service de surveillance" -- not hardcoded per centrale
 * (client instruction, confirmed via example spreadsheet): a new
 * centrale's surveillance options appear automatically once its rows
 * exist here, no code change needed.
 */
export interface SurveillanceOption {
  ref: string;
  /** Config's Kit_Base column -- the centrale this option belongs to
   * (e.g. "Titane"), matched case-insensitively against a centrale's name. */
  kitBase: string;
  /** Display label, from Variable. */
  label: string;
  price: number;
  /** True when Config's "Inclu carte SIM" column is set (1/true/x/oui) --
   * drives hiding the one option that doesn't (typically "sans carte
   * SIM") once a SIM card is already selected elsewhere on the quote. */
  includesSimCard: boolean;
}

export async function fetchSurveillanceOptionsFromSheet(): Promise<SurveillanceOption[]> {
  if (surveillanceOptionsCache && Date.now() - surveillanceOptionsCache.fetchedAt < CACHE_TTL_MS) {
    return surveillanceOptionsCache.data;
  }

  if (!SPREADSHEET_ID) {
    throw new Error('GOOGLE_SHEETS_ID is not configured');
  }

  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: CONFIG_RANGE,
  });

  const rawRows = response.data.values || [];
  const rows = rowsByHeader(rawRows, ['REF', 'Type', 'Variable', 'Valeur', 'Kit_Base']);

  const options: SurveillanceOption[] = [];
  for (const row of rows) {
    const type = (row['Type'] || '').trim().toLowerCase();
    if (type !== 'service de surveillance') continue;

    const ref = (row['REF'] || '').trim();
    const label = (row['Variable'] || '').trim();
    const price = parseFloat(row['Valeur'] || '');
    if (!ref || !label || isNaN(price)) continue;

    const includesRaw = (row['Inclu carte SIM'] || '').trim().toUpperCase();
    const includesSimCard = ['1', 'TRUE', 'VRAI', 'OUI', 'YES', 'X'].includes(includesRaw);

    options.push({
      ref,
      kitBase: (row['Kit_Base'] || '').trim(),
      label,
      price,
      includesSimCard,
    });
  }

  surveillanceOptionsCache = { data: options, fetchedAt: Date.now() };
  return options;
}
