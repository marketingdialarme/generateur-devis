/**
 * Product Collector Utility
 * 
 * Collects product information from the quote state for PDF assembly.
 * This replaces the collectProductsForAssembly function from script.js
 */

import { ProductLineData } from '@/components/ProductLine';
import { getSheetNameForProduct, PRODUCTS_WITHOUT_INDIVIDUAL_SHEETS } from './product-sheet-mapping';
import { config } from './config';

/** One product line to fetch a fiche for. ficheId, when present, comes from
 * the Sheet's "Fiche" column and is preferred over any name-based lookup. */
export interface ProductFetchRef {
  name: string;
  ficheId?: string;
}

/**
 * Collect product names (and fiche IDs, where the Sheet provides one) for
 * backend assembly
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
 * @returns Array of {name, ficheId?} refs
 */
export function collectProductsForAssembly(productLines: ProductLineData[]): ProductFetchRef[] {
  const products: ProductFetchRef[] = [];
  
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
      
      const ficheId = product.fiche;
      products.push({ name: cleanName, ficheId });
      console.log(`    ✅ Added: ${cleanName}${cleanName !== product.name ? ' (cleaned from: ' + product.name + ')' : ''}${offered ? ' [OFFERT]' : ''}${ficheId ? ' [fiche: ' + ficheId + ']' : ''}`);
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
 * @returns Array of fetch refs, deduplicated
 */
export function collectAllProducts(sections: Record<string, ProductLineData[]>): ProductFetchRef[] {
  const allProducts: ProductFetchRef[] = [];
  
  Object.entries(sections).forEach(([sectionName, lines]) => {
    console.log(`📦 Collecting from section: ${sectionName}`);
    const sectionProducts = collectProductsForAssembly(lines);
    allProducts.push(...sectionProducts);
  });
  
  console.log(`✅ Total products collected (before dedup): ${allProducts.length}`);

  // Prefer the Sheet's "Fiche" column (a Drive file ID) when the product has
  // one -- most reliable, and the right key for deduping: two differently-
  // named products (e.g. two camera accessories) can share the exact same
  // fiche, and must only be fetched/inserted once. Falls back to the
  // legacy direct-ID map (cameraSheetIds) and then the shared-sheet name
  // mapping for anything that doesn't have a Sheet-provided fiche ID yet.
  const directIds = config.google.drive.baseDocuments.cameraSheetIds || {};
  const seen = new Set<string>();
  const result: ProductFetchRef[] = [];

  for (const { name: productName, ficheId } of allProducts) {
    if (PRODUCTS_WITHOUT_INDIVIDUAL_SHEETS.has(productName)) continue;

    if (ficheId) {
      const key = `fiche:${ficheId}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ name: productName, ficheId });
      }
      continue;
    }

    // Has a direct ID? send raw product name (route resolves via cameraSheetIds map)
    if (directIds[productName]) {
      if (!seen.has(productName)) {
        seen.add(productName);
        result.push({ name: productName });
      }
      continue;
    }

    // Otherwise fall back to legacy sheet-name mapping (dedupes shared sheets)
    const sheetName = getSheetNameForProduct(productName);
    if (sheetName && !seen.has(sheetName)) {
      seen.add(sheetName);
      result.push({ name: sheetName });
    }
  }

  console.log(`✅ Refs to fetch (after dedup): ${result.length}`);
  console.log('📑 Refs:', result);

  return result;
}

