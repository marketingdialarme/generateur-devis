/**
 * Product Collector Utility
 * 
 * Collects product information from the quote state for PDF assembly.
 * This replaces the collectProductsForAssembly function from script.js
 */

import { ProductLineData } from '@/components/ProductLine';
import { getSheetNameForProduct, PRODUCTS_WITHOUT_INDIVIDUAL_SHEETS } from './product-sheet-mapping';
import { config } from './config';

/**
 * Collect product names for backend assembly
 * 
 * Filters out:
 * - Products with no quantity
 * - Empty or invalid product names
 * 
 * Cleans product names by removing price information
 * 
 * Note: Includes both offered and non-offered products so their fiches appear in PDF
 * 
 * @param productLines - Array of product line data
 * @returns Array of clean product names
 */
export function collectProductsForAssembly(productLines: ProductLineData[]): string[] {
  const products: string[] = [];
  
  console.log('🔍 Collecting products for assembly:', productLines.length, 'lines');
  
  productLines.forEach((line, index) => {
    const { product, quantity, offered } = line;
    
    console.log(`  Line ${index}:`, {
      name: product?.name || 'N/A',
      quantity,
      offered
    });
    
    // Only add if: has product, has name, has quantity
    // Include both offered and non-offered products so fiches appear
    if (
      product &&
      product.name &&
      product.name.trim() !== '' &&
      product.name !== 'Sélectionner un produit' &&
      quantity > 0
    ) {
      // Clean product name: remove price (everything after " - " if it contains "CHF")
      let cleanName = product.name.trim();
      
      if (cleanName.includes(' CHF')) {
        cleanName = cleanName.split(' - ').slice(0, -1).join(' - ');
      }
      
      products.push(cleanName);
      console.log(`    ✅ Added: ${cleanName}${cleanName !== product.name ? ' (cleaned from: ' + product.name + ')' : ''}${offered ? ' [OFFERT]' : ''}`);
    } else {
      console.log(`    ⏭️ Skipped (no quantity or invalid name)`);
    }
  });
  
  console.log('🔍 Products collected:', products);
  return products;
}

/**
 * Collect all products from all sections
 * 
 * @param sections - Object containing arrays of product lines for each section
 * @returns Array of all clean product names
 */
export function collectAllProducts(sections: Record<string, ProductLineData[]>): string[] {
  const allProducts: string[] = [];
  
  Object.entries(sections).forEach(([sectionName, lines]) => {
    console.log(`📦 Collecting from section: ${sectionName}`);
    const sectionProducts = collectProductsForAssembly(lines);
    allProducts.push(...sectionProducts);
  });
  
  console.log(`✅ Total products collected (before dedup): ${allProducts.length}`);
  console.log('📝 Products:', allProducts);

  // Prefer raw product names when a direct Drive ID exists in cameraSheetIds
  // so the assembly fetches the per-product fiche directly via /api/drive-fetch-product.
  // This bypasses the legacy "shared sheet" name mapping (e.g. "Bullet Mini et Dôme Mini"),
  // which is incorrect now that the client ships one fiche per product.
  //
  // For products NOT in cameraSheetIds (NVR, accessories, modem, etc.) we keep the legacy
  // mapped sheet name so the folder-name search still works.
  const directIds = config.google.drive.baseDocuments.cameraSheetIds || {};
  const seen = new Set<string>();
  const result: string[] = [];

  for (const productName of allProducts) {
    if (PRODUCTS_WITHOUT_INDIVIDUAL_SHEETS.has(productName)) continue;

    // Has a direct ID? send raw product name (route resolves via cameraSheetIds map)
    if (directIds[productName]) {
      if (!seen.has(productName)) {
        seen.add(productName);
        result.push(productName);
      }
      continue;
    }

    // Otherwise fall back to legacy sheet-name mapping (dedupes shared sheets)
    const sheetName = getSheetNameForProduct(productName);
    if (sheetName && !seen.has(sheetName)) {
      seen.add(sheetName);
      result.push(sheetName);
    }
  }

  console.log(`✅ Names to fetch (after direct-ID resolution & dedup): ${result.length}`);
  console.log('📑 Names:', result);

  return result;
}

