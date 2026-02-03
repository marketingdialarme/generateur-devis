/**
 * Product Line Data Adapter
 * 
 * Converts between ProductLineData (component format) and calculation format
 * Provides utility functions for working with product lines
 */

import { ProductLineData, Product } from '@/components/ProductLine';
import { calculateInstallationPrice } from './quote-generator';

// Calculation-compatible format
export interface CalcProductLine {
  id: number;
  productId: number | null;
  price: number;
  quantity: number;
  isOffered: boolean;
  isCustom?: boolean;
}

/**
 * Convert ProductLineData to calculation-compatible format
 */
export function toCalcFormat(
  lines: ProductLineData[],
  centralType: 'titane' | 'jablotron' | null
): CalcProductLine[] {
  return lines.map(line => {
    let price = 0;
    
    if (line.product) {
      // Treat customPrice as an explicit override (even for non-custom products)
      if (line.customPrice !== undefined) {
        price = line.customPrice;
      } else if (line.product.price !== undefined) {
        price = line.product.price;
      } else if (centralType === 'titane' && line.product.priceTitane !== undefined) {
        price = line.product.priceTitane;
      } else if (centralType === 'jablotron' && line.product.priceJablotron !== undefined) {
        price = line.product.priceJablotron;
      }
    }
    
    return {
      id: line.id,
      productId: line.product?.id || null,
      price,
      quantity: line.quantity,
      isOffered: line.offered,
      isCustom: line.product?.isCustom
    };
  });
}

/**
 * Detect the selected central type from product lines
 */
export function detectCentralType(lines: ProductLineData[]): 'titane' | 'jablotron' | null {
  for (const line of lines) {
    if (line.product) {
      if (line.product.id === 5 || line.product.name?.includes('Jablotron')) {
        return 'jablotron';
      }
      if (line.product.id === 6 || line.product.name?.includes('Titane')) {
        return 'titane';
      }
    }
  }
  return null;
}

/**
 * Get display name for a product line
 */
export function getProductLineName(line: ProductLineData): string {
  if (line.product?.isCustom && line.customName) {
    return line.customName;
  }
  return line.product?.name || 'Produit non sélectionné';
}

/**
 * Get price for a product line based on central type
 */
export function getProductLinePrice(
  line: ProductLineData,
  centralType: 'titane' | 'jablotron' | null
): number {
  if (!line.product) return 0;
  
  // Treat customPrice as an explicit override (even for non-custom products)
  if (line.customPrice !== undefined) {
    return line.customPrice;
  }
  
  if (line.product.price !== undefined) {
    return line.product.price;
  }
  
  if (centralType === 'titane' && line.product.priceTitane !== undefined) {
    return line.product.priceTitane;
  }
  
  if (centralType === 'jablotron' && line.product.priceJablotron !== undefined) {
    return line.product.priceJablotron;
  }
  
  return 0;
}

/**
 * Calculate total for a single product line
 */
export function calculateLineTotal(
  line: ProductLineData,
  centralType: 'titane' | 'jablotron' | null
): number {
  if (line.offered) return 0;
  const price = getProductLinePrice(line, centralType);
  return price * line.quantity;
}

/**
 * Calculate camera installation price with tiered pricing
 * Client feedback (global): installation pricing by half-day/day applies to cameras.
 * - 1 = 1/2 journée (690 CHF)
 * - 2 = 1 journée (1290 CHF)
 * - Additional half-days follow the same tiered logic
 */
export function calculateCameraInstallation(cameraLines: ProductLineData[], halfDays?: number): number {
  // NOTE: cameraLines currently not used for installation pricing; pricing is driven
  // by the selected installation duration (halfDays).
  void cameraLines;
  return calculateInstallationPrice(halfDays || 1);
}

/**
 * Calculate remote access ("vision à distance") price.
 *
 * Client feedback:
 * - 20 CHF/mois per 4G camera
 * - For non-4G ("classic") cameras, remote access is only priced if a Modem 4G is selected
 * - The 20 CHF is for cameras only (NOT for the modem)
 * - Example: 1 classic cam (with modem) + 1 4G cam => 20 + 20 = 40 CHF/mois
 */
export function calculateRemoteAccessPrice(cameraLines: ProductLineData[]): number {
  const CAMERA_DEVICE_IDS = new Set<number>([
    23, // Bullet Mini
    24, // Dôme Mini
    26, // Dôme Antivandale
    46, // Dôme Night
    47, // Bullet XL Varifocale
    53, // Dôme XL Varifocale
    31, // Bullet Zoom x23 PTZ
    32, // Mini Solar 4G + P. Solaire
    33, // Solar 4G XL
    28  // Solar 4G XL PTZ
  ]);

  const hasModem = cameraLines.some(
    (line) =>
      !line.offered &&
      (line.quantity || 0) > 0 &&
      line.product?.name === 'Modem 4G'
  );

  let fourGCameraCount = 0;
  let classicCameraCount = 0;

  cameraLines.forEach((line) => {
    if (line.offered || !line.product) return;
    if ((line.quantity || 0) <= 0) return;
    if (typeof line.product.id !== 'number') return;

    // Only count actual camera devices, not NVR/accessories/modem
    if (!CAMERA_DEVICE_IDS.has(line.product.id)) return;

    const is4G = line.product.name.includes('4G');
    if (is4G) {
      fourGCameraCount += line.quantity;
    } else {
      classicCameraCount += line.quantity;
    }
  });

  const billableCameras = fourGCameraCount + (hasModem ? classicCameraCount : 0);
  return billableCameras * 20;
}

