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

// ============================================
// INTERFACES
// ============================================

export interface QuoteInfo {
  clientName: string;
  commercial: string;
  quoteNumber: string;
  date: string;
  type: 'alarm' | 'camera';
  isRental: boolean;
}

export interface PDFGenerationOptions {
  type: 'alarm' | 'camera';
  clientName: string;
  commercial: string;
  isRental: boolean;
  materialLines: ProductLineData[];
  installationLines?: ProductLineData[];
  totals: AlarmTotals | CameraTotals;
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
      : getCameraQuoteNumberPrefix());
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

  let yPos = 110;

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
  }

  // Create footer
  createPDFFooter(doc, options.clientName);

  return doc.output('blob');
}

// ============================================
// PDF HEADER
// ============================================

function createPDFHeader(doc: jsPDF, info: QuoteInfo): void {
  // Dark header background
  doc.setFillColor(51, 51, 51);
  doc.rect(0, 0, 595, 70, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);

  let title = '';
  if (info.isRental) {
    title = info.type === 'camera' 
      ? 'OFFRE LOCATION VIDÉO SURVEILLANCE'
      : 'OFFRE LOCATION MATÉRIEL DE SÉCURITÉ';
  } else {
    title = info.type === 'camera'
      ? 'OFFRE DE PARTENARIAT VIDÉOSURVEILLANCE'
      : 'OFFRE DE PARTENARIAT MATÉRIEL DE SÉCURITÉ';
  }
  doc.text(title, 40, 25);

  // Quote number and client
  doc.setFontSize(10);
  doc.text(info.quoteNumber, 40, 42);
  doc.text(`DIALARME | A L'ATTENTION DE ${info.clientName.toUpperCase()}`, 40, 56);

  // Yellow separator
  doc.setFillColor(244, 230, 0);
  doc.rect(0, 70, 595, 6, 'F');

  // Commercial and date
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`NOM DU CONSEILLER : ${info.commercial}`, 40, 90);
  doc.text(`DATE (Devis valable 30 jours) : ${info.date}`, 350, 90);
}

// ============================================
// ALARM PDF SECTIONS
// ============================================

function createAlarmPDFSections(
  doc: jsPDF,
  options: PDFGenerationOptions,
  yPos: number
): number {
  const alarmTotals = options.totals as AlarmTotals;
  const centralType = detectCentralType(options.materialLines);

  // Material section (only if kit/base material is present)
  if (options.materialLines.length > 0) {
    yPos = createProductSection(
      doc,
      'KIT DE BASE',
      options.materialLines,
      alarmTotals.material,
      centralType,
      yPos
    );
  }

  // Installation section (with main installation line)
  yPos = createAlarmInstallationSection(
    doc,
    options.installationLines || [],
    alarmTotals.installation,
    options.isRental,
    centralType,
    yPos
  );

  // Admin fees
  yPos = createAdminFeesSection(doc, alarmTotals.adminFees, yPos);

  // Services
  if (options.services) {
    yPos = createServicesSection(doc, options.services, yPos);
  }

  // Options
  if (options.options) {
    yPos = createOptionsSection(doc, options.options, yPos);
  }

  // Uninstall notice for rental mode
  if (options.isRental) {
    yPos = createUninstallNotice(doc, yPos);
  }

  // Final summary
  yPos = createFinalSummary(doc, alarmTotals, options.type, options.isRental, yPos);

  return yPos;
}

// ============================================
// ALARM INSTALLATION SECTION
// ============================================

