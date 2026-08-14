/**
 * THROWAWAY verification harness (Aug 2026 client-list audit).
 * Proves/disproves two suspected defects before replying to the client:
 *  1. percent/fixed réduction applied in UI totals but absent from the PDF summary
 *  2. PDF surveillance block titled TÉLÉSURVEILLANCE even in autosurveillance mode
 * Usage: npx tsx scripts/render-verify-aug.ts   → scripts/_out/verify-*.pdf + console dump
 * DELETE after use.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { jsPDF } from 'jspdf';
import { generateQuotePDF, type PDFGenerationOptions } from '@/lib/pdf-generator';
import { calculateAlarmTotals } from '@/lib/calculations';
import { CATALOG_ALARM_PRODUCTS } from '@/lib/quote-generator';
import type { ProductLineData } from '@/components/ProductLine';

const outDir = join(process.cwd(), 'scripts', '_out');
mkdirSync(outDir, { recursive: true });
let _id = 1;

const pa = (id: number) => CATALOG_ALARM_PRODUCTS.find((x) => x.id === id)!;
const al = (id: number, quantity: number, offered: boolean): ProductLineData => ({
  id: _id++, product: pa(id), quantity, offered,
});

// Base kit offered + real supplementary material NOT offered, so the réduction has a base
const material: ProductLineData[] = [
  al(6, 1, true), al(8, 2, true), al(10, 1, true), al(7, 1, true), al(110, 1, true), al(111, 1, true),
  al(14, 1, false), al(13, 2, false),
];
const install: ProductLineData[] = [al(11, 1, false)];

const materialDiscount = { type: 'percent' as const, value: 10 };
const installationDiscount = { type: 'fixed' as const, value: 100 };

const totalsWithDiscount = calculateAlarmTotals(
  material, install, materialDiscount, installationDiscount,
  { quantity: 1, isOffered: false, price: 690 },
  { simCardSelected: true, simCardOffered: false, processingOffered: false },
  { testCyclique: { selected: true, price: 0, offered: true }, surveillance: { type: 'autosurveillance', price: 59, offered: false } },
  48, false, 'titane', CATALOG_ALARM_PRODUCTS,
);

console.log('=== UI-side totals (calculateAlarmTotals) WITH discounts ===');
console.log('material.totalBeforeDiscount:', totalsWithDiscount.material.totalBeforeDiscount);
console.log('material.discount:', totalsWithDiscount.material.discount, `(${totalsWithDiscount.material.discountDisplay})`);
console.log('material.total:', totalsWithDiscount.material.total);
console.log('installation.totalBeforeDiscount:', totalsWithDiscount.installation.totalBeforeDiscount);
console.log('installation.discount:', totalsWithDiscount.installation.discount, `(${totalsWithDiscount.installation.discountDisplay})`);
console.log('installation.total:', totalsWithDiscount.installation.total);

(async () => {
  const opts: PDFGenerationOptions = {
    type: 'alarm', clientName: 'VERIFY Discount', commercial: 'Arnaud Bloch', isRental: false,
    materialLines: material, installationLines: install, totals: totalsWithDiscount, simCardSelected: true,
    services: { testCyclique: { selected: true, price: 0, offered: true }, surveillance: { type: 'autosurveillance', price: 59, offered: false } },
    options: { serviceCles: true },
    paymentMonths: 48,
  };
  const blob = await generateQuotePDF(opts, jsPDF);
  const buf = Buffer.from(await blob.arrayBuffer());
  writeFileSync(join(outDir, 'verify-discount-auto.pdf'), buf);
  console.log('Wrote scripts/_out/verify-discount-auto.pdf', buf.length, 'bytes');
})();
