# Contributing

Small team, client-facing output. The rules below exist because each one maps
to something that actually went wrong at least once.

## Branching

- `main` is deployed to production automatically by Vercel. Never commit to it
  directly, open a PR.
- Branch names describe the change: `fix/camera-dossier-id`,
  `feat/link-google-sheets-for-conseillers`.
- Delete the branch after merge.

## Before you open a PR

```bash
npm run type-check
npm test
npm run build
```

CI runs the same three on every PR. The build is not redundant with the type
check: it is the gate that catches a module deleted while still imported, or a
dependency removed from `package.json` while still used.

## If your change touches the PDF

Type checks and unit tests assert that text exists in the PDF content stream.
They cannot see that a label overlaps an amount, that a total is wrong, or that
a block landed on the wrong page. So:

```bash
npx tsx scripts/render-verify-aug.ts
# then actually open scripts/_out/*.pdf and look at it
```

State in the PR that you looked at the rendered output.

## If your change touches prices or catalogs

Prices are hardcoded in `src/lib/quote-generator.ts` and differ between Titane
and Jablotron. Check any figure against the client's reference spreadsheet
before committing. Never adjust a price from memory or by inference from a
screenshot.

## If your change touches Drive documents

The document IDs in `src/lib/config.ts` are **fallbacks**. Production reads the
`GOOGLE_DRIVE_FILE_*` environment variables in Vercel, and `/api/drive-fetch`
only serves IDs that appear in the resulting config allowlist. When a dossier
is reported missing, check the Vercel variable before touching code, and note
the difference between the two failure signatures:

| Response | Meaning |
|---|---|
| `404 {"error":"File not found"}` | The ID is not in the allowlist. A config/env problem. |
| `500 Failed to fetch document` | Drive itself refused. A permission, format or ownership problem. |

## Commit messages

Explain the business rule, not the diff. A future developer needs to know
*why* the frais de dossier are excluded from the facilité de paiement, not
that a line changed. Reference the client request (spreadsheet row, email
date) where one exists.

## Dead code

Delete it, along with its tests, in the same commit. Do not leave a module in
place "just in case", it will be imported again by accident.

## Secrets

Never commit `.env`, `.env.local` or `oauth-credentials.json`. They are
gitignored. Add any new variable to `.env.example` with a comment explaining
where its value comes from.