function createAlarmInstallationSection(
  doc: jsPDF,
  productLines: ProductLineData[],
  installationTotals: { total: number; totalBeforeDiscount: number; discount: number; discountDisplay: string },
  isRental: boolean,
  centralType: 'titane' | 'jablotron' | null,
  yPos: number
): number {
  // Section title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('INSTALLATION & MATERIEL DIVERS', 40, yPos);
  yPos += 12;

  // Table header
  doc.setFillColor(244, 230, 0);
  doc.rect(40, yPos, 515, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Qté', 50, yPos + 9);
  doc.text('Désignation du matériel', 90, yPos + 9);
  doc.text('Prix uni. HT', 400, yPos + 9);
  doc.text('Total HT', 480, yPos + 9);
  yPos += 14;

  let lineCount = 0;
  let partnershipDiscount = 0;

  // Product lines (supplementary materials)
  productLines.forEach(line => {
    if (!line.product) return;
    const product = line.product;

    lineCount++;

    // Alternating row colors
    if (lineCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 12, 'F');
    }

    const unitPrice = getLineUnitPrice(line, centralType);
    const lineTotal = unitPrice * line.quantity;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(0, 0, 0);

    // Quantity
    doc.text(line.quantity.toString(), 55, yPos + 8);

    // Product name (truncate if too long)
    const maxNameLength = 45;
    const productName = product.isCustom && line.customName ? line.customName : product.name;
    const displayName = productName.length > maxNameLength
      ? productName.substring(0, maxNameLength - 3) + '...'
      : productName;
    doc.text(displayName, 90, yPos + 8);

    // Unit price
    doc.text(unitPrice.toFixed(2), 405, yPos + 8);

    // Always show amount; partnership discount line will reflect offered items
    doc.text(lineTotal.toFixed(2), 485, yPos + 8);
    if (line.offered) partnershipDiscount += lineTotal;

    yPos += 12;
  });

  // Add main installation line: "Installation, paramétrages, tests, mise en service & formation"
  // Calculate the installation base amount (total minus supplementary materials)
  let supplementaryTotal = 0;
  productLines.forEach(line => {
    if (!line.product || line.offered) return;
    const unitPrice = getLineUnitPrice(line, centralType);
    supplementaryTotal += unitPrice * line.quantity;
  });

  const mainInstallationTotal = installationTotals.totalBeforeDiscount - supplementaryTotal;

  if (mainInstallationTotal > 0 || isRental) {
    lineCount++;
    if (lineCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 12, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(0, 0, 0);

    doc.text('1', 55, yPos + 8);
    doc.text('Installation, paramétrages, tests, mise en service & formation', 90, yPos + 8);

    // Keep existing rental behavior, but avoid "OFFERT" wording
    if (isRental) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 150, 0);
      doc.text('Compris', 405, yPos + 8);
      doc.text('Compris', 485, yPos + 8);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
    } else {
      // If offered, total is 0 in calculations; display 0 without "OFFERT"
      const displayAmount = mainInstallationTotal;
      doc.text(displayAmount.toFixed(2), 405, yPos + 8);
      doc.text(displayAmount.toFixed(2), 485, yPos + 8);
    }

    yPos += 12;
  }

  // Partnership discount line (sum of offered supplementary products)
  if (partnershipDiscount > 0) {
    lineCount++;
    if (lineCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 12, 'F');
    }
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(200, 0, 0);
    doc.text('Rabais partenariat', 90, yPos + 8);
    doc.text(`-${partnershipDiscount.toFixed(2)}`, 485, yPos + 8);
    doc.setTextColor(0, 0, 0);
    yPos += 12;
  }

  // Discount line
  if (installationTotals.discount > 0) {
    lineCount++;
    if (lineCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 12, 'F');
    }

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(200, 0, 0);
    doc.text(`Réduction ${installationTotals.discountDisplay}`, 90, yPos + 8);
    doc.text(`-${installationTotals.discount.toFixed(2)}`, 485, yPos + 8);
    doc.setTextColor(0, 0, 0);
    yPos += 12;
  }

  // Section totals
  const totalHT = roundToFiveCents(installationTotals.total);
  const totalTTC = roundToFiveCents(totalHT * (1 + TVA_RATE));
  const tva = roundToFiveCents(totalTTC - totalHT);

  doc.setFillColor(230, 230, 230);
  doc.rect(390, yPos, 165, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Total H.T.', 400, yPos + 12);
  doc.text(totalHT.toFixed(2), 485, yPos + 12);
  doc.text('TVA 8.1%', 400, yPos + 24);
  doc.text(tva.toFixed(2), 485, yPos + 24);
  doc.text('Total T.T.C.', 400, yPos + 32);
  doc.text(totalTTC.toFixed(2), 485, yPos + 32);

  yPos += 45;

  return yPos;
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

  // Material section
  if (options.materialLines.length > 0) {
    yPos = createProductSection(
      doc,
      'MATERIEL',
      options.materialLines,
      cameraTotals.material,
      null,
      yPos
    );
  }

  // Installation
  yPos = createCameraInstallationSection(
    doc,
    cameraTotals.installation,
    options.isRental,
    options.installationQty,
    yPos
  );

  // Remote access
  if (!options.isRental && options.remoteAccess) {
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const remoteAccessPrice = calculateRemoteAccessPrice(options.materialLines);
    doc.text(`Vision à distance : ${remoteAccessPrice.toFixed(2)} CHF/mois`, 40, yPos);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('(20 CHF/mois par caméra 4G + 20 CHF/mois par caméra classique si Modem 4G)', 40, yPos + 10);
    doc.setTextColor(0, 0, 0);
    yPos += 20;
  }

  // Warning if no modem and no remote access selected
  if (!options.isRental && !options.remoteAccess) {
    // Check if there's a modem in the materials
    const hasModem = options.materialLines.some(
      line => line.product && line.product.name.toLowerCase().includes('modem')
    );
    
    // Only show warning if no modem is present
    if (!hasModem) {
      yPos += 15;
      
      // Warning box with yellow/orange background
      doc.setFillColor(255, 243, 205); // Light orange/yellow
      doc.rect(40, yPos, 515, 85, 'F');
      
      // Border
      doc.setDrawColor(255, 193, 7); // Orange border
      doc.setLineWidth(2);
      doc.rect(40, yPos, 515, 85, 'S');
      
      // Warning title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(200, 100, 0); // Orange text
      doc.text('⚠️ ATTENTION - VISION À DISTANCE', 50, yPos + 15);
      
      // Warning text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      
      const warningLines = [
        'Si le client ne souscrit pas la vision à distance par le biais de Dialarme, la société Dialarme',
        'décline toutes responsabilités dû aux pertes de connexion à distance des caméras.',
        '',
        'Un forfait unique de CHF 150 HT par déplacement sera facturé au client pour la remise en réseau',
        'des caméras.',
        '',
        'Pour les caméras classiques, la vision à distance nécessite un Modem 4G (CHF 290.- HT).'
      ];
      
      let lineYPos = yPos + 30;
      warningLines.forEach(line => {
        doc.text(line, 50, lineYPos);
        lineYPos += 10;
      });
      
      // Reset colors
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      
      yPos += 100;
    }
  }

  // Maintenance
  yPos = createMaintenanceSection(doc, yPos);

  // Uninstall notice for rental mode
  if (options.isRental) {
    yPos = createUninstallNotice(doc, yPos);
  }

  // Final summary
  yPos = createFinalSummary(doc, cameraTotals, options.type, options.isRental, yPos);

  return yPos;
}

