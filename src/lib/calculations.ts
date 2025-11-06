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
  TEST_CYCLIQUE_DEFAULT_PRICE,
  roundToFiveCents,
  calculateInstallationPrice,
  getInstallationMonthlyPrice,
  type AlarmProduct,
  type CameraProduct
} from './quote-generator';

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
  simCardOffered: boolean;
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
  installation: {
    total: number;
    isOffered: boolean;
  };
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
  discount?: DiscountConfig
): SectionTotals {
  // Calculate subtotal from product lines
  let subtotal = 0;
  
  productLines.forEach(line => {
    if (line.isOffered || !line.productId) return;
    const lineTotal = line.price * line.quantity;
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
    if (line.isOffered || !line.productId || line.quantity === 0) return;

    // Custom product
    if (line.isCustom) {
      const monthlyPrice = line.price / months;
      monthlyTotal += roundToFiveCents(monthlyPrice) * line.quantity;
      return;
    }

    // Find product in catalog
    const product = catalog.find(p => p.id === line.productId);
    if (!product) return;

    let monthlyPrice = 0;

    // Alarm products
    if (sectionId === 'alarm-material' || sectionId === 'alarm-installation') {
      const alarmProduct = product as AlarmProduct;
      if (selectedCentral === 'titane' && alarmProduct.monthlyTitane !== undefined) {
        monthlyPrice = alarmProduct.monthlyTitane;
      } else if (selectedCentral === 'jablotron' && alarmProduct.monthlyJablotron !== undefined) {
        monthlyPrice = alarmProduct.monthlyJablotron;
      }
    }
    // Camera products
    else if (sectionId === 'camera-material') {
      const cameraProduct = product as CameraProduct;
      if (months === 48 && cameraProduct.monthly48 !== undefined) {
        monthlyPrice = cameraProduct.monthly48;
      } else if (months === 36 && cameraProduct.monthly36 !== undefined) {
        monthlyPrice = cameraProduct.monthly36;
      } else if (months === 24 && cameraProduct.monthly24 !== undefined) {
        monthlyPrice = cameraProduct.monthly24;
      }
    }

    // Fallback: calculate from total price
    if (monthlyPrice === 0) {
      monthlyPrice = line.price / months;
    }

    monthlyPrice = roundToFiveCents(monthlyPrice);
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
  alarmCatalog: AlarmProduct[]
): AlarmTotals {
  // Material totals
  const material = calculateSectionTotal(materialLines, materialDiscount);

  // Installation totals
  const installationProductsTotal = calculateSectionTotal(installationLines, installationDiscount);
  const mainInstallTotal = isRentalMode ? 0 : (installation.isOffered ? 0 : (installation.price || calculateInstallationPrice(installation.quantity)));
  
  const installationTotal = {
    ...installationProductsTotal,
    total: installationProductsTotal.total + mainInstallTotal,
    totalBeforeDiscount: installationProductsTotal.totalBeforeDiscount + mainInstallTotal
  };

  // Admin fees
  const simCard = adminFees.simCardOffered ? 0 : ADMIN_FEES.simCard;
  const processing = adminFees.processingOffered ? 0 : ADMIN_FEES.processingFee;
  const adminTotal = simCard + processing;

  // Services
  const testCycliqueTotal = services.testCyclique.selected 
    ? (services.testCyclique.offered ? 0 : services.testCyclique.price)
    : 0;
  
  const surveillanceTotal = services.surveillance.type 
    ? (services.surveillance.offered ? 0 : services.surveillance.price)
    : 0;

  // Total HT and TTC
  const totalHT = material.total + installationTotal.total + adminTotal + testCycliqueTotal;
  const totalTTC = roundToFiveCents(totalHT * (1 + TVA_RATE));

  const result: AlarmTotals = {
    material,
    installation: installationTotal,
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

    const mainInstallMonthlyHT = installation.isOffered 
      ? 0 
      : roundToFiveCents(getInstallationMonthlyPrice(installation.quantity, paymentMonths));

    const totalMonthlyHT = materialMonthlyHT + installationProductsMonthlyHT + mainInstallMonthlyHT + surveillanceTotal;
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
    const cashTTC = roundToFiveCents(adminTotal * (1 + TVA_RATE));
    result.cash = {
      totalHT: adminTotal,
      totalTTC: cashTTC
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
  remoteAccessEnabled: boolean,
  paymentMonths: number,
  isRentalMode: boolean,
  cameraCatalog: CameraProduct[]
): CameraTotals {
  // Material totals
  const material = calculateSectionTotal(materialLines, materialDiscount);

  // Installation
  const installationTotal = isRentalMode 
    ? 0 
    : (installation.isOffered ? 0 : (installation.price || calculateInstallationPrice(installation.quantity)));

  // Remote access
  const remoteAccessPrice = (!isRentalMode && remoteAccessEnabled) ? REMOTE_ACCESS_PRICE : 0;

  // Total HT and TTC
  const totalHT = material.total + installationTotal;
  const totalTTC = roundToFiveCents(totalHT * (1 + TVA_RATE));

  const result: CameraTotals = {
    material,
    installation: {
      total: installationTotal,
      isOffered: installation.isOffered
    },
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

    const installationMonthlyHT = installation.isOffered 
      ? 0 
      : roundToFiveCents(getInstallationMonthlyPrice(installation.quantity, paymentMonths));

    const totalMonthlyHT = materialMonthlyHT + installationMonthlyHT + remoteAccessPrice;
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

// ============================================
// DISPLAY HELPERS
// ============================================

/**
 * Format section total with discount display
 */
export function formatSectionTotal(totals: SectionTotals): string {
  if (totals.discount > 0) {
    return `${totals.totalBeforeDiscount.toFixed(2)} CHF - Réduction ${totals.discountDisplay} = ${totals.total.toFixed(2)} CHF`;
  }
  return `${totals.total.toFixed(2)} CHF`;
}

/**
 * Format price with "OFFERT" if offered
 */
export function formatPrice(price: number, isOffered: boolean): string {
  return isOffered ? 'OFFERT' : `${price.toFixed(2)} CHF`;
}

/**
 * Format monthly price
 */
export function formatMonthlyPrice(price: number, isOffered: boolean): string {
  return isOffered ? 'OFFERT' : `${price.toFixed(2)} CHF/mois`;
}

