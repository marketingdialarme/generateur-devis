/**
 * ============================================================================
 * PDF GENERATOR LIBRARY
 * ============================================================================
 * 
 * Migrated from script.js (lines 2791-3780)
 * Generates professional PDF quotes using jsPDF
 */

import type { jsPDF } from 'jspdf';
import type { AlarmTotals, CameraTotals } from './calculations';
import type { ProductLineData } from '@/components/ProductLine';
import { TVA_RATE, ADMIN_FEES, UNINSTALL_PRICE, roundToFiveCents, calculateFacilityPayment } from './quote-generator';
import { calculateRemoteAccessPrice, detectCentralType } from './product-line-adapter';
import { getCommercialInfo } from './config';

// ============================================
// INTERFACES
// ============================================

export interface QuoteInfo {
  clientName: string;
  commercial: string;
  quoteNumber: string;
  date: string;
  type: 'alarm' | 'camera' | 'fog' | 'visiophone';
  isRental: boolean;
}

export interface PDFGenerationOptions {
  type: 'alarm' | 'camera' | 'fog' | 'visiophone';
  clientName: string;
  commercial: string;
  isRental: boolean;
  materialLines: ProductLineData[];
  installationLines?: ProductLineData[];
  totals?: AlarmTotals | CameraTotals;
  /** Fog/visiophone fee config — these products compute their totals from the table rows. */
  feesConfig?: {
    installationPrice?: number;
    processingFee?: number;
    processingOffered?: boolean;
    simCard?: number;
    simCardSelected?: boolean;
    simCardOffered?: boolean;
  };
  /**
   * Optional installation duration (in half-days) for camera quotes.
   * Used only for display wording in the PDF.
   */
  installationQty?: number;
  services?: {
    testCyclique?: {
      selected: boolean;
      price: number;
      offered: boolean;
    };
    surveillance?: {
      type: string | null;
      price: number;
      offered: boolean;
    };
  };
  options?: {
    interventionsGratuites?: boolean;
    interventionsAnnee?: boolean;
    interventionsQty?: number;
    serviceCles?: boolean;
  };
  remoteAccess?: boolean;
  /** Alarm: whether a Carte SIM is part of the quote (controls whether its row is shown). */
  simCardSelected?: boolean;
  paymentMonths?: number;
  /**
   * Optional overrides to keep quote number consistent across:
   * - PDF header
   * - returned filename
   */
  quoteNumberOverride?: string;
  /**
   * Optional prefix override for quote number generation (e.g. 'GB' for brouillard).
   * If provided, it takes precedence over alarm/camera defaults.
   */
  quoteNumberPrefixOverride?: string | null;
  dateOverride?: string;
}

// ============================================
// HELPERS
// ============================================

function getLineUnitPrice(line: ProductLineData, selectedCentral: 'titane' | 'jablotron' | null): number {
  const product = line.product;
  if (!product) return 0;

  // Treat customPrice as explicit override for any product
  if (line.customPrice !== undefined) return line.customPrice;

  if (product.price !== undefined) return product.price;
  if (selectedCentral === 'titane' && product.priceTitane !== undefined) return product.priceTitane;
  if (selectedCentral === 'jablotron' && product.priceJablotron !== undefined) return product.priceJablotron;
  // Fallback (legacy behavior): if central type is unknown, pick any available central-specific price
  if (selectedCentral === null && product.priceTitane !== undefined) return product.priceTitane;
  if (selectedCentral === null && product.priceJablotron !== undefined) return product.priceJablotron;
  return 0;
}

// ============================================
// PDF GENERATION
// ============================================

/**
 * Generate quote number
 */
export function getAlarmQuoteNumberPrefix(surveillanceType?: string | null): 'TELES' | 'AUTO' | null {
  if (!surveillanceType) return null;
  if (surveillanceType.startsWith('telesurveillance')) return 'TELES';
  if (surveillanceType.startsWith('autosurveillance')) return 'AUTO';
  return null;
}

export function getCameraQuoteNumberPrefix(): 'VID' {
  return 'VID';
}

export function generateQuoteNumber(prefix?: string | null, now: Date = new Date()): string {
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');
  const MM = String(now.getMinutes()).padStart(2, '0');

  // New formatting requested by client:
  // - DIA-TELES-AAAA-MM-JJ-HHMM
  // - DIA-AUTO-AAAA-MM-JJ-HHMM
  // - DIA-VID-AAAA-MM-JJ-HHMM
  // Fallback (no prefix): DIA-AAAA-MM-JJ-HHMM
  const base = `DIA-${yyyy}-${mm}-${dd}-${HH}${MM}`;
  return prefix ? `DIA-${prefix}-${yyyy}-${mm}-${dd}-${HH}${MM}` : base;
}