// ============================================
// PRODUCT SECTION
// ============================================

function createProductSection(
  doc: jsPDF,
  title: string,
  productLines: ProductLineData[],
  totals: { total: number; totalBeforeDiscount: number; discount: number; discountDisplay: string },
  centralType: 'titane' | 'jablotron' | null,
  yPos: number
): number {
  // Section title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 40, yPos);
  yPos += 12;

  // Table header
  doc.setFillColor(244, 230, 0);
  doc.rect(40, yPos, 515, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Qté', 50, yPos + 9);
  doc.text('Désignation du matériel', 90, yPos + 9);
  doc.text('Prix uni. HT', 400, yPos + 9);
  doc.text('Total HT', 480, yPos + 9);
  yPos += 14;

  // Product lines
  let lineCount = 0;
  let partnershipDiscount = 0;
  productLines.forEach(line => {
    if (!line.product) return;
    const product = line.product;

    lineCount++;

    // Alternating row colors
    if (lineCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 12, 'F');
    }

    const unitPrice = getLineUnitPrice(line, centralType);
    const lineTotal = unitPrice * line.quantity;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(0, 0, 0);

    // Quantity
    doc.text(line.quantity.toString(), 55, yPos + 8);

    // Product name (truncate if too long)
    const maxNameLength = 45;
    const productName = product.isCustom && line.customName ? line.customName : product.name;
    const displayName = productName.length > maxNameLength
      ? productName.substring(0, maxNameLength - 3) + '...'
      : productName;
    doc.text(displayName, 90, yPos + 8);

    // Unit price
    doc.text(unitPrice.toFixed(2), 405, yPos + 8);

    // Always show amount; partnership discount line will reflect offered items
    doc.text(lineTotal.toFixed(2), 485, yPos + 8);
    if (line.offered) partnershipDiscount += lineTotal;

    yPos += 12;
  });

  // Partnership discount line (sum of offered product lines)
  if (partnershipDiscount > 0) {
    lineCount++;
    if (lineCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 12, 'F');
    }
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(200, 0, 0);
    doc.text('Rabais partenariat', 90, yPos + 8);
    doc.text(`-${partnershipDiscount.toFixed(2)}`, 485, yPos + 8);
    doc.setTextColor(0, 0, 0);
    yPos += 12;
  }

  // Discount line
  if (totals.discount > 0) {
    lineCount++;
    if (lineCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 12, 'F');
    }

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(200, 0, 0);
    doc.text(`Réduction ${totals.discountDisplay}`, 90, yPos + 8);
    doc.text(`-${totals.discount.toFixed(2)}`, 485, yPos + 8);
    doc.setTextColor(0, 0, 0);
    yPos += 12;
  }

  // Section totals
  const totalHT = roundToFiveCents(totals.total);
  const totalTTC = roundToFiveCents(totalHT * (1 + TVA_RATE));
  const tva = roundToFiveCents(totalTTC - totalHT);

  doc.setFillColor(230, 230, 230);
  doc.rect(390, yPos, 165, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Total H.T.', 400, yPos + 12);
  doc.text(totalHT.toFixed(2), 485, yPos + 12);
  doc.text('TVA 8.1%', 400, yPos + 24);
  doc.text(tva.toFixed(2), 485, yPos + 24);
  doc.text('Total T.T.C.', 400, yPos + 32);
  doc.text(totalTTC.toFixed(2), 485, yPos + 32);

  yPos += 45;

  return yPos;
}

