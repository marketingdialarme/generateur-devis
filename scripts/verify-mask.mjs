// Verify the visiophone mask + overlay coords work against the live prod base.
// Fetches the prod-served visiophone base, applies the same pdf-lib operations
// as src/lib/pdf-assembly.ts, rasterizes page 2, and prints a small ASCII heat
// map of the "vidéo" region + overlay region so we can confirm the changes
// land where intended.

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { pdf as pdfToImg } from 'pdf-to-img';
import { writeFileSync } from 'node:fs';

const VISIO_ID = '10GvZ8ctB7EBZxED9jILegbRZ3Fom4WiV';
const PROD = 'https://generateur-devis.vercel.app';

async function fetchBase() {
  const r = await fetch(`${PROD}/api/drive-fetch?fileId=${VISIO_ID}`);
  if (!r.ok) throw new Error(`drive-fetch ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function asPng(buf, pageIndex) {
  const doc = await pdfToImg(buf, { scale: 2 });
  let i = 0;
  for await (const png of doc) {
    if (i === pageIndex) return png;
    i++;
  }
  throw new Error('page not found');
}

function darkCountAt(png, x, y, w, h) {
  // png is a Buffer of PNG bytes. Use Sharp-style decode? pdf-to-img returns
  // raw PNG. We need a PNG decoder. Use the built-in zlib + simple PNG parsing? too much.
  // Just write the PNG and let the user inspect it. Return file path.
  return null;
}

const raw = await fetchBase();
console.log('Fetched base:', raw.length, 'bytes');

// ORIGINAL page 2 PNG
const beforePng = await asPng(raw, 1);
writeFileSync('scripts/_out/visio-page2-BEFORE.png', beforePng);
console.log('Wrote scripts/_out/visio-page2-BEFORE.png');

// Apply mask + overlay (matches src/lib/pdf-assembly.ts exactly)
const pdfDoc = await PDFDocument.load(raw);
const page = pdfDoc.getPage(1);
page.drawRectangle({ x: 423, y: 538, width: 32, height: 14, color: rgb(1, 1, 1), borderWidth: 0 });
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const { height } = page.getSize();
page.drawText('de vos locaux', { x: 126, y: height - 315, size: 11, font, color: rgb(0, 0, 0) });
const out = await pdfDoc.save();
writeFileSync('scripts/_out/visio-masked.pdf', Buffer.from(out));
console.log('Wrote scripts/_out/visio-masked.pdf');

const afterPng = await asPng(Buffer.from(out), 1);
writeFileSync('scripts/_out/visio-page2-AFTER.png', afterPng);
console.log('Wrote scripts/_out/visio-page2-AFTER.png');