/**
 * Generate filename for PDF
 */
export function generateFilename(quoteNumber: string, clientName: string): string {
  const sanitizedName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
  return `Devis-${quoteNumber}-${sanitizedName}.pdf`;
}

/**
 * Main PDF generation function
 */
export async function generateQuotePDF(
  options: PDFGenerationOptions,
  jsPDFInstance: typeof jsPDF
): Promise<Blob> {
  const doc = new jsPDFInstance('portrait', 'pt', 'a4');
  const now = new Date();
  const prefix =
    options.quoteNumberPrefixOverride ??
    (options.type === 'alarm'
      ? getAlarmQuoteNumberPrefix(options.services?.surveillance?.type ?? null)
      : options.type === 'camera'
      ? getCameraQuoteNumberPrefix()
      : options.type === 'fog'
      ? 'GB'
      : 'VISIO');
  const quoteNumber = options.quoteNumberOverride ?? generateQuoteNumber(prefix, now);
  const date = options.dateOverride ?? now.toLocaleDateString('fr-CH');

  // Create PDF header
  createPDFHeader(doc, {
    clientName: options.clientName,
    commercial: options.commercial,
    quoteNumber,
    date,
    type: options.type,
    isRental: options.isRental
  });

  let yPos = 165;

  // Add rental mode notice
  if (options.isRental) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('MODE LOCATION - Pas de mensualités de paiement', 40, yPos);
    yPos += 20;
  }

  // Generate sections based on type
  if (options.type === 'alarm') {
    yPos = createAlarmPDFSections(doc, options, yPos);
  } else if (options.type === 'camera') {
    yPos = createCameraPDFSections(doc, options, yPos);
  } else if (options.type === 'fog') {
    yPos = createFogPDFSections(doc, options, yPos);
  } else if (options.type === 'visiophone') {
    yPos = createVisioPDFSections(doc, options, yPos);
  }

  // Create footer
  createPDFFooter(doc, options.clientName);

  return doc.output('blob');
}

// ============================================
// PDF HEADER
// ============================================

