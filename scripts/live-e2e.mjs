// End-to-end test using PROD base templates.
// For each quote type:
//   1. Generate quote PDF locally via jsPDF
//   2. Fetch the base template from PROD /api/drive-fetch (post-redeploy)
//   3. Run the exact assembly steps from src/lib/pdf-assembly.ts
//      (5 base pages + quote page + remaining base + overlays)
//   4. Save assembled PDF + render page 2 to PNG so we can visually confirm:
//        - new dossier content (matches the IDs the client just sent)
//        - "de vos locaux" overlay lands after "sécurité"
//        - "vidéo" mask works on visiophone
//
// This is the cleanest live test we can do without triggering a real
// upload/email/DB write in prod.

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { pdf as pdfToImg } from 'pdf-to-img';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { jsPDF } from 'jspdf';

const PROD = 'https://generateur-devis.vercel.app';
const OUT = 'scripts/_out';
mkdirSync(OUT, { recursive: true });

const BASE_IDS = {
  alarmTitane:    '1Dscba9DsFZviqGCRux2TXInreek8CqnD',
  alarmJablotron: '1xAA0dRnhaiUYau-x1H5Yr4DQrk24FZiO',
  video:          '1KkvlodmpCbOwtNl2m5v9MUh76aZdx90I',
  fog:            '1mXvbIiTYZZyV5Pmqw22rIS4zguAyZtaq',
  visiophone:     '10GvZ8ctB7EBZxED9jILegbRZ3Fom4WiV',
};

const OVERLAY = { x: 126, yFromTop: 315, fontSize: 11 };
const PROPERTY_TEXT = 'de vos locaux';

async function fetchBase(id) {
  const r = await fetch(`${PROD}/api/drive-fetch?fileId=${id}&_=${Date.now()}`);
  if (!r.ok) throw new Error(`${id} ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function asPng(buf, pageIndex) {
  const doc = await pdfToImg(buf, { scale: 2 });
  let i = 0;
  for await (const png of doc) { if (i === pageIndex) return png; i++; }
}

// Minimal quote page generator (1 page) — stands in for a real quote.
function makeQuotePage(label) {
  const d = new jsPDF('portrait', 'pt', 'a4');
  d.setFontSize(18); d.text(`Devis ${label}`, 40, 60);
  d.setFontSize(10); d.text('Page de devis générée localement pour test E2E', 40, 80);
  d.text('Cette page sera insérée comme page 6 dans le dossier prod', 40, 100);
  return Buffer.from(d.output('arraybuffer'));
}

async function assembleAndSave(name, baseId, opts = {}) {
  const baseBuf = await fetchBase(baseId);
  const basePdf = await PDFDocument.load(baseBuf);
  const basePages = basePdf.getPageCount();
  const quoteBuf = makeQuotePage(name);
  const quotePdf = await PDFDocument.load(quoteBuf);

  const pdfDoc = await PDFDocument.create();
  for (let i = 0; i < 5 && i < basePages; i++) {
    const [p] = await pdfDoc.copyPages(basePdf, [i]);
    pdfDoc.addPage(p);
  }
  const [qp] = await pdfDoc.copyPages(quotePdf, [0]);
  pdfDoc.addPage(qp);
  if (basePages > 5) {
    for (let i = 5; i < basePages; i++) {
      const [p] = await pdfDoc.copyPages(basePdf, [i]);
      pdfDoc.addPage(p);
    }
  }

  const page2 = pdfDoc.getPage(1);
  const { height } = page2.getSize();
  if (opts.maskVideo) {
    page2.drawRectangle({ x: 423, y: 538, width: 32, height: 14, color: rgb(1, 1, 1), borderWidth: 0 });
  }
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page2.drawText(PROPERTY_TEXT, { x: OVERLAY.x, y: height - OVERLAY.yFromTop, size: OVERLAY.fontSize, font, color: rgb(0,0,0) });

  const bytes = await pdfDoc.save();
  writeFileSync(join(OUT, `${name}-assembled.pdf`), Buffer.from(bytes));
  const p2png = await asPng(Buffer.from(bytes), 1);
  writeFileSync(join(OUT, `${name}-p2.png`), p2png);
  console.log(`${name}: ${pdfDoc.getPageCount()} pages, assembled OK`);
}

await assembleAndSave('LIVE-alarm-titane',    BASE_IDS.alarmTitane);
await assembleAndSave('LIVE-alarm-jablotron', BASE_IDS.alarmJablotron);
await assembleAndSave('LIVE-camera',          BASE_IDS.video);
await assembleAndSave('LIVE-fog',             BASE_IDS.fog);
await assembleAndSave('LIVE-visiophone',      BASE_IDS.visiophone, { maskVideo: true });

console.log('\nDone. Inspect scripts/_out/LIVE-*-p2.png to confirm overlay + mask placement.');
