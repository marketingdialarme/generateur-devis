/**
 * ============================================================================
 * QUOTE GENERATOR LOGIC - Migrated from script.js
 * ============================================================================
 * 
 * Core business logic for the Dialarme quote generator
 * Separated from UI components for better maintainability
 */

// ============================================
// CATALOGUES - Product Data
// ============================================

export const COMMERCIALS_LIST = [
  "Arnaud Bloch",
  "Benali Kodad",
  "Bryan Debrosse",
  "Cédric Boldron",
  "Emin Comert",
  "Gérald Clausen",
  "Heythem Ziaya",
  "Iyed Baccouche",
  "Matys Goiot",
  "Mohamed Tartik",
  "Nassim Jaza",
  "Nora Sassi",
  "Rodolphe De Vito",
  "Samir Ouhameni",
  "Thilan Curt",
  "Thomas Garcia",
  "Wassim Tahiri"
];

export interface AlarmProduct {
  id: number;
  name: string;
  price?: number;
  priceTitane?: number;
  priceJablotron?: number;
  monthlyTitane?: number;
  monthlyJablotron?: number;
  requiresJablotron?: boolean;
  isCustom?: boolean;
}

export interface CameraProduct {
  id: number;
  name: string;
  price: number;
  monthly48?: number;
  monthly36?: number;
  monthly24?: number;
  isCustom?: boolean;
}

export const CATALOG_ALARM_PRODUCTS: AlarmProduct[] = [
  { id: 5, name: "Centrale Jablotron", price: 990.00 },
  { id: 6, name: "Centrale Titane", price: 690.00 },
  { id: 99, name: "Autre", price: 0.00, isCustom: true },
  { id: 3, name: "Badge x 4", priceTitane: 100.00, priceJablotron: 200.00, monthlyTitane: 3, monthlyJablotron: 5 },
  { id: 2, name: "Barrière extérieure 2x12 mètres (radio)", priceTitane: 890.00, priceJablotron: 890.00, monthlyTitane: 22, monthlyJablotron: 22 },
  { id: 1, name: "Bouton panique/Montre d'urgence (radio)", priceTitane: 190.00, priceJablotron: 190.00, monthlyTitane: 5, monthlyJablotron: 5 },
  { id: 7, name: "Clavier (radio)", priceTitane: 390.00, priceJablotron: 390.00, monthlyTitane: 10, monthlyJablotron: 12 },
  { id: 12, name: "Détecteur de bris de verre (radio)", priceTitane: 290.00, priceJablotron: 290.00, monthlyTitane: 7, monthlyJablotron: 7 },
  { id: 11, name: "Détecteur de choc (radio)", priceTitane: 290.00, priceJablotron: 290.00, monthlyTitane: 7, monthlyJablotron: 7 },
  { id: 13, name: "Détecteur de fumée (radio)", priceTitane: 190.00, priceJablotron: 290.00, monthlyTitane: 5, monthlyJablotron: 7 },
  { id: 14, name: "Détecteur de mouvement extérieur (caméra)", priceTitane: 690.00, priceJablotron: 690.00, monthlyTitane: 17, monthlyJablotron: 17 },
  { id: 10, name: "Détecteur d'ouverture (radio)", priceTitane: 190.00, priceJablotron: 240.00, monthlyTitane: 5, monthlyJablotron: 6 },
  { id: 8, name: "Détecteur volumétrique (radio)", priceTitane: 240.00, priceJablotron: 290.00, monthlyTitane: 6, monthlyJablotron: 7 },
  { id: 9, name: "Détecteur volumétrique caméra (radio)", priceTitane: 290.00, priceJablotron: 450.00, monthlyTitane: 7, monthlyJablotron: 11 },
  { id: 22, name: "Lecteur de badge intérieur (filaire/radio)", priceJablotron: 490.00, requiresJablotron: true, monthlyJablotron: 12 },
  { id: 18, name: "Sirène déportée petite (radio)", priceTitane: 390.00, priceJablotron: 390.00, monthlyTitane: 10, monthlyJablotron: 10 },
  { id: 21, name: "Sirène déportée grande (radio)", priceJablotron: 490.00, requiresJablotron: true, monthlyJablotron: 12 },
  { id: 17, name: "Sonde inondation (radio)", priceTitane: 290.00, priceJablotron: 390.00, monthlyTitane: 7, monthlyJablotron: 10 },
  { id: 19, name: "Télécommande (radio)", priceTitane: 190.00, priceJablotron: 240.00, monthlyTitane: 5, monthlyJablotron: 6 }
];

