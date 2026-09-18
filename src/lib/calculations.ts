/**
 * ============================================================================
 * CALCULATIONS LIBRARY
 * ============================================================================
 * 
 * Migrated from script.js (lines 870-1188)
 * Pure calculation functions for quote totals, discounts, and monthly payments
 */

import {
  TVA_RATE,
  ADMIN_FEES,
  REMOTE_ACCESS_PRICE,
  REMOTE_ACCESS_PRICE_2_7,
  REMOTE_ACCESS_PRICE_8_PLUS,
  TEST_CYCLIQUE_DEFAULT_PRICE,
  roundToFiveCents,
  calculateInstallationPrice,
  getInstallationMonthlyPrice,
  calculateMonthlyFromCashPrice,
  type AlarmProduct,
  type CameraProduct
} from './quote-generator';

import { calculateRemoteAccessPrice } from './product-line-adapter';

import type { ProductLineData } from '@/components/ProductLine';

// ============================================
// INTERFACES
// ============================================

export interface DiscountConfig {
  type: 'percent' | 'fixed';
  value: number;
}

export interface InstallationConfig {
  quantity: number;
  isOffered: boolean;
  price?: number;
}

export interface AdminFeesConfig {
  simCardSelected: boolean; // Whether SIM card is selected at all
  simCardOffered: boolean;
  /**
   * Whether "Frais de dossier" is included on this quote. Defaults to true
   * when the field is missing (backwards-compat for callers that predate the
   * include/exclude checkbox). When false, the fee is fully excluded from
   * totals AND the PDF row is suppressed.
   */
  processingSelected?: boolean;
  processingOffered: boolean;
}

export interface ServicesConfig {
  testCyclique: {
    selected: boolean;
    price: number;
    offered: boolean;
  };
  surveillance: {
    type: string | null;
    price: number;
    offered: boolean;
  };
}

export interface SectionTotals {
  subtotal: number;
  discount: number;
  total: number;
  totalBeforeDiscount: number;
  discountDisplay: string;
}

export interface AlarmTotals {
  material: SectionTotals;
  installation: SectionTotals;
  // Purely additive vs. installation.total (which still includes Matériel
  // divers products, unchanged, for whatever else already reads it) --
  // installationFeeOnly is just the flat "Installation et paramétrage" fee,
  // so the on-screen récapitulatif can show Matériel divers under
  // "Matériel" instead of "Installation" (client feedback).
  installationFeeOnly: number;
  adminFees: {
    simCard: number;
    processing: number;
    total: number;
  };
  services: {
    testCyclique: number;
    surveillance: number;
  };
  totalHT: number;
  totalTTC: number;
  monthly?: {
    materialHT: number;
    installationHT: number;
    surveillanceHT: number;
    totalHT: number;
    totalTTC: number;
    months: number;
  };
  cash?: {
    totalHT: number;
    totalTTC: number;
  };
}

export interface CameraTotals {
  material: SectionTotals;
  installation: SectionTotals;
  remoteAccess: {
    enabled: boolean;
    price: number;
  };
  totalHT: number;
  totalTTC: number;
  monthly?: {
    materialHT: number;
    installationHT: number;
    remoteAccessHT: number;
    totalHT: number;
    totalTTC: number;
    months: number;
  };
}

// ============================================
// SECTION CALCULATIONS
// ============================================

/**
 * Calculate total for a section of products
 */
