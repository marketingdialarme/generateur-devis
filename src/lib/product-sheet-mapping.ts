/**
 * ============================================================================
 * PRODUCT SHEET MAPPING
 * ============================================================================
 * 
 * Maps product names to their technical sheet names for accurate matching.
 * Also defines which products should share the same technical sheet.
 */

/**
 * Map product names to the exact technical sheet filename (without .pdf and - compressed)
 * This helps with products that have different names but specific sheets
 * 
 * IMPORTANT: Keys must match EXACTLY the product names in CATALOG_CAMERA_MATERIAL
 * Values should match the EXACT PDF filename (without .pdf and - compressed)
 * 
 * Based on actual Google Drive filenames from screenshot:
 * - Bullet Mini et Dôme Mini.pdf (shared sheet)
 * - DOME XL VARIFOCALE - compressed.pdf (separate sheet)
 * - BULLET XL VARIFOCALE - compressed.pdf (separate sheet - NOT shared!)
 * - DOME NIGHT - compressed.pdf (separate sheet)
 * - DÔME ANTIVANDALE - compressed.pdf (separate sheet - NOT shared!)
 * - SOLAR 4G XL - compressed.pdf
 * - Solar 4G XL PTZ.pdf
 * - Mini Solar 4G + P. Solaire - compressed.pdf
 * - BULLET ZOOM X23 PTZ- compressed.pdf
 * - Interphone.pdf
 * - NVR 1-4 Cameras - compressed.pdf
 * - NVR 4-8 Cameras - compressed.pdf
 * - NVR 8-16 Cameras - compressed.pdf
 * - MONITEUR 22_DISQUE DUR_SUPPORT MURAL_HDMI.pdf (combined sheet)
 */
export const PRODUCT_SHEET_NAME_MAP: Record<string, string> = {
  // === CAMERA PRODUCTS ===
  
  // Mini cameras - SHARED sheet ("Bullet Mini et Dôme Mini")
  'Bullet Mini': 'Bullet Mini et Dôme Mini',
  'Dôme Mini': 'Bullet Mini et Dôme Mini',
  
  // Night camera - separate sheet
  'Dôme Night': 'DOME NIGHT',
  
  // Antivandale camera - separate sheet (NOT shared with Night!)
  'Dôme Antivandale': 'DÔME ANTIVANDALE',
  
  // XL Varifocale cameras - SEPARATE sheets (NOT shared!)
  'Bullet XL Varifocale': 'BULLET XL VARIFOCALE',
  'Dôme XL Varifocale': 'DOME XL VARIFOCALE',
  
  // PTZ camera
  'Bullet Zoom x23 PTZ': 'BULLET ZOOM X23 PTZ',
  
  // Solar cameras - CRITICAL: Very similar names, exact mapping required
  'Mini Solar 4G + P. Solaire': 'Mini Solar 4G + P. Solaire',
  'Solar 4G XL': 'SOLAR 4G XL',
  'Solar 4G XL PTZ': 'Solar 4G XL PTZ',
  
  // Interphone
  'Interphone': 'Interphone',
  // Note: 'Ecran complémentaire - interphone' has no technical sheet in Drive
  
  // === NVR PRODUCTS - Individual sheets ===
  'NVR 1-4 Caméras (1 mois d\'enregistrement)': 'NVR 1-4 Cameras',
  'NVR 4-8 Caméras (1 mois d\'enregistrement)': 'NVR 4-8 Cameras',
  'NVR 8-16 Caméras (1 mois d\'enregistrement)': 'NVR 8-16 Cameras',
  
  // === ACCESSORIES - Combined in one sheet ===
  // These are in: "MONITEUR 22_DISQUE DUR_SUPPORT MURAL_HDMI.pdf"
  'Moniteur Vidéo 22"': 'MONITEUR 22_DISQUE DUR_SUPPORT MURAL_HDMI',
  'Disque dur 4 To': 'MONITEUR 22_DISQUE DUR_SUPPORT MURAL_HDMI',
  'Support Mural Articulé': 'MONITEUR 22_DISQUE DUR_SUPPORT MURAL_HDMI',
  'HDMI Ext.': 'MONITEUR 22_DISQUE DUR_SUPPORT MURAL_HDMI',
  
  // Modem has its own sheet
  'Modem 4G': 'Modem 4G',
};

/**
 * Products that should NOT get individual technical sheets
 * They are grouped in: "ONDULEUR - Coffret NVR 4P - Coffret NVR 8P - SWITCH POE compressed.pdf"
 * Or don't have sheets at all
 */
export const PRODUCTS_WITHOUT_INDIVIDUAL_SHEETS = new Set([
  'Switch POE',
  'Coffret NVR 4P',
  'Coffret NVR 8P',
  'Onduleur 1000 - 60min',
  'Mat 3 mètre',  // No sheet visible in Drive
  'Ecran complémentaire - interphone',  // No sheet visible in Drive
  'Autre',  // Custom product, no sheet
  // Note: Moniteur, Disque dur, Support Mural, HDMI now mapped to combined sheet above
  // Note: Modem 4G has its own individual sheet
]);

/**
 * Get the technical sheet name to search for based on product name
 * @param productName - The product name from the catalog
 * @returns The sheet name to search for, or the original product name if no mapping exists
 */
export function getSheetNameForProduct(productName: string): string {
  // Check if product should not have individual sheet
  if (PRODUCTS_WITHOUT_INDIVIDUAL_SHEETS.has(productName)) {
    return ''; // Return empty to skip individual sheet
  }
  
  // Check mapping
  if (PRODUCT_SHEET_NAME_MAP[productName]) {
    return PRODUCT_SHEET_NAME_MAP[productName];
  }
  
  // Return original name
  return productName;
}

/**
 * Deduplicate sheet names - products with same sheet name should only appear once
 * @param productNames - Array of product names
 * @returns Array of unique sheet names to fetch
 */
export function getUniqueSheetNames(productNames: string[]): string[] {
  const uniqueSheets = new Set<string>();
  
  for (const productName of productNames) {
    const sheetName = getSheetNameForProduct(productName);
    
    // Only add non-empty sheet names
    if (sheetName && sheetName.trim() !== '') {
      uniqueSheets.add(sheetName);
    }
  }
  
  return Array.from(uniqueSheets);
}