export const CATALOG_CAMERA_MATERIAL: CameraProduct[] = [
  { id: 99, name: "Autre", price: 0.00, isCustom: true },
  { id: 23, name: "Bullet Mini", price: 390.00, monthly48: 10, monthly36: 13, monthly24: 18 },
  { id: 24, name: "Bullet XL Varifocale Night", price: 640.00, monthly48: 16, monthly36: 21, monthly24: 30 },
  { id: 26, name: "Bullet Zoom x23", price: 990.00, monthly48: 25, monthly36: 32, monthly24: 46 },
  { id: 46, name: "Reo 4G + P.Solaire", price: 490.00, monthly48: 13, monthly36: 16, monthly24: 23 },
  { id: 47, name: "Solar 4G XL + P.solaire", price: 890.00, monthly48: 22, monthly36: 28, monthly24: 41 },
  { id: 53, name: "Solar 4G XL PTG + P.solaire", price: 890.00, monthly48: 22, monthly36: 28, monthly24: 41 },
  { id: 31, name: "Dôme Antivandale", price: 390.00, monthly48: 10, monthly36: 13, monthly24: 18 },
  { id: 32, name: "Dôme Mini Antivandale", price: 390.00, monthly48: 10, monthly36: 13, monthly24: 18 },
  { id: 33, name: "Dôme Night", price: 540.00, monthly48: 14, monthly36: 18, monthly24: 25 },
  { id: 28, name: "Coffret NVR 4P", price: 240.00, monthly48: 6, monthly36: 8, monthly24: 11 },
  { id: 29, name: "Coffret NVR 8P", price: 360.00, monthly48: 9, monthly36: 12, monthly24: 17 },
  { id: 49, name: "Switch POE", price: 270.00, monthly48: 7, monthly36: 9, monthly24: 13 },
  { id: 30, name: "Disque dur 4 To", price: 270.00, monthly48: 7, monthly36: 9, monthly24: 13 },
  { id: 38, name: "Modem 4G", price: 290.00, monthly48: 8, monthly36: 10, monthly24: 14 },
  { id: 39, name: "Moniteur Vidéo 22\"", price: 190.00, monthly48: 5, monthly36: 7, monthly24: 9 },
  { id: 40, name: "Moniteur Vidéo 28\" 4K", price: 460.00, monthly48: 12, monthly36: 15, monthly24: 22 },
  { id: 41, name: "Moniteur Vidéo 32\"", price: 490.00, monthly48: 13, monthly36: 16, monthly24: 23 },
  { id: 50, name: "NVR 1-4 Caméras (1 mois d'enregistrement)", price: 990.00, monthly48: 25, monthly36: 32, monthly24: 46 },
  { id: 51, name: "NVR 4-8 Caméras (1 mois d'enregistrement)", price: 1390.00, monthly48: 35, monthly36: 45, monthly24: 64 },
  { id: 52, name: "NVR 8-16 Caméras (1 mois d'enregistrement)", price: 1690.00, monthly48: 43, monthly36: 54, monthly24: 78 },
  { id: 42, name: "Onduleur 1000 - 60min", price: 360.00, monthly48: 9, monthly36: 12, monthly24: 17 },
  { id: 43, name: "Onduleur 1500 - 90min", price: 600.00, monthly48: 15, monthly36: 20, monthly24: 28 },
  { id: 44, name: "Onduleur 2200 - 120min", price: 830.00, monthly48: 21, monthly36: 27, monthly24: 39 },
  { id: 45, name: "Onduleur 700 - 30min", price: 240.00, monthly48: 6, monthly36: 8, monthly24: 11 },
  { id: 37, name: "HDMI Ext.", price: 190.00, monthly48: 5, monthly36: 7, monthly24: 9 },
  { id: 48, name: "Support Mural Articulé", price: 100.00, monthly48: 3, monthly36: 4, monthly24: 5 },
  { id: 27, name: "Caméra de comptage", price: 860.00, monthly48: 22, monthly36: 28, monthly24: 40 }
];

// ============================================
// PRICING CONFIGURATION
// ============================================

export const TVA_RATE = 0.081; // 8.1%

export const INSTALLATION_PRICES: Record<number, number> = {
  1: 690,   // 1/2 journée
  2: 1290,  // 1 jour
  3: 1980,  // 1.5 jours
  4: 2580,  // 2 jours
  5: 3270,  // 2.5 jours
  6: 3870   // 3 jours
};

export const INSTALLATION_MONTHLY_PRICES: Record<number, Record<number, number>> = {
  1: { 24: 32, 36: 23, 48: 18 },
  2: { 24: 60, 36: 42, 48: 33 },
  3: { 24: 91, 36: 64, 48: 50 },
  4: { 24: 119, 36: 83, 48: 65 },
  5: { 24: 151, 36: 106, 48: 83 },
  6: { 24: 179, 36: 125, 48: 98 }
};

export const HALF_DAY_PRICE = 690;
export const HALF_DAY_MONTHLY_24 = 32;
export const HALF_DAY_MONTHLY_36 = 23;
export const HALF_DAY_MONTHLY_48 = 18;
export const FULL_DAY_MONTHLY_24 = 60;
export const FULL_DAY_MONTHLY_36 = 42;
export const FULL_DAY_MONTHLY_48 = 33;

export const UNINSTALL_PRICE = 290.00;

export const ADMIN_FEES = {
  simCard: 50.00,
  processingFee: 190.00
};

export const CAMERA_INSTALL_BASE_PRICE = 690.00;
export const REMOTE_ACCESS_PRICE = 20.00;
export const TEST_CYCLIQUE_DEFAULT_PRICE = 0.00;