// ============================================
// ADMIN FEES SECTION
// ============================================

function createAdminFeesSection(
  doc: jsPDF,
  adminFees: { simCard: number; processing: number; total: number },
  yPos: number
): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FRAIS DE DOSSIER (UNIQUE)', 40, yPos);
  yPos += 15;

  // Table header
  doc.setFillColor(244, 230, 0);
  doc.rect(40, yPos, 515, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Qté', 50, yPos + 10);
  doc.text('Description', 90, yPos + 10);
  doc.text('Prix uni. HT', 400, yPos + 10);
  doc.text('Total HT', 480, yPos + 10);
  yPos += 16;

  const items = [
    { desc: 'Carte SIM + Activation', price: ADMIN_FEES.simCard, actual: adminFees.simCard },
    { desc: 'Frais de dossier', price: ADMIN_FEES.processingFee, actual: adminFees.processing }
  ];

  let lineCount = 0;
  items.forEach(item => {
    lineCount++;
    if (lineCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 14, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text('1', 55, yPos + 9);
    doc.text(item.desc, 90, yPos + 9);

    // Always show unit price, even when offered
    doc.text(item.price.toFixed(2), 405, yPos + 9);

    if (item.actual === 0) {
      // Avoid "OFFERT" in PDF wording
      doc.text('0.00', 485, yPos + 9);
    } else {
      doc.text(item.actual.toFixed(2), 485, yPos + 9);
    }

    yPos += 14;
  });

  // Totals
  const adminTotalHT = roundToFiveCents(adminFees.total);
  const adminTotalTTC = roundToFiveCents(adminTotalHT * (1 + TVA_RATE));
  const adminTVA = roundToFiveCents(adminTotalTTC - adminTotalHT);

  doc.setFillColor(230, 230, 230);
  doc.rect(390, yPos, 165, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Total H.T.', 400, yPos + 12);
  doc.text(adminTotalHT.toFixed(2), 485, yPos + 12);
  doc.text('TVA 8.1%', 400, yPos + 24);
  doc.text(adminTVA.toFixed(2), 485, yPos + 24);
  doc.text('Total T.T.C.', 400, yPos + 32);
  doc.text(adminTotalTTC.toFixed(2), 485, yPos + 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Montant à régler à l\'installation', 50, yPos + 32);

  return yPos + 50;
}

// ============================================
// SERVICES SECTION
// ============================================

function createServicesSection(
  doc: jsPDF,
  services: {
    testCyclique?: { selected: boolean; price: number; offered: boolean };
    surveillance?: { type: string | null; price: number; offered: boolean };
  },
  yPos: number
): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SERVICES', 40, yPos);
  yPos += 12;

  // Table header
  doc.setFillColor(244, 230, 0);
  doc.rect(40, yPos, 515, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Service', 90, yPos + 9);
  doc.text('Prix', 400, yPos + 9);
  doc.text('Total', 480, yPos + 9);
  yPos += 14;

  let lineCount = 0;
  let partnershipDiscount = 0;

  // Test Cyclique
  if (services.testCyclique?.selected) {
    lineCount++;
    if (lineCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 12, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('Test Cyclique', 90, yPos + 8);

    // Always show reference price
    doc.text(services.testCyclique.price.toFixed(2), 405, yPos + 8);

    // Always show amount; partnership discount line will reflect offered items
    doc.text(services.testCyclique.price.toFixed(2), 485, yPos + 8);
    if (services.testCyclique.offered) partnershipDiscount += services.testCyclique.price;

    yPos += 12;
  }

  // Surveillance
  if (services.surveillance?.type) {
    lineCount++;
    if (lineCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 12, 'F');
    }

    let serviceName = '';
    if (services.surveillance.type === 'telesurveillance') {
      serviceName = 'Télésurveillance Particulier';
    } else if (services.surveillance.type === 'telesurveillance-pro') {
      serviceName = 'Télésurveillance Professionnel';
    } else if (services.surveillance.type === 'autosurveillance') {
      serviceName = 'Autosurveillance';
    } else if (services.surveillance.type === 'autosurveillance-pro') {
      serviceName = 'Autosurveillance Professionnel';
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(serviceName, 90, yPos + 8);

    // Always show reference price
    doc.text(`${services.surveillance.price.toFixed(2)}/mois`, 405, yPos + 8);

    // Always show amount; partnership discount line will reflect offered items
    doc.text(`${services.surveillance.price.toFixed(2)}/mois`, 485, yPos + 8);
    if (services.surveillance.offered) partnershipDiscount += services.surveillance.price;

    yPos += 12;
  }

  // Partnership discount line (sum of offered services)
  if (partnershipDiscount > 0) {
    lineCount++;
    if (lineCount % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 12, 'F');
    }
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(200, 0, 0);
    doc.text('Rabais partenariat', 90, yPos + 8);
    doc.text(`-${partnershipDiscount.toFixed(2)}`, 485, yPos + 8);
    doc.setTextColor(0, 0, 0);
    yPos += 12;
  }

  return yPos + 5;
}

// ============================================
// OPTIONS SECTION
// ============================================

function createOptionsSection(
  doc: jsPDF,
  options: {
    interventionsGratuites?: boolean;
    interventionsAnnee?: boolean;
    interventionsQty?: number;
    serviceCles?: boolean;
  },
  yPos: number
): number {
  if (!options.interventionsGratuites && !options.interventionsAnnee && !options.serviceCles) {
    return yPos;
  }

  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('OPTIONS DE L\'OFFRE : ', 40, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const optionsList: string[] = [];
  if (options.interventionsGratuites) {
    optionsList.push('Interventions gratuites & illimitées des agents');
  }
  if (options.interventionsAnnee) {
    optionsList.push(`${options.interventionsQty || 1} intervention(s) par année des agents`);
  }
  if (options.serviceCles) {
    // Avoid "offert" wording in PDF
    optionsList.push('Service des clés inclus');
  }

  doc.text(optionsList.join(' | '), 165, yPos);
  yPos += 20;

  return yPos;
}

// ============================================
// CAMERA INSTALLATION SECTION
// ============================================

function createCameraInstallationSection(
  doc: jsPDF,
  installation: { total: number; totalBeforeDiscount: number; discount: number; discountDisplay: string },
  isRental: boolean,
  installationQty: number | undefined,
  yPos: number
): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('INSTALLATION', 40, yPos);
  yPos += 15;

  // Table header
  doc.setFillColor(244, 230, 0);
  doc.rect(40, yPos, 515, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Qté', 50, yPos + 10);
  doc.text('Désignation', 90, yPos + 10);
  doc.text('Prix uni. HT', 400, yPos + 10);
  doc.text('Total HT', 480, yPos + 10);
  yPos += 16;

  const isOffered = installation.totalBeforeDiscount === 0;

  // Installation line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('1', 55, yPos + 9);
  const installLabel =
    installationQty === 1 ? 'Installation 1/2 journée' :
    installationQty === 2 ? 'Installation 1 journée' :
    'Installation, paramétrages, tests, mise en service & formation';
  doc.text(installLabel, 90, yPos + 9);

  if (isRental || isOffered) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 150, 0);
    doc.text(isRental ? 'Compris dans le forfait' : '0.00', 395, yPos + 9);
    doc.text(isRental ? 'Compris' : '0.00', 475, yPos + 9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
  } else {
    doc.text(installation.totalBeforeDiscount.toFixed(2), 405, yPos + 9);
    doc.text(installation.totalBeforeDiscount.toFixed(2), 485, yPos + 9);
  }

  yPos += 14;

  // Discount line
  if (installation.discount > 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(200, 0, 0);
    doc.text(`Réduction ${installation.discountDisplay}`, 90, yPos + 9);
    doc.text(`-${installation.discount.toFixed(2)}`, 485, yPos + 9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    yPos += 14;
  }

  if (!isRental) {
    const installTotalHT = roundToFiveCents(installation.total);
    const installTotalTTC = roundToFiveCents(installTotalHT * (1 + TVA_RATE));
    const installTVA = roundToFiveCents(installTotalTTC - installTotalHT);

    doc.setFillColor(200, 200, 200);
    doc.rect(390, yPos, 165, 42, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Total H.T.', 400, yPos + 9);
    doc.text(installTotalHT.toFixed(2), 485, yPos + 9);
    doc.text('TVA 8.1%', 400, yPos + 21);
    doc.text(installTVA.toFixed(2), 485, yPos + 21);
    doc.text('Total T.T.C.', 400, yPos + 35);
    doc.text(installTotalTTC.toFixed(2), 485, yPos + 35);

    yPos += 42;
  }

  return yPos + 15;
}

// ============================================
// MAINTENANCE SECTION
// ============================================

function createMaintenanceSection(doc: jsPDF, yPos: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('MAINTENANCE ET GARANTIE', 40, yPos);
  yPos += 15;

  // Table header
  doc.setFillColor(244, 230, 0);
  doc.rect(40, yPos, 515, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Qté', 50, yPos + 10);
  doc.text('Désignation', 90, yPos + 10);
  doc.text('Prix uni. HT', 400, yPos + 10);
  doc.text('Total HT', 480, yPos + 10);
  yPos += 16;

  // Maintenance line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('1', 55, yPos + 9);
  doc.text('Assistance hotline, déplacement(s), matériels pièce(s), main d\'œuvre et support téléphonique', 90, yPos + 9);
  // Avoid "OFFERT" wording in PDF
  doc.text('0.00', 405, yPos + 9);
  doc.text('0.00', 485, yPos + 9);
  yPos += 14;

  return yPos + 15;
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
// FINAL SUMMARY
// ============================================

function createFinalSummary(
  doc: jsPDF,
  totals: AlarmTotals | CameraTotals,
  type: 'alarm' | 'camera',
  isRental: boolean,
  yPos: number
): number {
  yPos += 15;

  // Header
  doc.setFillColor(244, 230, 0);
  doc.rect(40, yPos, 515, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('RÉCAPITULATIF GÉNÉRAL', 50, yPos + 10);
  yPos += 16;

  // Monthly payments section
  if (!isRental && totals.monthly) {
    doc.setFillColor(245, 245, 245);
    doc.rect(40, yPos, 515, 75, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`MENSUALITÉS GLOBALES (${totals.monthly.months} mois)`, 50, yPos + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    const serviceName = type === 'alarm' ? 'Surveillance' : 'Vision à distance';
    const serviceAmount = type === 'alarm' 
      ? (totals as AlarmTotals).monthly?.surveillanceHT || 0
      : (totals as CameraTotals).monthly?.remoteAccessHT || 0;
    
    if (type === 'camera') {
      const cameraMonthly = (totals as CameraTotals).monthly!;
      // Show separate monthly amounts for material and installation
      doc.text(
        `Matériel = ${cameraMonthly.materialHT.toFixed(2)} CHF HT   |   Installation = ${cameraMonthly.installationHT.toFixed(2)} CHF HT`,
        50,
        yPos + 35
      );
      // Optional vision à distance line
      if (serviceAmount > 0) {
        doc.text(
          `${serviceName} = ${serviceAmount.toFixed(2)} CHF HT`,
          50,
          yPos + 48
        );
      }
    } else {
      // Alarm: keep original wording
      if (serviceAmount > 0) {
        doc.text(
          `Installation et matériel supp. = ${totals.monthly.installationHT?.toFixed(2) || '0.00'} CHF HT   |   ${serviceName} = ${serviceAmount?.toFixed(2) || '0.00'} CHF HT`,
          50,
          yPos + 35
        );
      } else {
        doc.text(
          `Installation et matériel supp. = ${totals.monthly.installationHT?.toFixed(2) || '0.00'} CHF HT`,
          50,
          yPos + 35
        );
      }
    }

    doc.text(`Total mensualité HT = ${totals.monthly.totalHT.toFixed(2)} CHF`, 50, yPos + 48);
    doc.text(`TVA 8,1% = ${roundToFiveCents(totals.monthly.totalTTC - totals.monthly.totalHT).toFixed(2)} CHF`, 250, yPos + 48);

    doc.setFillColor(255, 255, 255);
    doc.rect(420, yPos + 38, 120, 20, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Total TTC = ${totals.monthly.totalTTC.toFixed(2)} CHF`, 430, yPos + 51);

    yPos += 75;

    // Facility payment / contract text (alarm only) - required by client feedback
    if (type === 'alarm' && totals.monthly.months > 0) {
      const alarmTotals = totals as AlarmTotals;
      const monthsCount = totals.monthly.months;

      // Finance amount is based on Total HT, excluding admin fees & SIM (as per Milestone formulas)
      const facilityMonthlyHT = calculateFacilityPayment(
        alarmTotals.totalHT,
        alarmTotals.adminFees.processing,
        alarmTotals.adminFees.simCard,
        monthsCount
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);

      // Keep text wording aligned with client checklist
      doc.text(
        `Possibilité de facilité de paiement sur ${monthsCount} mois pour le matériel supplémentaire hors frais de dossier`,
        40,
        yPos + 12
      );
      doc.text(
        `La mensualité de CHF ${facilityMonthlyHT}.- HT est fixée et non indexable pendant la durée contractuelle de ${monthsCount} mois.`,
        40,
        yPos + 24
      );

      yPos += 30;
    }

    // Cash payment (alarm only)
    if (type === 'alarm' && (totals as AlarmTotals).cash) {
      yPos += 15;

      doc.setFillColor(245, 245, 245);
      doc.rect(40, yPos, 515, 45, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('MONTANT À RÉGLER COMPTANT', 50, yPos + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const cash = (totals as AlarmTotals).cash!;
      doc.text(`Total HT = ${cash.totalHT.toFixed(2)} CHF`, 50, yPos + 30);
      doc.text(`TVA 8,1% = ${roundToFiveCents(cash.totalTTC - cash.totalHT).toFixed(2)} CHF`, 250, yPos + 30);

      doc.setFillColor(255, 255, 255);
      doc.rect(420, yPos + 20, 120, 20, 'F');

      doc.setFont('helvetica', 'bold');
      doc.text(`Total TTC = ${cash.totalTTC.toFixed(2)} CHF`, 430, yPos + 33);

      yPos += 50;
    }
  } else {
    // Cash payment only
    doc.setFillColor(245, 245, 245);
    doc.rect(40, yPos, 515, 45, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(
      isRental ? 'MONTANT TOTAL LOCATION (PAIEMENT COMPTANT)' : 'MONTANT TOTAL (PAIEMENT COMPTANT)',
      50,
      yPos + 18
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Total HT = ${totals.totalHT.toFixed(2)} CHF`, 50, yPos + 30);
    doc.text(`TVA 8,1% = ${roundToFiveCents(totals.totalTTC - totals.totalHT).toFixed(2)} CHF`, 250, yPos + 30);

    doc.setFillColor(255, 255, 255);
    doc.rect(420, yPos + 20, 120, 20, 'F');

    doc.setFont('helvetica', 'bold');
    doc.text(`Total TTC = ${totals.totalTTC.toFixed(2)} CHF`, 430, yPos + 33);

    yPos += 50;
  }

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