export function calculateSectionTotal(
  productLines: ProductLineData[],
  discount?: DiscountConfig,
  selectedCentral?: string | null
): SectionTotals {
  // Calculate subtotal from product lines
  let subtotal = 0;

  productLines.forEach(line => {
    if (line.offered || !line.product) return;

    // Resolve unit price — mirrors getLineUnitPrice so totals match the PDF.
    // customPrice overrides; otherwise the line's own price (every catalog
    // product now carries a single `price`, since Titane/Jablotron are
    // separate sheet rows rather than one entry with priceTitane/priceJablotron).
    const price = line.customPrice !== undefined ? line.customPrice : (line.product.price ?? 0);

    const lineTotal = price * line.quantity;
    subtotal += lineTotal;
  });

  const totalBeforeDiscount = subtotal;

  // Apply discount if provided
  let discountAmount = 0;
  let discountDisplay = '';
  
  if (discount && discount.value > 0) {
    if (discount.type === 'percent') {
      discountAmount = subtotal * (discount.value / 100);
      discountDisplay = `${discount.value}%`;
    } else {
      discountAmount = Math.min(discount.value, subtotal);
      discountDisplay = `${discount.value.toFixed(2)} CHF`;
    }
    subtotal = Math.max(0, subtotal - discountAmount);
  }

  return {
    subtotal,
    discount: discountAmount,
    total: subtotal,
    totalBeforeDiscount,
    discountDisplay
  };
}

/**
 * Calculate monthly price for a section of products
 */
export function calculateSectionMonthlyPrice(
  productLines: ProductLineData[],
  months: number,
  selectedCentral: string | null,
  catalog: (AlarmProduct | CameraProduct)[],
  sectionId: string
): number {
  if (months === 0) return 0;

  let monthlyTotal = 0;

  productLines.forEach(line => {
    if (line.offered || !line.product || line.quantity === 0) return;

    const product = line.product;
    
    // Get price for this line — every catalog product now carries a single
    // `price` (Titane/Jablotron are separate sheet rows, not one entry with
    // priceTitane/priceJablotron); customPrice still overrides.
    const price = line.customPrice !== undefined ? line.customPrice : (product.price ?? 0);

    // Custom product - calculate monthly from price
    if (product.isCustom || line.customPrice !== undefined) {
      const monthlyPrice = price / months;
      monthlyTotal += roundToFiveCents(monthlyPrice) * line.quantity;
      return;
    }

    // Same Milestone-1 formula used everywhere else (Fog, Visiophone, and the
    // PDF "Facilité de paiement" block for every category): (price * coef) / months,
    // rounded up to the franc. Replaces the old per-category stored values
    // (monthlyTitane/monthlyJablotron, monthly48/36/24 — the last of which had
    // no case for 12 months and silently fell back to a plain, unmarked-up
    // price / months) so the on-screen preview always matches the PDF.
    const monthlyPrice = price > 0 ? calculateMonthlyFromCashPrice(price, months) : 0;
    monthlyTotal += monthlyPrice * line.quantity;
  });

  return monthlyTotal;
}

// ============================================
// ALARM CALCULATIONS
// ============================================

/**
 * Calculate all alarm totals
 */
