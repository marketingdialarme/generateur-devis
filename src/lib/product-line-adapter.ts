/**
 * Product Line Data Adapter
 * 
 * Converts between ProductLineData (component format) and calculation format
 * Provides utility functions for working with product lines
 */

import { ProductLineData, Product } from '@/components/ProductLine';

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
      if (line.product.isCustom && line.customPrice !== undefined) {
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
  
  if (line.product.isCustom && line.customPrice !== undefined) {
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
 * Calculate camera installation price
 * Formula: 690 + (number of cameras × 140)
 */
export function calculateCameraInstallation(cameraLines: ProductLineData[]): number {
  const cameraCount = cameraLines.reduce((sum, line) => {
    return sum + (line.product && !line.offered ? line.quantity : 0);
  }, 0);
  
  return 690 + (cameraCount * 140);
}

