# Dialarme — Générateur de devis

Internal web app used by Dialarme's conseillers to build a security-system
quote (alarme, caméra, générateur de brouillard, visiophone), turn it into a
branded PDF, save it to Google Drive and email it to the client.

Live: https://generateur-devis.vercel.app

---

## How a quote is actually produced

This is the mental model to hold before touching anything. The PDF a client
receives is **two documents stitched together**:

1. **The quote page** is drawn with **jsPDF, in the browser**
   (`src/lib/pdf-generator.ts`). Rows, totals, rabais, surveillance block.
2. **The dossier** is a pre-made presentation PDF stored in **Google Drive**.
   `src/lib/pdf-assembly.ts` downloads it and **inserts the quote page at
   page 6**, then appends optional documents (type de bien, intervention
   police).
3. The result is uploaded to a Drive subfolder and emailed (SMTP/nodemailer).

Consequence worth remembering: if Drive cannot serve the dossier, assembly
**silently ships the bare quote page instead of failing**. That is exactly
what "il n'y a pas de dossier, seulement le devis chiffré" means when a
conseiller reports it. Nothing is broken in the code, a Drive ID or a
permission is wrong. See *Gotchas*.

## Stack

| Concern | What is actually used |
|---|---|
| Framework | Next.js 14, App Router |
| Language | TypeScript |
| Quote page | jsPDF (client-side) |
| Assembly | pdf-lib (merges Drive template + quote page) |
| Drive | Google Drive REST API, **OAuth refresh token** (not a service account) |
| Conseillers list | Google Sheets, read live at runtime |
| Email | nodemailer over SMTP |
| Logging (optional) | Supabase |
| Hosting | Vercel, auto-deploy on push to `main` |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill it, see below
npm run dev                  # http://localhost:3000/create-devis
```

The UI renders without Google credentials, but PDF assembly, Drive upload and
email will fail. Production values live in **Vercel > Settings > Environment
Variables** and are the source of truth. Every variable is documented in
[`.env.example`](.env.example).

```bash
npm run type-check   # tsc --noEmit
npm test             # vitest, unit + PDF content assertions
npm run build        # catches deleted-but-still-imported modules
```

## Repo map

```
src/
  app/
    create-devis/page.tsx     Main UI. All four product tabs, all form state.
    api/
      commercials/            Conseillers, read live from the Google Sheet
      drive-fetch/            Proxies a Drive file by ID (allowlisted, see Gotchas)
      drive-fetch-product/    Camera fiches techniques, by name or direct ID
      drive-upload/           Saves the assembled PDF to the right subfolder
      send-quote/             Orchestrates upload + email
      config/                 Public config for the frontend
  lib/
    quote-generator.ts        Product catalogs, prices, kits, quote numbers,
                              facilité-de-paiement formulas. Prices live HERE.
    calculations.ts           Pure totals: sections, réductions, mensualités
    pdf-generator.ts          jsPDF rendering of the quote page, per product type
    pdf-assembly.ts           pdf-lib merge: Drive template + quote page + extras
    config.ts                 Every env var + Drive IDs + conseillers cache
    product-line-adapter.ts   Adapts UI rows for calculations and rendering
    product-sheet-mapping.ts  Camera product name -> Drive fiche filename
    services/                 google-drive, google-sheets, email, database, pdf
  hooks/                      Thin glue around generation, assembly, sending
  components/                 Form sections (product line, services, options...)
scripts/                      Dev utilities, see below
```

### Where things live, in practice

| To change... | Edit |
|---|---|
| A product price or a catalog entry | `src/lib/quote-generator.ts` |
| Base kit contents (incl. the XTO kit) | `src/lib/quote-generator.ts` (`CENTRALS_CONFIG`, `XTO_KIT_LINES`) |
| Anything printed on the quote page | `src/lib/pdf-generator.ts` |
| Totals, réductions, mensualités | `src/lib/calculations.ts` |
| Which Drive document is used | **Vercel env vars**, not the code fallback |
| The conseillers list | The "Conseiller" tab of the Google Sheet |

## Gotchas

These have each cost real debugging time. Read them before opening an issue.

- **A Vercel env var overrides the ID you read in `config.ts`.** The values in
  code are only fallbacks. `/api/drive-fetch` additionally serves **only IDs
  present in the config allowlist**, and refuses anything else with
  `404 {"error":"File not found"}`. So a stale `GOOGLE_DRIVE_FILE_*` in Vercel
  makes the app return 404 for a file that is present and correctly shared in
  Drive. Symptom: one product type loses its dossier while the others work.
  A genuine Drive/permission failure looks different, it returns **500
  `Failed to fetch document`**. Use that distinction to tell the two apart.
- **The conseillers list has no static fallback.** It is fetched live from the
  Google Sheet. If `GOOGLE_SHEETS_ID` is unset or the sheet is unreachable, the
  dropdown is simply empty.
- **A failed dossier fetch does not raise an error to the user.** The quote is
  still generated and sent, just without its dossier.
- **The OAuth account is a real Google user**, `devis.dialarme@gmail.com`.
  Every Drive file the app touches must be readable by that account. The
  refresh token is regenerated with `node scripts/get-refresh-token.mjs`.
- **Prices are not in a database.** They are hardcoded catalogs in
  `quote-generator.ts`, and they differ between Titane and Jablotron.
- **Test the PDF by looking at it.** Unit tests assert on text present in the
  content stream. They cannot tell you a column collides or a total is
  visually wrong. Render and open the file.

## Verifying a change to the PDF

```bash
npx tsx scripts/render-verify-aug.ts   # writes scripts/_out/*.pdf, then open it
npx tsx scripts/render-quote.ts        # renders one sample per product type
node scripts/smoke-prod.mjs            # hits the deployed app
```

`scripts/_out/` is gitignored. These scripts are dev utilities, they are not
part of the build.

## Deployment

Push to `main`, Vercel builds and deploys. Environment variables are managed in
the Vercel dashboard, changing one requires a redeploy to take effect.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Further documentation lives in
[`docs/`](docs/): admin guide, deployment setup, OAuth setup and the developer
handover note.