export function calculateAlarmTotals(
  materialLines: ProductLineData[],
  installationLines: ProductLineData[],
  materialDiscount: DiscountConfig | undefined,
  installationDiscount: DiscountConfig | undefined,
  installation: InstallationConfig,
  adminFees: AdminFeesConfig,
  services: ServicesConfig,
  paymentMonths: number,
  isRentalMode: boolean,
  selectedCentral: string | null,
  alarmCatalog: AlarmProduct[],
  // Location mode only: the single monthly figure that counts towards the
  // "mensualité" total -- XTO-ABO for Chantier, the chosen LOC-AUTO-*/
  // LOC-TEL-* surveillance price for Location (client spec: everything
  // else in rental mode is shown for info only, not summed in here).
  rentalMonthlyAmount?: number
): AlarmTotals {
  // Material totals
  const material = calculateSectionTotal(materialLines, materialDiscount, selectedCentral);

  // Installation totals
  const installationProductsTotal = calculateSectionTotal(installationLines, installationDiscount, selectedCentral);
  const mainInstallTotal = isRentalMode ? 0 : (installation.isOffered ? 0 : (installation.price || calculateInstallationPrice(installation.quantity)));
  
  const installationTotal = {
    ...installationProductsTotal,
    total: installationProductsTotal.total + mainInstallTotal,
    totalBeforeDiscount: installationProductsTotal.totalBeforeDiscount + mainInstallTotal
  };

  // Admin fees (only include SIM card / processing fee if selected)
  const simCard = !adminFees.simCardSelected ? 0 : (adminFees.simCardOffered ? 0 : ADMIN_FEES.simCard);
  const processingSelected = adminFees.processingSelected ?? true;
  const processing = !processingSelected ? 0 : (adminFees.processingOffered ? 0 : ADMIN_FEES.processingFee);
  const adminTotal = simCard + processing;

  // Services
  const testCycliqueTotal = services.testCyclique.selected 
    ? (services.testCyclique.offered ? 0 : services.testCyclique.price)
    : 0;
  
  const surveillanceTotal = services.surveillance.type 
    ? (services.surveillance.offered ? 0 : services.surveillance.price)
    : 0;

  // Total HT and TTC (round HT up first, then calculate TTC and round up again)
  const totalHT = roundToFiveCents(material.total + installationTotal.total + adminTotal + testCycliqueTotal);
  const totalTTC = roundToFiveCents(totalHT * (1 + TVA_RATE));

  const result: AlarmTotals = {
    material,
    installation: installationTotal,
    installationFeeOnly: mainInstallTotal,
    adminFees: {
      simCard,
      processing,
      total: adminTotal
    },
    services: {
      testCyclique: testCycliqueTotal,
      surveillance: surveillanceTotal
    },
    totalHT,
    totalTTC
  };

  // Monthly payments (if not rental and payment months > 0)
  if (!isRentalMode && paymentMonths > 0) {
    const materialMonthlyHT = calculateSectionMonthlyPrice(
      materialLines,
      paymentMonths,
      selectedCentral,
      alarmCatalog,
      'alarm-material'
    );

    const installationProductsMonthlyHT = calculateSectionMonthlyPrice(
      installationLines,
      paymentMonths,
      selectedCentral,
      alarmCatalog,
      'alarm-installation'
    );

    // If installation has an explicit price but no half-day quantity, compute monthly as price/months.
    // This supports alarm installation pricing that is not based on half-days.
    const mainInstallMonthlyHT = installation.isOffered
      ? 0
      : installation.quantity > 0
        ? roundToFiveCents(getInstallationMonthlyPrice(installation.quantity, paymentMonths))
        : roundToFiveCents((installation.price || 0) / paymentMonths);

    const totalMonthlyHT = roundToFiveCents(materialMonthlyHT + installationProductsMonthlyHT + mainInstallMonthlyHT + surveillanceTotal);
    const totalMonthlyTTC = roundToFiveCents(totalMonthlyHT * (1 + TVA_RATE));

    result.monthly = {
      materialHT: materialMonthlyHT,
      installationHT: installationProductsMonthlyHT + mainInstallMonthlyHT,
      surveillanceHT: surveillanceTotal,
      totalHT: totalMonthlyHT,
      totalTTC: totalMonthlyTTC,
      months: paymentMonths
    };

    // Cash payment (admin fees)
    const cashHT = roundToFiveCents(adminTotal);
    const cashTTC = roundToFiveCents(cashHT * (1 + TVA_RATE));
    result.cash = {
      totalHT: cashHT,
      totalTTC: cashTTC
    };
  } else if (isRentalMode && rentalMonthlyAmount !== undefined) {
    // Location: only the single rental amount (XTO-ABO or the chosen
    // surveillance price) counts towards the monthly total -- kit
    // contents, frais de dossier, carte SIM, test cyclique etc. are all
    // shown for info elsewhere on the quote, not summed in here.
    const totalMonthlyHT = roundToFiveCents(rentalMonthlyAmount);
    const totalMonthlyTTC = roundToFiveCents(totalMonthlyHT * (1 + TVA_RATE));

    result.monthly = {
      materialHT: 0,
      installationHT: 0,
      surveillanceHT: rentalMonthlyAmount,
      totalHT: totalMonthlyHT,
      totalTTC: totalMonthlyTTC,
      months: paymentMonths
    };
  }

  return result;
}