function createPDFHeader(doc: jsPDF, info: QuoteInfo): void {
  doc.setTextColor(0, 0, 0);

  // Brand (logo asset lives in the Drive base template; render wordmark here)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('DIALARME', 40, 40);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text('Votre sécurité, ça nous regarde', 40, 51);

  // Conseiller block (top-right)
  const info_c = getCommercialInfo(info.commercial);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Votre conseiller : ${info.commercial}`, 360, 30);
  if (info_c?.phone) doc.text(info_c.phone, 360, 42);
  if (info_c?.email) doc.text(info_c.email, 360, 54);

  // Yellow rule
  doc.setFillColor(244, 230, 0);
  doc.rect(0, 64, 595, 4, 'F');

  // A l'attention de (left)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text("A l'attention de :", 40, 90);
  doc.setFont('helvetica', 'bold');
  doc.text(info.clientName, 40, 103);

  // Title (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  const title = info.isRental ? 'Offre Location' : 'Offre Partenariat';
  doc.text(title, 300, 90);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const subtitle = doc.splitTextToSize(
    "Installation et kit de base prise en charge, sous réserve de souscrire à l'un de nos contrats de service.",
    255
  );
  doc.text(subtitle, 300, 102);

  // Quote meta
  doc.setFontSize(9);
  doc.text('N° de devis', 300, 132);
  doc.setFont('helvetica', 'bold');
  doc.text(info.quoteNumber, 370, 132);
  doc.setFont('helvetica', 'normal');
  doc.text('Date', 300, 145);
  doc.text(`${info.date}`, 370, 145);
  const dateW = doc.getTextWidth(info.date); // measured at size 9
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('(valable 3 mois)', 370 + dateW + 8, 145);
  doc.setTextColor(0, 0, 0);
}

// ============================================
// ALARM PDF SECTIONS
// ============================================

interface TableRow {
  name: string;
  qty: number;
  unitPrice: number;
  offered: boolean;
  note?: string;
}

// Colors
const C_YELLOW: [number, number, number] = [244, 230, 0];
const C_GREEN: [number, number, number] = [0, 140, 70];
const C_GREY_ROW: [number, number, number] = [245, 245, 245];

const LEFT = 40;
const RIGHT = 555; // 40 + 515
const COL_QTY = 360;
const COL_PU = 420;
const MAX_Y = 700; // content must stay above the footer band (footer drawn at y=720)
const TOP_Y = 50; // top margin on continuation pages

/** Add a page and reset to the top margin if `needed` points won't fit before the footer. */
function ensureSpace(doc: jsPDF, yPos: number, needed: number): number {
  if (yPos + needed > MAX_Y) {
    doc.addPage();
    return TOP_Y;
  }
  return yPos;
}

function createAlarmPDFSections(
  doc: jsPDF,
  options: PDFGenerationOptions,
  yPos: number
): number {
  const alarmTotals = options.totals as AlarmTotals;
  const centralType = detectCentralType(options.materialLines);
  const months = options.paymentMonths ?? 0;

  // ---- Build unified material table rows ----
  const rows: TableRow[] = [];

  // KIT DE BASE items
  options.materialLines.forEach((line) => {
    if (!line.product) return;
    const name = line.product.isCustom && line.customName ? line.customName : line.product.name;
    rows.push({
      name: `KIT DE BASE - ${name}`,
      qty: line.quantity,
      unitPrice: getLineUnitPrice(line, centralType),
      offered: line.offered,
    });
  });

  // Supplementary materials (matériel divers)
  (options.installationLines || []).forEach((line) => {
    if (!line.product) return;
    const name = line.product.isCustom && line.customName ? line.customName : line.product.name;
    rows.push({
      name,
      qty: line.quantity,
      unitPrice: getLineUnitPrice(line, centralType),
      offered: line.offered,
    });
  });

  // Main installation line ("Installation et paramétrage")
  const supplementaryTotal = (options.installationLines || []).reduce((sum, line) => {
    if (!line.product || line.offered) return sum;
    return sum + getLineUnitPrice(line, centralType) * line.quantity;
  }, 0);
  const mainInstallationTotal = Math.max(0, alarmTotals.installation.totalBeforeDiscount - supplementaryTotal);
  if (mainInstallationTotal > 0 || options.isRental) {
    rows.push({
      name: 'Installation et paramétrage',
      qty: 1,
      unitPrice: options.isRental ? 0 : mainInstallationTotal,
      offered: options.isRental,
    });
  }

  // Frais de dossier + Carte SIM (admin) — always listed, payable at install
  rows.push({
    name: 'Frais de dossier',
    qty: 1,
    unitPrice: ADMIN_FEES.processingFee,
    offered: alarmTotals.adminFees.processing === 0,
    note: '(à régler à l\'installation)',
  });
  if (options.simCardSelected) {
    rows.push({
      name: 'Carte SIM*',
      qty: 1,
      unitPrice: ADMIN_FEES.simCard,
      offered: alarmTotals.adminFees.simCard === 0,
      note: '(à régler à l\'installation)',
    });
  }

  // Maintenance (always offered/included)
  rows.push({
    name: `Maintenance et garantie sur ${months > 0 ? months : 48} mois`,
    qty: 1,
    unitPrice: 0,
    offered: true,
  });

  // ---- Render table ----
  yPos = drawItemTable(doc, rows, yPos);

  // ---- Summary box (Total HT / Rabais / Après rabais / TVA / TTC) ----
  const totalBeforeRabais = rows.reduce((s, r) => s + r.unitPrice * r.qty, 0);
  const totalAfterRabais = rows.reduce((s, r) => s + (r.offered ? 0 : r.unitPrice * r.qty), 0);
  const rabais = totalBeforeRabais - totalAfterRabais;
  yPos = ensureSpace(doc, yPos, 110);
  yPos = drawSummary(doc, totalBeforeRabais, rabais, totalAfterRabais, yPos);

  // ---- Télésurveillance + Test Cyclique block ----
  if (options.services?.surveillance?.type) {
    yPos = ensureSpace(doc, yPos, 75);
    yPos = drawSurveillanceBlock(doc, options.services, months, yPos);
  }

  // ---- Options block ----
  if (options.options) {
    yPos = ensureSpace(doc, yPos, 60);
    yPos = drawOptionsBlock(doc, options.options, yPos);
  }

  // ---- Facilité de paiement block ----
  if (!options.isRental && months > 0) {
    const facilityHT = calculateFacilityPayment(
      totalAfterRabais,
      alarmTotals.adminFees.processing,
      alarmTotals.adminFees.simCard,
      months
    );
    yPos = ensureSpace(doc, yPos, 70);
    yPos = drawFacilityBlock(doc, facilityHT, months, yPos);
  }

  // Uninstall notice for rental mode
  if (options.isRental) {
    yPos = createUninstallNotice(doc, yPos);
  }

  return yPos;
}

// Right-aligned label/value pair helper
function drawLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  bold = false,
  valueColor: [number, number, number] = [0, 0, 0]
): void {
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(label, COL_PU, y);
  doc.setTextColor(...valueColor);
  doc.text(value, RIGHT, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

function drawItemTable(doc: jsPDF, rows: TableRow[], yPos: number): number {
  const drawHeader = (y: number): number => {
    doc.setFillColor(...C_YELLOW);
    doc.rect(LEFT, y, RIGHT - LEFT, 16, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('Désignation du matériel', LEFT + 6, y + 11);
    doc.text('Qté', COL_QTY, y + 11);
    doc.text('P.U HT', COL_PU, y + 11);
    doc.text('TOTAL H.T.', RIGHT, y + 11, { align: 'right' });
    return y + 16;
  };

  yPos = drawHeader(yPos);
  const rowH = 14;
  rows.forEach((row, i) => {
    // Page break before a row would collide with the footer; re-draw the column header
    if (yPos + rowH > MAX_Y) {
      doc.addPage();
      yPos = drawHeader(TOP_Y);
    }
    if (i % 2 === 1) {
      doc.setFillColor(...C_GREY_ROW);
      doc.rect(LEFT, yPos, RIGHT - LEFT, rowH, 'F');
    }
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    // Name (+ optional note in grey italic)
    doc.text(row.name, LEFT + 6, yPos + 9);
    if (row.note) {
      const nameW = doc.getTextWidth(row.name);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      doc.text(row.note, LEFT + 6 + nameW + 4, yPos + 9);
      doc.setFontSize(7.5);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(String(row.qty), COL_QTY, yPos + 9);
    doc.text(`${row.unitPrice.toFixed(0)} CHF`, COL_PU, yPos + 9);
    // Total column: green text (matches reference)
    doc.setTextColor(...C_GREEN);
    doc.text(`${(row.unitPrice * row.qty).toFixed(0)} CHF`, RIGHT, yPos + 9, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    yPos += rowH;
  });

  // Footnote (only when a Carte SIM line is present) — guard against footer collision
  if (rows.some((r) => r.name.includes('Carte SIM'))) {
    yPos = ensureSpace(doc, yPos, 16);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(90, 90, 90);
    doc.text('*Carte SIM si le réseau le permet', LEFT + 6, yPos + 8);
    doc.setTextColor(0, 0, 0);
    yPos += 10;
  }

  return yPos + 6;
}

function drawSummary(
  doc: jsPDF,
  totalHT: number,
  rabais: number,
  afterRabais: number,
  yPos: number
): number {
  const tva = roundToFiveCents(afterRabais * TVA_RATE);
  const ttc = roundToFiveCents(afterRabais + tva);

  if (rabais > 0) {
    drawLabelValue(doc, 'Total HT', `${totalHT.toFixed(2)} CHF`, yPos + 8);
    yPos += 14;
    drawLabelValue(doc, 'Rabais partenariat', `- ${rabais.toFixed(2)} CHF`, yPos + 8, true, C_GREEN);
    yPos += 14;
    drawLabelValue(doc, 'Total après rabais', `${afterRabais.toFixed(2)} CHF`, yPos + 8);
    yPos += 14;
  } else {
    drawLabelValue(doc, 'Total HT', `${afterRabais.toFixed(2)} CHF`, yPos + 8);
    yPos += 14;
  }
  drawLabelValue(doc, 'TVA 8,1%', `${tva.toFixed(2)} CHF`, yPos + 8);
  yPos += 16;
  // Total TTC highlighted yellow
  doc.setFillColor(...C_YELLOW);
  doc.rect(COL_PU - 10, yPos - 2, RIGHT - (COL_PU - 10), 16, 'F');
  drawLabelValue(doc, 'Total TTC', `${ttc.toFixed(2)} CHF`, yPos + 9, true);
  return yPos + 22;
}

function drawSurveillanceBlock(
  doc: jsPDF,
  services: NonNullable<PDFGenerationOptions['services']>,
  months: number,
  yPos: number
): number {
  yPos += 6;
  const surveillanceHT =
    (services.surveillance?.offered ? 0 : (services.surveillance?.price || 0)) +
    (services.testCyclique?.selected && !services.testCyclique?.offered
      ? services.testCyclique.price
      : 0);
  const tva = roundToFiveCents(surveillanceHT * TVA_RATE);
  const ttc = roundToFiveCents(surveillanceHT + tva);

  const boxH = 44;
  // Yellow left accent
  doc.setFillColor(...C_YELLOW);
  doc.rect(LEFT, yPos, 4, boxH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('TÉLÉSURVEILLANCE + TEST CYCLIQUE', LEFT + 12, yPos + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Raccordement 24H/24 - 7J/7', LEFT + 12, yPos + 30);

  drawLabelValue(doc, 'Total HT', `${surveillanceHT.toFixed(2)} CHF`, yPos + 10);
  drawLabelValue(doc, 'TVA 8,1%', `${tva.toFixed(2)} CHF`, yPos + 22);
  doc.setFillColor(...C_YELLOW);
  doc.rect(COL_PU - 10, yPos + 28, RIGHT - (COL_PU - 10), 14, 'F');
  drawLabelValue(doc, 'Total TTC', `${ttc.toFixed(2)} CHF`, yPos + 38, true);
  yPos += boxH + 4;

  // Mensualité text (amount = surveillance HT, duration = payment months)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `La mensualité de CHF ${surveillanceHT.toFixed(0)}.- HT est fixée et non indexable pendant la durée contractuelle de ${months > 0 ? months : 48} mois.`,
    LEFT,
    yPos + 8
  );
  return yPos + 16;
}

function drawOptionsBlock(
  doc: jsPDF,
  options: NonNullable<PDFGenerationOptions['options']>,
  yPos: number
): number {
  const items: string[] = [];
  if (options.interventionsGratuites) items.push('Interventions gratuites & illimitées des agents');
  if (options.interventionsAnnee)
    items.push(`${options.interventionsQty || 1} intervention(s) par année des agents`);
  if (options.serviceCles) items.push('Service des clés inclus');
  if (items.length === 0) return yPos;

  yPos += 6;
  const boxH = items.length * 12 + 8;
  doc.setFillColor(100, 100, 100);
  doc.rect(LEFT, yPos, 4, boxH, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  items.forEach((it, i) => {
    doc.text(it, LEFT + 12, yPos + 12 + i * 12);
  });
  return yPos + boxH + 4;
}

function drawFacilityBlock(doc: jsPDF, facilityHT: number, months: number, yPos: number): number {
  yPos += 6;
  const tva = roundToFiveCents(facilityHT * TVA_RATE);
  const ttc = roundToFiveCents(facilityHT + tva);
  const boxH = 44;
  doc.setFillColor(...C_YELLOW);
  doc.rect(LEFT, yPos, 4, boxH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const wrapped = doc.splitTextToSize(
    `Possibilité de facilité de paiement sur ${months} mois pour le matériel supplémentaire hors frais de dossier`,
    300
  );
  doc.text(wrapped, LEFT + 12, yPos + 16);

  drawLabelValue(doc, 'Total HT', `${facilityHT.toFixed(2)} CHF`, yPos + 10);
  drawLabelValue(doc, 'TVA 8,1%', `${tva.toFixed(2)} CHF`, yPos + 22);
  doc.setFillColor(...C_YELLOW);
  doc.rect(COL_PU - 10, yPos + 28, RIGHT - (COL_PU - 10), 14, 'F');
  drawLabelValue(doc, 'Total TTC', `${ttc.toFixed(2)} CHF`, yPos + 38, true);

  return yPos + boxH + 6;
}

// ============================================
// CAMERA PDF SECTIONS
// ============================================

function createCameraPDFSections(
  doc: jsPDF,
  options: PDFGenerationOptions,
  yPos: number
): number {
  const cameraTotals = options.totals as CameraTotals;
  const months = options.paymentMonths ?? 0;

  // ---- Unified material + installation table ----
  const rows: TableRow[] = [];
  options.materialLines.forEach((line) => {
    if (!line.product) return;
    const name = line.product.isCustom && line.customName ? line.customName : line.product.name;
    rows.push({
      name,
      qty: line.quantity,
      unitPrice: getLineUnitPrice(line, null),
      offered: line.offered,
    });
  });

  const installBefore = cameraTotals.installation.totalBeforeDiscount;
  const installLabel =
    options.installationQty === 1 ? 'Installation 1/2 journée' :
    options.installationQty === 2 ? 'Installation 1 journée' :
    'Installation, paramétrages, tests, mise en service & formation';
  if (installBefore > 0 || options.isRental) {
    rows.push({
      name: installLabel,
      qty: 1,
      unitPrice: options.isRental ? 0 : installBefore,
      offered: options.isRental || installBefore === 0,
    });
  }

  rows.push({
    name: `Maintenance et garantie sur ${months > 0 ? months : 48} mois`,
    qty: 1,
    unitPrice: 0,
    offered: true,
  });

  yPos = drawItemTable(doc, rows, yPos);

  // ---- Summary ----
  const totalBefore = rows.reduce((s, r) => s + r.unitPrice * r.qty, 0);
  const afterRabais = rows.reduce((s, r) => s + (r.offered ? 0 : r.unitPrice * r.qty), 0);
  const rabais = totalBefore - afterRabais;
  yPos = ensureSpace(doc, yPos, 110);
  yPos = drawSummary(doc, totalBefore, rabais, afterRabais, yPos);

  // ---- Vision à distance (monthly) ----
  if (!options.isRental && options.remoteAccess) {
    const remoteAccessPrice = calculateRemoteAccessPrice(options.materialLines);
    yPos = ensureSpace(doc, yPos, 60);
    yPos = drawMonthlyBlock(
      doc,
      'VISION À DISTANCE',
      remoteAccessPrice,
      `Mensualité fixée et non indexable pendant la durée contractuelle de ${months} mois.`,
      yPos
    );
  }

  // ---- Warning when no modem & no remote access ----
  if (!options.isRental && !options.remoteAccess) {
    const hasModem = options.materialLines.some(
      (line) => line.product && line.product.name.toLowerCase().includes('modem')
    );
    if (!hasModem) yPos = drawCameraWarning(doc, yPos);
  }

  if (options.isRental) yPos = createUninstallNotice(doc, yPos);

  return yPos;
}

// Map product lines to table rows (no central pricing for fog/visiophone)
function linesToRows(lines: ProductLineData[] | undefined): TableRow[] {
  return (lines || [])
    .filter((l) => l.product)
    .map((l) => ({
      name: l.product!.isCustom && l.customName ? l.customName : l.product!.name,
      qty: l.quantity,
      unitPrice: getLineUnitPrice(l, null),
      offered: l.offered,
    }));
}

// ============================================
// FOG (GÉNÉRATEUR DE BROUILLARD) SECTIONS
// ============================================

function createFogPDFSections(doc: jsPDF, options: PDFGenerationOptions, yPos: number): number {
  const fees = options.feesConfig || {};
  const rows: TableRow[] = [
    ...linesToRows(options.materialLines),
    ...linesToRows(options.installationLines), // matériel supplémentaire
  ];

  if ((fees.installationPrice ?? 0) > 0) {
    rows.push({ name: 'Installation et paramétrage', qty: 1, unitPrice: fees.installationPrice!, offered: false });
  }
  rows.push({
    name: 'Frais de dossier',
    qty: 1,
    unitPrice: fees.processingFee ?? 0,
    offered: !!fees.processingOffered,
    note: "(à régler à l'installation)",
  });
  if (fees.simCardSelected) {
    rows.push({
      name: 'Carte SIM*',
      qty: 1,
      unitPrice: fees.simCard ?? 0,
      offered: !!fees.simCardOffered,
      note: "(à régler à l'installation)",
    });
  }

  yPos = drawItemTable(doc, rows, yPos);
  const totalBefore = rows.reduce((s, r) => s + r.unitPrice * r.qty, 0);
  const after = rows.reduce((s, r) => s + (r.offered ? 0 : r.unitPrice * r.qty), 0);
  yPos = ensureSpace(doc, yPos, 110);
  return drawSummary(doc, totalBefore, totalBefore - after, after, yPos);
}

// ============================================
// VISIOPHONE SECTIONS
// ============================================

function createVisioPDFSections(doc: jsPDF, options: PDFGenerationOptions, yPos: number): number {
  const fees = options.feesConfig || {};
  const rows: TableRow[] = [...linesToRows(options.materialLines)];
  if ((fees.installationPrice ?? 0) > 0) {
    rows.push({ name: 'Installation et paramétrage', qty: 1, unitPrice: fees.installationPrice!, offered: false });
  }
  yPos = drawItemTable(doc, rows, yPos);
  const totalBefore = rows.reduce((s, r) => s + r.unitPrice * r.qty, 0);
  const after = rows.reduce((s, r) => s + (r.offered ? 0 : r.unitPrice * r.qty), 0);
  yPos = ensureSpace(doc, yPos, 110);
  return drawSummary(doc, totalBefore, totalBefore - after, after, yPos);
}

// Generic monthly (mensualité) block: title + HT/TVA/TTC + optional sub-text
function drawMonthlyBlock(
  doc: jsPDF,
  title: string,
  ht: number,
  subtext: string,
  yPos: number
): number {
  yPos += 6;
  const tva = roundToFiveCents(ht * TVA_RATE);
  const ttc = roundToFiveCents(ht + tva);
  const boxH = 44;
  doc.setFillColor(...C_YELLOW);
  doc.rect(LEFT, yPos, 4, boxH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(title, LEFT + 12, yPos + 16);
  if (subtext) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(subtext, 300), LEFT + 12, yPos + 30);
  }
  drawLabelValue(doc, 'Total HT', `${ht.toFixed(2)} CHF`, yPos + 10);
  drawLabelValue(doc, 'TVA 8,1%', `${tva.toFixed(2)} CHF`, yPos + 22);
  doc.setFillColor(...C_YELLOW);
  doc.rect(COL_PU - 10, yPos + 28, RIGHT - (COL_PU - 10), 14, 'F');
  drawLabelValue(doc, 'Total TTC', `${ttc.toFixed(2)} CHF`, yPos + 38, true);
  return yPos + boxH + 6;
}

function drawCameraWarning(doc: jsPDF, yPos: number): number {
  yPos += 10;
  doc.setFillColor(255, 243, 205);
  doc.rect(LEFT, yPos, RIGHT - LEFT, 78, 'F');
  doc.setDrawColor(255, 193, 7);
  doc.setLineWidth(2);
  doc.rect(LEFT, yPos, RIGHT - LEFT, 78, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(200, 100, 0);
  doc.text('ATTENTION - VISION À DISTANCE', LEFT + 10, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  const warningLines = [
    'Si le client ne souscrit pas la vision à distance par le biais de Dialarme, la société Dialarme',
    'décline toutes responsabilités dû aux pertes de connexion à distance des caméras.',
    'Un forfait unique de CHF 150 HT par déplacement sera facturé au client pour la remise en réseau des caméras.',
    'Pour les caméras classiques, la vision à distance nécessite un Modem 4G (CHF 290.- HT).',
  ];
  let lineYPos = yPos + 30;
  warningLines.forEach((line) => {
    doc.text(line, LEFT + 10, lineYPos);
    lineYPos += 11;
  });
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  return yPos + 88;
}

// ============================================
// UNINSTALL NOTICE (Rental Mode)
// ============================================

function createUninstallNotice(doc: jsPDF, yPos: number): number {
  // Add notice box
  doc.setFillColor(255, 243, 205); // Light yellow background
  doc.rect(40, yPos, 515, 30, 'F');
  
  // Border
  doc.setDrawColor(255, 193, 7); // Yellow border
  doc.setLineWidth(2);
  doc.rect(40, yPos, 515, 30, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('⚠ DÉSINSTALLATION', 50, yPos + 15);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Désinstallation : ${UNINSTALL_PRICE.toFixed(2)} CHF si durée inférieure à 12 mois`, 50, yPos + 24);
  
  doc.setTextColor(0, 0, 0);
  yPos += 45;
  
  return yPos;
}

// ============================================
// PDF FOOTER
// ============================================

function createPDFFooter(doc: jsPDF, clientName: string): void {
  // Dark footer background
  doc.setFillColor(51, 51, 51);
  doc.rect(0, 720, 595, 122, 'F');

  // Yellow separator
  doc.setFillColor(244, 230, 0);
  doc.rect(0, 720, 595, 6, 'F');

  // Signature boxes
  doc.setFillColor(255, 255, 255);
  doc.rect(50, 745, 200, 25, 'F');
  doc.rect(350, 745, 200, 60, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NOM DU CLIENT : ${clientName}`, 60, 760);
  doc.text('SIGNATURE DU CLIENT', 430, 760);
}

