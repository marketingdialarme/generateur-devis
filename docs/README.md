# Documentation index

| Document | What it covers | Status |
|---|---|---|
| [GUIDE_ADMIN.md](GUIDE_ADMIN.md) | Non-technical guide for Dialarme staff: updating templates, fiches techniques, folders | Current |
| [DEPLOYMENT.md](DEPLOYMENT.md) | First-time setup of Google Cloud, Drive, Supabase and Vercel | Current, see caveat below |
| [QUICK_START_OAUTH.md](QUICK_START_OAUTH.md) | Generating and rotating the Google OAuth refresh token | Current |
| [HANDOFF.md](HANDOFF.md) | Developer handover written May 2026 | Historical, see caveat below |
| [archive/](archive/) | Point-in-time working notes from 2025, kept for reference only | Obsolete |

## Caveats on the older documents

`HANDOFF.md` and `DEPLOYMENT.md` predate two later changes and are wrong on
these points. The [root README](../README.md) is authoritative.

- **Email is sent with nodemailer over SMTP**, not Resend. The `SMTP_*`
  variables are the ones that matter, `RESEND_API_KEY` is no longer read.
- **The conseillers list is no longer hardcoded** in `src/lib/config.ts`. It is
  read live from the "Conseiller" tab of the Google Sheet identified by
  `GOOGLE_SHEETS_ID`, with no static fallback.
- **`src/lib/products/catalog.ts`, `src/components/ui/*`, `ProductSection.tsx`
  and `useCameraTotals.ts` no longer exist.** Product prices live in
  `src/lib/quote-generator.ts`.
- **Vercel Blob is no longer used**, `BLOB_READ_WRITE_TOKEN` is not read by any
  current code path.

## Security note

`oauth-credentials.json` was committed early in the project's history and later
removed from the working tree. It is still recoverable from git history, so the
credentials it contained must be treated as compromised. They were rotated in
May 2026. Never restore that file to the repo, use environment variables.
