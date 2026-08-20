## What changed

<!-- One or two sentences. Link the request (Google Sheet row, email, ticket). -->

## Why

<!-- The business rule behind it. A future dev will read this before the diff. -->

## Verification

- [ ] `npm run type-check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] If the PDF output changed: rendered a quote and **looked at it**
      (`npx tsx scripts/render-verify-aug.ts`, then open `scripts/_out/*.pdf`)
- [ ] If a price or catalog changed: checked the figure against the client's
      reference spreadsheet, not from memory

## Risk

<!-- What could this break that tests would not catch? Drive/env/sheet deps? -->
