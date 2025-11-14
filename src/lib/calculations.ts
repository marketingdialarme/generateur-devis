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
    if (line.offered || !line.product) return;
    
    // Calculate price based on product
    let price = 0;
    if (line.product.isCustom && line.customPrice !== undefined) {
      price = line.customPrice;
    } else if (line.product.price !== undefined) {
      price = line.product.price;
    }
    
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
    
    // Get price for this line
    let price = 0;
    if (product.isCustom && line.customPrice !== undefined) {
      price = line.customPrice;
    } else if (product.price !== undefined) {
      price = product.price;
    } else if (selectedCentral === 'titane' && product.priceTitane !== undefined) {
      price = product.priceTitane;
    } else if (selectedCentral === 'jablotron' && product.priceJablotron !== undefined) {
      price = product.priceJablotron;
    }

    // Custom product - calculate monthly from price
    if (product.isCustom) {
      const monthlyPrice = price / months;
      monthlyTotal += roundToFiveCents(monthlyPrice) * line.quantity;
      return;
    }

    let monthlyPrice = 0;

    // Alarm products
    if (sectionId === 'alarm-material' || sectionId === 'alarm-installation') {
      if (selectedCentral === 'titane' && product.monthlyTitane !== undefined) {
        monthlyPrice = product.monthlyTitane;
      } else if (selectedCentral === 'jablotron' && product.monthlyJablotron !== undefined) {
        monthlyPrice = product.monthlyJablotron;
      }
    }
    // Camera products
    else if (sectionId === 'camera-material') {
      const cameraProduct = product as any; // Camera-specific monthly pricing
      if (months === 48 && cameraProduct.monthly48 !== undefined) {
        monthlyPrice = cameraProduct.monthly48;
      } else if (months === 36 && cameraProduct.monthly36 !== undefined) {
        monthlyPrice = cameraProduct.monthly36;
      } else if (months === 24 && cameraProduct.monthly24 !== undefined) {
        monthlyPrice = cameraProduct.monthly24;
      }
    }

    // Fallback: calculate from total price
    if (monthlyPrice === 0 && price > 0) {
      monthlyPrice = price / months;
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

  // Total HT and TTC (round HT up first, then calculate TTC and round up again)
  const totalHT = roundToFiveCents(material.total + installationTotal.total + adminTotal + testCycliqueTotal);
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

  // Remote access - use tiered pricing based on camera count
  const remoteAccessPrice = (!isRentalMode && remoteAccessEnabled) 
    ? calculateRemoteAccessPrice(materialLines)
    : 0;

  // Total HT and TTC (round HT up first, then calculate TTC and round up again)
  const totalHT = roundToFiveCents(material.total + installationTotal);
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

