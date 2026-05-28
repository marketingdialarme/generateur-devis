# Handoff: Dialarme Quote Generator

**Stack:** Next.js 14 (App Router) · TypeScript · jsPDF · pdf-lib · Google Drive API · Vercel Blob · Resend  
**Deployed on:** Vercel  
**Node requirement:** >=18.17.0

---

## 1. What this app does

The app is a serverless PDF quote generator for Dialarme, a Swiss security company. A commercial logs in, selects a client name, their own name, a product type (alarm, camera, fog generator, or visiophone), and configures product lines with quantities and optional discounts. Clicking "Générer" produces a branded PDF quote assembled from a template fetched from Google Drive, with the generated pricing page inserted at page 6. The final PDF is uploaded to Google Drive (into the relevant commercial's subfolder) and optionally emailed to both the client and the internal Dialarme inbox. Four product-type tabs exist — Alarme, Caméra, Brouillard, Visiophone — each with its own pricing logic and PDF layout.

---

## 2. What changed in this milestone

### Per-product section redesign
Each product type (alarm, camera, fog, visiophone) now has its own dedicated UI section with type-specific fields, replacing the previous generic layout. Entry point: `src/app/create-devis/page.tsx`. PDF rendering functions: `createAlarmPDFSections`, `createCameraPDFSections`, `createFogPDFSections`, `createVisioPDFSections` in `src/lib/pdf-generator.ts`.

### Quote number prefixes: DIA-TELES / DIA-AUTO / DIA-VID / DIA-GB / DIA-VISIO
Quote numbers now embed the product type and surveillance mode. Format: `DIA-{PREFIX}-YYYY-MM-DD-HHMM`. Logic: `generateQuoteNumber()` + `getAlarmQuoteNumberPrefix()` in `src/lib/pdf-generator.ts`. Prefix for fog is hardcoded `'GB'`; visiophone is `'VISIO'`; camera is always `'VID'`; alarm resolves to `'TELES'` or `'AUTO'` based on the selected surveillance type.

### "Offert" replaced by "Rabais partenariat"
The discount label displayed in the PDF was changed from "Offert" to "Rabais partenariat" across all product sections. Affects `src/lib/pdf-generator.ts`.

### Application + Alimentation always in alarm base kit
Products with IDs 110 (`Application`, CHF 0) and 111 (`Alimentation de secours`, CHF 0) are always injected into the alarm material lines on mount, regardless of which kit is selected. They display in the PDF as part of the base kit and cannot be removed. Defined in `src/lib/quote-generator.ts` (`CATALOG_ALARM_PRODUCTS`, IDs 110–111); populated in `src/app/create-devis/page.tsx`.

### Mensualité bound to surveillance HT price
The monthly payment total now correctly includes the surveillance (télésurveillance / autosurveillance) monthly cost in its base. The surveillance HT price feeds into `calculateAlarmTotals()` → `monthly.surveillanceHT`. Fix applied in `src/lib/calculations.ts`.

### Facilité de paiement text per duration
The payment-facility description line in the PDF now shows duration-specific text (e.g. "48 mensualités de CHF X.-") rather than a fixed string. Rendered in `createAlarmPDFSections` / `createCameraPDFSections` in `src/lib/pdf-generator.ts`.

### Price-update bug fix: priceTitane / priceJablotron threaded into totals
Previously, products defined with only `priceTitane` / `priceJablotron` (not a flat `price`) were resolving to 0 in totals because the central type was not being passed into the section calculator. Fix: `calculateSectionTotal()` in `src/lib/calculations.ts` now receives `selectedCentral`; `getLineUnitPrice()` in `src/lib/pdf-generator.ts` applies the same resolution logic. Both functions now mirror each other.

### Pagination for multi-page quotes
Long quotes (many product lines) now overflow onto additional pages rather than clipping at the bottom of page 1. jsPDF page-break logic added inside the section rendering functions in `src/lib/pdf-generator.ts`.

### Police-intervention document append
When the "Intervention de la police" option is selected on an alarm quote, the assembly step appends a separate Drive document after the quote page. Implementation: `addPoliceDocumentIfConfigured()` in `src/lib/pdf-assembly.ts`; `addPoliceDoc` flag passed through `usePdfAssembly` hook (`src/hooks/usePdfAssembly.ts`). The document file ID is set via `GOOGLE_DRIVE_FILE_POLICE` env var (see section 3).

### XTO folder routing
Alarm quotes using the XTO kit are now saved to a dedicated Drive subfolder. Resolved from `GOOGLE_DRIVE_FOLDER_XTO` (fallback: `GOOGLE_DRIVE_FOLDER_DEVIS_XTO`). Config: `src/lib/config.ts` (`folders.xto`).

### Dropdown fix for IDs 110 / 111 (Application / Alimentation)
The product dropdown in the "divers" section was incorrectly showing Application (110) and Alimentation de secours (111) as selectable options. These are now filtered out of the dropdown since they are always auto-included. Fix in `src/app/create-devis/page.tsx` and the relevant `ProductSection` usage.

---

## 3. Environment variables

Set in `.env.local` locally and in Vercel project settings for deployed environments.

| Variable | Required | Source | Purpose |
|---|---|---|---|
| `GOOGLE_CLIENT_ID` | Yes | Google Cloud Console > APIs & Services > Credentials | OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google Cloud Console > APIs & Services > Credentials | OAuth2 client secret |
| `GOOGLE_REFRESH_TOKEN` | Yes | Run `scripts/get-refresh-token.mjs` (see section 4) | Long-lived Drive access token |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | No | GCP > IAM > Service accounts | Alternative auth path (not currently used in main flow) |
| `GOOGLE_DRIVE_FOLDER_DEVIS` | Yes | Google Drive URL: `folders/{id}` | Root folder for all quotes |
| `GOOGLE_DRIVE_FOLDER_TECH_SHEETS` | Yes | Google Drive | Folder containing product PDFs for video assembly |
| `GOOGLE_DRIVE_FOLDER_PRODUCT_SHEETS` | No | Google Drive | Falls back to `GOOGLE_DRIVE_FOLDER_TECH_SHEETS` if unset |
| `GOOGLE_DRIVE_FOLDER_TITANE` | Yes | Google Drive | Subfolder for Titane alarm quotes |
| `GOOGLE_DRIVE_FOLDER_JABLOTRON` | Yes | Google Drive | Subfolder for Jablotron alarm quotes |
| `GOOGLE_DRIVE_FOLDER_VIDEO` | Yes | Google Drive | Subfolder for camera (video) quotes |
| `GOOGLE_DRIVE_FOLDER_XTO` | No | Google Drive | Subfolder for XTO kit quotes; falls back to `GOOGLE_DRIVE_FOLDER_DEVIS_XTO` |
| `GOOGLE_DRIVE_FOLDER_DEVIS_XTO` | No | Google Drive | Alternate env name for XTO folder |
| `GOOGLE_DRIVE_FILE_ALARME_TITANE` | Yes | Google Drive file ID | Template PDF for Titane alarm quotes (hardcoded fallback: `12Ntu8bsVpO_CXdAOvL2V_AZcnGo6sA-S`) |
| `GOOGLE_DRIVE_FILE_ALARME_JABLOTRON` | Yes | Google Drive file ID | Template PDF for Jablotron alarm quotes (hardcoded fallback: `1enFlLv9q681uGBSwdRu43r8Co2nWytFf`) |
| `GOOGLE_DRIVE_FILE_VIDEO` | Yes | Google Drive file ID | Template PDF for video quotes (hardcoded fallback: `15daREPnmbS1T76DLUpUxBLWahWIyq_cn`) |
| `GOOGLE_DRIVE_FILE_ACCESSORIES` | No | Google Drive file ID | Accessories sheet (no longer auto-appended; handled via product mapping) |
| `GOOGLE_DRIVE_FILE_POLICE` | No | Google Drive file ID | Document appended when "Intervention de la police" is selected. Leave empty until client provides the PDF (assembly skips it silently if unset). |
| `GOOGLE_DRIVE_FILE_PROPERTY_LOCAUX` | No | Google Drive file ID | Document appended for "Locaux" property type |
| `GOOGLE_DRIVE_FILE_PROPERTY_HABITATION` | No | Google Drive file ID | Document appended for "Habitation" |
| `GOOGLE_DRIVE_FILE_PROPERTY_VILLA` | No | Google Drive file ID | Document appended for "Villa" |
| `GOOGLE_DRIVE_FILE_PROPERTY_COMMERCE` | No | Google Drive file ID | Document appended for "Commerce" |
| `GOOGLE_DRIVE_FILE_PROPERTY_ENTREPRISE` | No | Google Drive file ID | Document appended for "Entreprise" |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project settings | Used for analytics/dashboard logging |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase project settings | Anon key for Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase project settings | Service role for server-side writes |
| `RESEND_API_KEY` | Yes (if email is used) | resend.com dashboard | Sends quote emails via Resend |
| `EMAIL_FROM` | No | — | Sender address (default: `devis@dialarme.ch`) |
| `EMAIL_INTERNAL` | No | — | Internal recipient (default: `devis.dialarme@gmail.com`) |
| `BLOB_READ_WRITE_TOKEN` | Yes (if Blob upload used) | Vercel project > Storage > Blob | Vercel Blob token for temporary PDF storage during send |
| `PDF_TIMEOUT_MS` | No | — | Timeout for PDF generation in ms (default: 30000) |

Get a Drive folder or file ID from its Google Drive URL: `https://drive.google.com/drive/folders/{ID}` or `https://drive.google.com/file/d/{ID}`.

---

## 4. How to regenerate the Google refresh token

The refresh token grants the app offline access to Google Drive. It does not expire unless revoked, but if the OAuth client credentials are rotated or the user revokes access you will see `invalid_grant: Bad Request` errors in Vercel function logs. When that happens:

```powershell
# Stop the dev server first (script uses port 3000)
$env:GOOGLE_CLIENT_ID="<your-client-id>"; $env:GOOGLE_CLIENT_SECRET="<your-client-secret>"; node scripts/get-refresh-token.mjs
```

1. The script prints an authorization URL. Open it in a browser.
2. Log in with the Dialarme Google account and click Allow.
3. The terminal prints the new `GOOGLE_REFRESH_TOKEN`.
4. Update `.env.local` and the Vercel environment variable (`vercel env rm GOOGLE_REFRESH_TOKEN` then `vercel env add GOOGLE_REFRESH_TOKEN`), then redeploy.

If `No refresh_token returned` is printed instead: go to https://myaccount.google.com/permissions, revoke the app's access, then re-run the script (the `prompt: 'consent'` flag forces a fresh grant).

---

## 5. How to add the police-intervention PDF

1. Upload the PDF to Google Drive (any folder accessible to the OAuth account).
2. Copy its file ID from the Drive URL.
3. Set `GOOGLE_DRIVE_FILE_POLICE=<file-id>` in Vercel environment variables.
4. Redeploy (Vercel picks up env changes on next deploy; no code change needed).

Until this is set, selecting "Intervention de la police" on a quote still works: the police-intervention document slot is silently skipped and the assembly completes without it. A `console.log` noting the missing config appears in function logs.

---

## 6. How to set the XTO folder

1. Create or locate the destination folder in Google Drive.
2. Copy the folder ID from its URL.
3. Set `GOOGLE_DRIVE_FOLDER_XTO=<folder-id>` in Vercel environment variables (or `GOOGLE_DRIVE_FOLDER_DEVIS_XTO` — both are checked, `GOOGLE_DRIVE_FOLDER_XTO` wins).
4. Redeploy.

XTO kit detection is based on whether any selected alarm product has `isXTO: true` in the catalog. The folder routing logic is in `src/app/api/drive-upload/route.ts`.

---

## 7. How to update fiches techniques (product data sheets)

Product data sheets for video quotes are fetched from Google Drive by name match at assembly time. To update a sheet:

1. Replace the PDF file in the Drive folder pointed to by `GOOGLE_DRIVE_FOLDER_TECH_SHEETS`.
2. Keep the exact same filename, or update the mapping if the name changed.

The name-to-Drive-filename mapping lives in `src/lib/product-sheet-mapping.ts`. If a new camera model is added or a sheet is renamed, update that mapping — no other code change is needed. The matching logic is handled in `src/app/api/drive-fetch-product/route.ts`.

---

## 8. Dev workflow

```powershell
npm install
npm run dev          # starts on http://localhost:3000
npm test             # runs 25 Vitest unit tests (calculations, quote numbers, PDF content)
npm run type-check   # tsc --noEmit, zero errors expected
npm run build        # production build
```

Copy `.env.local.example` (if present) or set the variables from section 3 manually in `.env.local` before running locally. The app will render UI without Drive credentials but PDF assembly and email sending will fail.

Tests live in `src/lib/__tests__/` and cover: Swiss rounding (`roundToFiveCents`), facilité de paiement formulas (`calculateFacilityPayment`), quote number generation, and PDF content assertions.

---

## 9. Repo layout

```
src/
  app/
    create-devis/page.tsx     # Main UI — all state, tabs, form inputs
    api/
      drive-fetch/            # Proxy: fetches Drive file by ID → ArrayBuffer
      drive-fetch-product/    # Proxy: fetches product sheet by name
      drive-upload/           # Saves assembled PDF to Drive subfolder
      send-quote/             # Sends email + uploads to Blob
      blob-upload/            # Vercel Blob upload endpoint
      email/                  # Resend email endpoint
      pdf/                    # PDF generation server action (fallback)
  lib/
    pdf-generator.ts          # jsPDF rendering: header, sections per product type, footer
    pdf-assembly.ts           # pdf-lib merge: base template + quote page + property/police docs + overlay
    calculations.ts           # Pure math: section totals, discounts, monthly payments
    quote-generator.ts        # Product catalogs, pricing constants, kit configs, helpers
    config.ts                 # All env vars + commercial directory
    product-sheet-mapping.ts  # Camera product name → Drive filename mapping
    product-collector.ts      # Collects product names from lines for sheet lookup
    product-line-adapter.ts   # Adapts ProductLineData for calculations and PDF rendering
    __tests__/                # Vitest unit tests
  hooks/
    usePdfGenerator.ts        # Wraps generateQuotePDF, manages loading state
    usePdfAssembly.ts         # Wraps assemblePdf, passes addPoliceDoc flag
    useQuoteSender.ts         # Orchestrates Blob upload + Drive upload + email
    useQuoteCalculations.ts   # Derived totals for real-time UI display
    useCameraTotals.ts        # Camera-specific totals hook
    useQuoteGenerator.ts      # Top-level state management hook
  components/
    ProductLine.tsx            # Single product line row (product, qty, offered toggle)
    ProductSection.tsx         # Collapsible section with add/remove lines
    ServicesSection.tsx        # Surveillance type + test cyclique
    OptionsSection.tsx         # Police intervention, service clés, etc.
    PaymentSelector.tsx        # Monthly duration selector
    CommercialSelector.tsx     # Commercial dropdown + custom entry
scripts/
  get-refresh-token.mjs        # One-shot OAuth token generator (dev utility)
  render-quote.ts              # Dev script: renders a quote to PDF locally
  pdf-to-png.mjs               # Dev script: converts PDF page to PNG for visual review
  _out/                        # Output directory for dev scripts
```

---

## 10. Known limitations and future work

**Application catalog price (0 vs 100 CHF visual):** `Application` (ID 110) has `price: 0` in the catalog, which is correct for sale quotes. In rental mode the price is conceptually 0 as well, but commercial feedback indicated a CHF 100/month value is sometimes expected on the PDF. There is currently no per-mode price override for this line; a `monthlyPrice` field would need to be added to the product definition.

**COMMERCIALS_LIST drift:** The list in `src/lib/quote-generator.ts` (`COMMERCIALS_LIST`, line 14) is a static array that is out of sync with the authoritative list in `src/lib/config.ts` (`config.commercials`). The page-level component (`src/app/create-devis/page.tsx`, line 37) also has a third inline copy. These should be consolidated to a single `getAllCommercials()` call from `config.ts`.

**Fog and visiophone `quote_type` label in Supabase:** If the dashboard queries Supabase by `quote_type`, note that fog quotes log as `'fog'` and visiophone as `'visiophone'` — not French labels. Adjust any dashboard filters accordingly.

**Standalone quote page assembly:** For fog and visiophone quotes, the assembly step currently returns the raw jsPDF output without wrapping it in a Drive template (no base document). If the client wants a branded cover page for these types, the same assembly pattern used by alarm/video (`assembleAlarmPdf` / `assembleVideoPdf` in `src/lib/pdf-assembly.ts`) can be extended.

**Inline price editor for standard products:** Product prices are currently hardcoded in the catalogs in `src/lib/quote-generator.ts`. Custom pricing requires using the "Autre" (ID 99) custom product row. An inline editable price field on each `ProductLine` component would remove that workaround.

---

## 11. Dev throwaways — do not deploy or commit

The following files are development utilities, not part of the production build. They should be in `.gitignore` (or removed):

- `scripts/render-quote.ts` — runs a local quote render to inspect PDF output
- `scripts/pdf-to-png.mjs` — converts a rendered PDF page to PNG for visual diffing
- `scripts/_out/` — output directory for the above two scripts
- `.claude/` — Claude Code session files (agent config, launch settings)

None of these are imported by the Next.js app and they have no effect on the build, but they add noise to the repo and `scripts/_out/` may contain generated PDFs with client data.
