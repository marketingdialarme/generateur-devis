/**
 * Headless render harness for the generated quote page (jsPDF).
 * Usage: npx tsx scripts/render-quote.ts
 * Writes scripts/_out/{alarm,camera}.pdf for visual verification against
 * the client reference (Alarme télésurveillance.pdf).
 *
 * THROWAWAY dev tool — not part of the app build.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { jsPDF } from 'jspdf';
import { generateQuotePDF, type PDFGenerationOptions } from '@/lib/pdf-generator';
import { calculateAlarmTotals, calculateCameraTotals } from '@/lib/calculations';
import { CATALOG_ALARM_PRODUCTS, CATALOG_CAMERA_MATERIAL, CATALOG_FOG_PRODUCTS, CATALOG_VISIOPHONE_PRODUCTS } from '@/lib/quote-generator';
import type { ProductLineData } from '@/components/ProductLine';

const outDir = join(process.cwd(), 'scripts', '_out');
mkdirSync(outDir, { recursive: true });
let _id = 1;

async function write(name: string, options: PDFGenerationOptions) {
  const blob = await generateQuotePDF(options, jsPDF);
  const buf = Buffer.from(await blob.arrayBuffer());
  writeFileSync(join(outDir, `${name}.pdf`), buf);
  console.log(`Wrote scripts/_out/${name}.pdf`, buf.length, 'bytes');
}

// ---------- ALARM ----------
const pa = (id: number) => CATALOG_ALARM_PRODUCTS.find((x) => x.id === id)!;
const al = (id: number, quantity: number, offered: boolean): ProductLineData => ({
  id: _id++, product: pa(id), quantity, offered,
});
const alarmMaterial: ProductLineData[] = [
  al(6, 1, true), al(8, 2, true), al(10, 1, true), al(7, 1, true), al(110, 1, true), al(111, 1, true),
];
const alarmInstall: ProductLineData[] = [al(11, 1, false), al(13, 3, false)];
const alarmTotals = calculateAlarmTotals(
  alarmMaterial, alarmInstall, undefined, undefined,
  { quantity: 0, isOffered: false, price: 300 },
  { simCardSelected: true, simCardOffered: false, processingOffered: false },
  { testCyclique: { selected: true, price: 0, offered: true }, surveillance: { type: 'telesurveillance', price: 129, offered: false } },
  48, false, 'titane', CATALOG_ALARM_PRODUCTS,
);

// ---------- CAMERA ----------
const pc = (id: number) => CATALOG_CAMERA_MATERIAL.find((x) => x.id === id)!;
const cl = (id: number, quantity: number, offered: boolean): ProductLineData => ({
  id: _id++, product: pc(id), quantity, offered,
});
const cameraMaterial: ProductLineData[] = [cl(23, 2, false), cl(50, 1, false), cl(38, 1, false)];
const cameraTotals = calculateCameraTotals(
  cameraMaterial, undefined,
  { quantity: 2, isOffered: false },
  undefined, false, true, 48, false, CATALOG_CAMERA_MATERIAL,
);

// ---------- FOG ----------
const pf = (id: number) => CATALOG_FOG_PRODUCTS.find((x) => x.id === id)!;
const fl = (id: number, quantity: number): ProductLineData => ({ id: _id++, product: pf(id) as any, quantity, offered: false });
const fogMaterial: ProductLineData[] = [fl(200, 1), fl(201, 1), fl(202, 1)];
const fogAdditional: ProductLineData[] = [fl(205, 1)];

// ---------- VISIOPHONE ----------
const pv = (id: number) => CATALOG_VISIOPHONE_PRODUCTS.find((x) => x.id === id)!;
const vl = (id: number, quantity: number): ProductLineData => ({ id: _id++, product: pv(id) as any, quantity, offered: false });
const visioMaterial: ProductLineData[] = [vl(300, 1), vl(301, 1)];

// ---------- EDGE: big alarm (page-overflow stress) ----------
const bigInstall: ProductLineData[] = [1, 2, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 23]
  .map((id) => ({ id: _id++, product: pa(id), quantity: 1, offered: false }));
const bigTotals = calculateAlarmTotals(
  alarmMaterial, bigInstall, undefined, undefined,
  { quantity: 0, isOffered: false, price: 300 },
  { simCardSelected: true, simCardOffered: false, processingOffered: false },
  { testCyclique: { selected: true, price: 0, offered: true }, surveillance: { type: 'telesurveillance', price: 129, offered: false } },
  48, false, 'titane', CATALOG_ALARM_PRODUCTS,
);

// ---------- EDGE: autosurveillance (DIA-AUTO) ----------
const autoTotals = calculateAlarmTotals(
  alarmMaterial, alarmInstall, undefined, undefined,
  { quantity: 0, isOffered: false, price: 300 },
  { simCardSelected: true, simCardOffered: false, processingOffered: false },
  { testCyclique: { selected: true, price: 0, offered: true }, surveillance: { type: 'autosurveillance', price: 59, offered: false } },
  48, false, 'titane', CATALOG_ALARM_PRODUCTS,
);

// ---------- EDGE: Jablotron central (priceJablotron path) ----------
const jabMaterial: ProductLineData[] = [al(5, 1, true), al(8, 2, true), al(10, 1, true), al(7, 1, true), al(110, 1, true), al(111, 1, true)];
const jabInstall: ProductLineData[] = [al(11, 1, false), al(13, 3, false)];
const jabTotals = calculateAlarmTotals(
  jabMaterial, jabInstall, undefined, undefined,
  { quantity: 0, isOffered: false, price: 300 },
  { simCardSelected: true, simCardOffered: false, processingOffered: false },
  { testCyclique: { selected: true, price: 0, offered: true }, surveillance: { type: 'telesurveillance', price: 139, offered: false } },
  48, false, 'jablotron', CATALOG_ALARM_PRODUCTS,
);

(async () => {
  await write('alarm', {
    type: 'alarm', clientName: 'NOM Prénom', commercial: 'Arnaud Bloch', isRental: false,
    materialLines: alarmMaterial, installationLines: alarmInstall, totals: alarmTotals, simCardSelected: true,
    services: { testCyclique: { selected: true, price: 0, offered: true }, surveillance: { type: 'telesurveillance', price: 129, offered: false } },
    options: { interventionsGratuites: true, interventionsAnnee: false, serviceCles: true },
    paymentMonths: 48,
  });
  await write('camera', {
    type: 'camera', clientName: 'NOM Prénom', commercial: 'Arnaud Bloch', isRental: false,
    materialLines: cameraMaterial, totals: cameraTotals, installationQty: 2, remoteAccess: true, paymentMonths: 48,
  });
  await write('fog', {
    type: 'fog', clientName: 'NOM Prénom', commercial: 'Arnaud Bloch', isRental: false,
    materialLines: fogMaterial, installationLines: fogAdditional,
    feesConfig: { installationPrice: 490, processingFee: 190, processingSelected: true, processingOffered: false, simCard: 50, simCardSelected: true, simCardOffered: false },
    paymentMonths: 48,
  });
  await write('visiophone', {
    type: 'visiophone', clientName: 'NOM Prénom', commercial: 'Arnaud Bloch', isRental: false,
    materialLines: visioMaterial,
    feesConfig: { installationPrice: 690 },
    paymentMonths: 48,
  });
  await write('alarm-big', {
    type: 'alarm', clientName: 'Client Très Long Nom De Famille', commercial: 'Arnaud Bloch', isRental: false,
    materialLines: alarmMaterial, installationLines: bigInstall, totals: bigTotals, simCardSelected: true,
    services: { testCyclique: { selected: true, price: 0, offered: true }, surveillance: { type: 'telesurveillance', price: 129, offered: false } },
    options: { interventionsGratuites: true, interventionsAnnee: true, interventionsQty: 2, serviceCles: true },
    paymentMonths: 48,
  });
  await write('alarm-auto', {
    type: 'alarm', clientName: 'NOM Prénom', commercial: 'Arnaud Bloch', isRental: false,
    materialLines: alarmMaterial, installationLines: alarmInstall, totals: autoTotals, simCardSelected: true,
    services: { testCyclique: { selected: true, price: 0, offered: true }, surveillance: { type: 'autosurveillance', price: 59, offered: false } },
    options: { serviceCles: true },
    paymentMonths: 36,
  });
  await write('alarm-jablotron', {
    type: 'alarm', clientName: 'NOM Prénom', commercial: 'Arnaud Bloch', isRental: false,
    materialLines: jabMaterial, installationLines: jabInstall, totals: jabTotals, simCardSelected: false,
    services: { testCyclique: { selected: true, price: 0, offered: true }, surveillance: { type: 'telesurveillance', price: 139, offered: false } },
    options: { interventionsGratuites: true },
    paymentMonths: 60,
  });
})();
