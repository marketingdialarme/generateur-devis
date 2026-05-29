// Confirm the new (113, 315) overlay coords land on the alarm Titane base page 2.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { pdf as pdfToImg } from 'pdf-to-img';
import { writeFileSync } from 'node:fs';

const ALARM_TITANE = '12Ntu8bsVpO_CXdAOvL2V_AZcnGo6sA-S';
const PROD = 'https://generateur-devis.vercel.app';

const r = await fetch(`${PROD}/api/drive-fetch?fileId=${ALARM_TITANE}`);
const raw = Buffer.from(await r.arrayBuffer());

const pdfDoc = await PDFDocument.load(raw);
const page = pdfDoc.getPage(1);
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const { height } = page.getSize();
page.drawText('de vos locaux', { x: 126, y: height - 315, size: 11, font, color: rgb(0, 0, 0) });
const out = await pdfDoc.save();
writeFileSync('scripts/_out/alarm-with-overlay.pdf', Buffer.from(out));

async function asPng(buf, pageIndex) {
  const doc = await pdfToImg(buf, { scale: 2 });
  let i = 0;
  for await (const png of doc) { if (i === pageIndex) return png; i++; }
}
const png = await asPng(Buffer.from(out), 1);
writeFileSync('scripts/_out/alarm-page2-AFTER.png', png);
console.log('done');