export const SURVEILLANCE_PRICES_SALE = {
  titane: {
    autosurveillance: 59,
    autosurveillancePro: 79,
    telesurveillance: 129,
    telesurveillancePro: 159
  },
  jablotron: {
    telesurveillance: 139,
    telesurveillancePro: 169
  },
  default: {
    autosurveillance: 59,
    autosurveillancePro: 79,
    telesurveillance: 129,
    telesurveillancePro: 159
  }
};

export const SURVEILLANCE_PRICES_RENTAL = {
  autosurveillance: 100,
  autosurveillancePro: 150,
  telesurveillance: 200,
  telesurveillancePro: 250
};

// ============================================
// KIT CONFIGURATION
// ============================================

export interface KitConfig {
  name: string;
  icon: string;
  products: Array<{ id: number; quantity: number }>;
}

export interface CentralConfig {
  id: number;
  name: string;
  price: number;
  description: string;
  kits: Record<string, KitConfig>;
}

export const CENTRALS_CONFIG: Record<string, CentralConfig> = {
  titane: {
    id: 6,
    name: "Centrale Titane",
    price: 690.00,
    description: "Système complet de sécurité",
    kits: {
      kit1: {
        name: "Kit 1",
        icon: "📦",
        products: [
          { id: 8, quantity: 2 },
          { id: 10, quantity: 1 },
          { id: 7, quantity: 1 },
          { id: 18, quantity: 1 }
        ]
      },
      kit2: {
        name: "Kit 2",
        icon: "📦",
        products: [
          { id: 8, quantity: 1 },
          { id: 10, quantity: 3 },
          { id: 7, quantity: 1 },
          { id: 18, quantity: 1 }
        ]
      }
    }
  },
  jablotron: {
    id: 5,
    name: "Centrale Jablotron",
    price: 990.00,
    description: "Système premium avancé",
    kits: {
      kit1: {
        name: "Kit 1",
        icon: "📦",
        products: [
          { id: 8, quantity: 2 },
          { id: 10, quantity: 1 },
          { id: 7, quantity: 1 },
          { id: 18, quantity: 1 }
        ]
      },
      kit2: {
        name: "Kit 2",
        icon: "📦",
        products: [
          { id: 8, quantity: 1 },
          { id: 10, quantity: 3 },
          { id: 7, quantity: 1 },
          { id: 18, quantity: 1 }
        ]
      }
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function roundToFiveCents(amount: number): number {
  return Math.ceil(amount * 20) / 20;
}

export function calculateInstallationPrice(qty: number): number {
  if (qty > 6) {
    const fullDays = Math.floor(qty / 2);
    const halfDay = qty % 2;
    return (fullDays * HALF_DAY_PRICE * 2) + (halfDay * HALF_DAY_PRICE);
  }
  
  return INSTALLATION_PRICES[qty] || HALF_DAY_PRICE;
}

export function getInstallationMonthlyPrice(qty: number, months: number): number {
  if (qty > 6) {
    const fullDays = Math.floor(qty / 2);
    const halfDay = qty % 2;
    
    if (months === 24) {
      return (fullDays * FULL_DAY_MONTHLY_24) + (halfDay * HALF_DAY_MONTHLY_24);
    } else if (months === 36) {
      return (fullDays * FULL_DAY_MONTHLY_36) + (halfDay * HALF_DAY_MONTHLY_36);
    } else if (months === 48) {
      return (fullDays * FULL_DAY_MONTHLY_48) + (halfDay * HALF_DAY_MONTHLY_48);
    }
  }
  
  if (INSTALLATION_MONTHLY_PRICES[qty] && INSTALLATION_MONTHLY_PRICES[qty][months]) {
    return INSTALLATION_MONTHLY_PRICES[qty][months];
  }
  
  return 0;
}

export function getProductPrice(product: AlarmProduct | CameraProduct, selectedCentral?: string | null): number {
  if ('priceTitane' in product && selectedCentral === 'titane' && product.priceTitane !== undefined) {
    return product.priceTitane;
  }
  
  if ('priceJablotron' in product && selectedCentral === 'jablotron' && product.priceJablotron !== undefined) {
    return product.priceJablotron;
  }
  
  return product.price || 0;
}

export function getFilteredProducts(
  products: AlarmProduct[],
  selectedCentral: string | null,
  isInstallationSection: boolean
): AlarmProduct[] {
  if (!selectedCentral) {
    if (isInstallationSection) {
      return products.filter(p => p.id !== 5 && p.id !== 6 && !p.requiresJablotron);
    }
    return products.filter(p => !p.requiresJablotron);
  }
  
  if (selectedCentral === 'jablotron') {
    if (isInstallationSection) {
      return products.filter(p => p.id !== 5 && p.id !== 6);
    }
    return products;
  }
  
  if (isInstallationSection) {
    return products.filter(p => p.id !== 5 && p.id !== 6 && !p.requiresJablotron);
  }
  return products.filter(p => !p.requiresJablotron);
}

