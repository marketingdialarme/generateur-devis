/**
 * Product Collector Utility
 * 
 * Collects product information from the quote state for PDF assembly.
 * This replaces the collectProductsForAssembly function from script.js
 */

import { ProductLineData } from '@/components/ProductLine';

/**
 * Collect product names for backend assembly
 * 
 * Filters out:
 * - Products with no quantity
 * - Products marked as "offered"
 * - Empty or invalid product names
 * 
 * Cleans product names by removing price information
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
    
    // Only add if: has product, has name, has quantity, and not offered
    if (
      product &&
      product.name &&
      product.name.trim() !== '' &&
      product.name !== 'Sélectionner un produit' &&
      quantity > 0 &&
      !offered
    ) {
      // Clean product name: remove price (everything after " - " if it contains "CHF")
      let cleanName = product.name.trim();
      
      if (cleanName.includes(' CHF')) {
        cleanName = cleanName.split(' - ').slice(0, -1).join(' - ');
      }
      
      products.push(cleanName);
      console.log(`    ✅ Added: ${cleanName}${cleanName !== product.name ? ' (cleaned from: ' + product.name + ')' : ''}`);
    } else {
      console.log(`    ⏭️ Skipped (${offered ? 'offered' : 'no quantity or invalid name'})`);
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
  
  console.log(`✅ Total products collected: ${allProducts.length}`);
  return allProducts;
}