// ============================================
// CAMERA CALCULATIONS
// ============================================

/**
 * Calculate all camera totals
 */
export function calculateCameraTotals(
  materialLines: ProductLineData[],
  materialDiscount: DiscountConfig | undefined,
  installation: InstallationConfig,
  installationDiscount: DiscountConfig | undefined,
  installationPayCash: boolean,
  remoteAccessEnabled: boolean,
  paymentMonths: number,
  isRentalMode: boolean,
  cameraCatalog: CameraProduct[]
): CameraTotals {
  // Material totals
  const material = calculateSectionTotal(materialLines, materialDiscount);

  // Installation - calculate base price first
  const baseInstallationPrice = isRentalMode 
    ? 0 
    : (installation.isOffered ? 0 : (installation.price || calculateInstallationPrice(installation.quantity)));
  
  // Apply discount to installation
  let installationTotal = baseInstallationPrice;
  let installationDiscount_amount = 0;
  let installationDiscountDisplay = '';
  
  if (!installation.isOffered && installationDiscount && installationDiscount.value > 0 && baseInstallationPrice > 0) {
    if (installationDiscount.type === 'percent') {
      installationDiscount_amount = baseInstallationPrice * (installationDiscount.value / 100);
      installationDiscountDisplay = `${installationDiscount.value}%`;
    } else {
      installationDiscount_amount = Math.min(installationDiscount.value, baseInstallationPrice);
      installationDiscountDisplay = `${installationDiscount.value.toFixed(2)} CHF`;
    }
    installationTotal = Math.max(0, baseInstallationPrice - installationDiscount_amount);
  }

  const installationSectionTotals: SectionTotals = {
    subtotal: installationTotal,
    discount: installationDiscount_amount,
    total: installationTotal,
    totalBeforeDiscount: baseInstallationPrice,
    discountDisplay: installationDiscountDisplay
  };

  // Remote access - use tiered pricing based on camera count
  const remoteAccessPrice = (!isRentalMode && remoteAccessEnabled) 
    ? calculateRemoteAccessPrice(materialLines)
    : 0;

  // Total HT and TTC (round HT up first, then calculate TTC and round up again)
  const totalHT = roundToFiveCents(material.total + installationTotal);
  const totalTTC = roundToFiveCents(totalHT * (1 + TVA_RATE));

  const result: CameraTotals = {
    material,
    installation: installationSectionTotals,
    remoteAccess: {
      enabled: remoteAccessEnabled && !isRentalMode,
      price: remoteAccessPrice
    },
    totalHT,
    totalTTC
  };

  // Monthly payments (if not rental and payment months > 0)
  if (!isRentalMode && paymentMonths > 0) {
    const materialMonthlyHT = calculateSectionMonthlyPrice(
      materialLines,
      paymentMonths,
      null,
      cameraCatalog,
      'camera-material'
    );

    const installationMonthlyHT = installationPayCash
      ? 0
      : installation.isOffered
        ? 0
        : roundToFiveCents(getInstallationMonthlyPrice(installation.quantity, paymentMonths));

    const totalMonthlyHT = roundToFiveCents(materialMonthlyHT + installationMonthlyHT + remoteAccessPrice);
    const totalMonthlyTTC = roundToFiveCents(totalMonthlyHT * (1 + TVA_RATE));

    result.monthly = {
      materialHT: materialMonthlyHT,
      installationHT: installationMonthlyHT,
      remoteAccessHT: remoteAccessPrice,
      totalHT: totalMonthlyHT,
      totalTTC: totalMonthlyTTC,
      months: paymentMonths
    };
  }

  return result;
}


