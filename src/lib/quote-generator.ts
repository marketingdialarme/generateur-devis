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
  monthly12?: number;
  isCustom?: boolean;
}

export const CATALOG_ALARM_PRODUCTS: AlarmProduct[] = [
  { id: 5, name: "Centrale Jablotron", price: 990.00 },
  { id: 6, name: "Centrale Titane", price: 690.00 },
  { id: 99, name: "Autre", price: 0.00, isCustom: true },
  { id: 3, name: "Badge x 4", priceTitane: 190.00, priceJablotron: 200.00, monthlyTitane: 3, monthlyJablotron: 5 },
  { id: 2, name: "Barrière extérieur 2x12 m", priceTitane: 890.00, priceJablotron: 890.00, monthlyTitane: 22, monthlyJablotron: 22 },
  { id: 1, name: "Bouton panique", priceTitane: 190.00, priceJablotron: 190.00, monthlyTitane: 5, monthlyJablotron: 5 },
  { id: 7, name: "Clavier", priceTitane: 390.00, priceJablotron: 490.00, monthlyTitane: 10, monthlyJablotron: 12 },
  { id: 12, name: "Détecteur de bris de verre", priceTitane: 290.00, priceJablotron: 290.00, monthlyTitane: 7, monthlyJablotron: 7 },
  { id: 11, name: "Détecteur de choc", priceTitane: 290.00, priceJablotron: 290.00, monthlyTitane: 7, monthlyJablotron: 7 },
  { id: 13, name: "Détecteur de fumée", priceTitane: 190.00, priceJablotron: 290.00, monthlyTitane: 5, monthlyJablotron: 7 },
  { id: 14, name: "Détecteur de mouvement extérieur photo", priceTitane: 690.00, priceJablotron: 690.00, monthlyTitane: 17, monthlyJablotron: 17 },
  { id: 10, name: "Détecteur ouverture", priceTitane: 190.00, priceJablotron: 240.00, monthlyTitane: 5, monthlyJablotron: 6 },
  { id: 15, name: "Détecteur rideau intérieur", priceTitane: 290.00, monthlyTitane: 7 },
  { id: 8, name: "Détecteur volumétrique", priceTitane: 240.00, priceJablotron: 290.00, monthlyTitane: 6, monthlyJablotron: 7 },
  { id: 9, name: "Détecteur volumétrique caméra", priceTitane: 290.00, priceJablotron: 450.00, monthlyTitane: 7, monthlyJablotron: 11 },
  { id: 23, name: "Interphonie", priceTitane: 490.00, monthlyTitane: 12 },
  { id: 22, name: "Lecteur de badge intérieur", priceJablotron: 490.00, requiresJablotron: true, monthlyJablotron: 12 },
  { id: 24, name: "Répéteur radio", priceJablotron: 490.00, requiresJablotron: true, monthlyJablotron: 12 },
  { id: 18, name: "Sirène déportée", priceTitane: 390.00, priceJablotron: 390.00, monthlyTitane: 10, monthlyJablotron: 10 },
  { id: 21, name: "Sirène déportée grande", priceJablotron: 490.00, requiresJablotron: true, monthlyJablotron: 12 },
  { id: 17, name: "Sonde inondation", priceTitane: 290.00, priceJablotron: 390.00, monthlyTitane: 7, monthlyJablotron: 10 },
  { id: 19, name: "Télécommande", priceTitane: 190.00, priceJablotron: 240.00, monthlyTitane: 5, monthlyJablotron: 6 },
  
  // Installation options
  { id: 101, name: "Installation 1/2 journée", price: 690.00 },
  { id: 102, name: "Installation 1 journée", price: 1290.00 }
];

export const CATALOG_CAMERA_MATERIAL: CameraProduct[] = [
  { id: 99, name: "Autre", price: 0.00, isCustom: true },
  { id: 23, name: "Bullet Mini", price: 390.00, monthly48: 10, monthly36: 13, monthly24: 18, monthly12: 35 },
  { id: 24, name: "Dôme Mini", price: 390.00, monthly48: 10, monthly36: 13, monthly24: 18, monthly12: 35 },
  { id: 26, name: "Dôme Antivandale", price: 450.00, monthly48: 12, monthly36: 16, monthly24: 22, monthly12: 39 },
  { id: 46, name: "Dôme Night", price: 540.00, monthly48: 14, monthly36: 18, monthly24: 25, monthly12: 48 },
  { id: 47, name: "Bullet XL Varifocale", price: 690.00, monthly48: 18, monthly36: 22, monthly24: 32, monthly12: 61  },
  { id: 53, name: "Dôme XL Varifocale", price: 690.00, monthly48: 18, monthly36: 22, monthly24: 32, monthly12: 61  },
  { id: 31, name: "Bullet Zoom x23 PTZ", price: 990.00, monthly48: 25, monthly36: 32, monthly24: 46, monthly12: 87  },
  { id: 32, name: "Mini Solar 4G + P. Solaire", price: 490.00, monthly48: 13, monthly36: 16, monthly24: 23, monthly12: 43  },
  { id: 33, name: "Solar 4G XL", price: 890.00, monthly48: 23, monthly36: 28, monthly24: 41, monthly12: 78  },
  { id: 28, name: "Solar 4G XL PTZ", price: 1190.00, monthly48: 30, monthly36: 39, monthly24: 55, monthly12: 105  },
  { id: 50, name: "NVR 1-4 Caméras (1 mois d'enregistrement)", price: 990.00, monthly48: 25, monthly36: 32, monthly24: 46, monthly12: 87  },
  { id: 51, name: "NVR 4-8 Caméras (1 mois d'enregistrement)", price: 1390.00, monthly48: 35, monthly36: 45, monthly24: 64, monthly12: 122  },
  { id: 52, name: "NVR 8-16 Caméras (1 mois d'enregistrement)", price: 1690.00, monthly48: 43, monthly36: 54, monthly24: 78, monthly12: 148  },
  { id: 30, name: "Disque dur 4 To", price: 270.00, monthly48: 7, monthly36: 9, monthly24: 13, monthly12: 24  },
  { id: 38, name: "Modem 4G", price: 290.00, monthly48: 8, monthly36: 10, monthly24: 14, monthly12: 26  },
  { id: 27, name: "Switch POE", price: 270.00, monthly48: 7, monthly36: 9, monthly24: 13, monthly12: 24  },
  { id: 37, name: "HDMI Ext.", price: 190.00, monthly48: 5, monthly36: 7, monthly24: 9, monthly12: 17  },
  { id: 39, name: "Moniteur Vidéo 22\"", price: 270.00, monthly48: 7, monthly36: 9, monthly24: 13, monthly12: 24  },
  { id: 48, name: "Support Mural Articulé", price: 100.00, monthly48: 3, monthly36: 4, monthly24: 5, monthly12: 9  },
  { id: 42, name: "Onduleur 1000 - 60min", price: 360.00, monthly48: 9, monthly36: 12, monthly24: 17, monthly12: 32  },
  { id: 40, name: "Mat 3 mètre", price: 490.00, monthly48: 13, monthly36: 16, monthly24: 23, monthly12: 43  },
  { id: 43, name: "Coffret NVR 4P", price: 240.00, monthly48: 6, monthly36: 8, monthly24: 11, monthly12: 21  },
  { id: 44, name: "Coffret NVR 8P", price: 360.00, monthly48: 9, monthly36: 12, monthly24: 17, monthly12: 32  },
];

export interface FogProduct {
  id: number;
  name: string;
  price: number;
}

export const CATALOG_FOG_PRODUCTS: FogProduct[] = [
  { id: 200, name: "Générateur de brouillard", price: 2990 },
  { id: 201, name: "Clavier de porte", price: 390 },
  { id: 202, name: "Détecteur volumétrique", price: 240 },
  { id: 203, name: "Détecteur d'ouverture", price: 190 },
  { id: 204, name: "Télécommande", price: 190 },
  { id: 205, name: "Support mural fixe", price: 290 },
  { id: 206, name: "Support mural articulé", price: 390 },
  { id: 207, name: "Remplissage cartouche", price: 390 },
  { id: 208, name: "Cartouche supplémentaire HY3", price: 990 },
];

export interface VisiophoProduct {
  id: number;
  name: string;
  price: number;
}

export const CATALOG_VISIOPHONE_PRODUCTS: VisiophoProduct[] = [
  { id: 300, name: "Interphone", price: 990 },
  { id: 301, name: "Écran complémentaire", price: 490 },
];

/**
 * XTO Catalog - MONTHLY HT prices (rental model)
 * As specified in Milestone 1:
 * - Caméras : 100 CHF HT/mois
 * - Lecteur de badge : 30 CHF HT/mois
 * - Sirène : 50 CHF HT/mois
 */
export interface XTOProduct {
  id: number;
  name: string;
  monthlyPrice: number;
  description: string;
}

export const CATALOG_XTO_PRODUCTS: XTOProduct[] = [
  { id: 400, name: "Centrale XTO", monthlyPrice: 0, description: "Inclus dans le kit de base" },
  { id: 401, name: "Sirène extérieure avec gyrophare", monthlyPrice: 50, description: "50 CHF/mois HT" },
  { id: 402, name: "Caméras à détection infrarouge", monthlyPrice: 100, description: "100 CHF/mois HT par caméra (4 inclus)" },
  { id: 403, name: "Lecteur de badge + 8 badges", monthlyPrice: 30, description: "30 CHF/mois HT" },
  { id: 404, name: "Connexion centre d'intervention GS", monthlyPrice: 0, description: "Inclus" },
  { id: 405, name: "Mise en marche/arrêt automatique", monthlyPrice: 0, description: "Inclus" },
  { id: 406, name: "Signalisations préventives", monthlyPrice: 0, description: "Inclus" },
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
  1: { 12: 61, 24: 32, 36: 23, 48: 18, 60: 14 },
  2: { 12: 114, 24: 60, 36: 42, 48: 33, 60: 27 },
  3: { 12: 174, 24: 91, 36: 64, 48: 50, 60: 41 },
  4: { 12: 228, 24: 119, 36: 83, 48: 65, 60: 54 },
  5: { 12: 288, 24: 151, 36: 106, 48: 83, 60: 68 },
  6: { 12: 341, 24: 179, 36: 125, 48: 98, 60: 81 }
};

export const HALF_DAY_PRICE = 690;
export const FULL_DAY_PRICE = 1290;
export const HALF_DAY_MONTHLY_12 = 61;
export const HALF_DAY_MONTHLY_24 = 32;
export const HALF_DAY_MONTHLY_36 = 23;
export const HALF_DAY_MONTHLY_48 = 18;
export const HALF_DAY_MONTHLY_60 = 14;
export const FULL_DAY_MONTHLY_12 = 114;
export const FULL_DAY_MONTHLY_24 = 60;
export const FULL_DAY_MONTHLY_36 = 42;
export const FULL_DAY_MONTHLY_48 = 33;
export const FULL_DAY_MONTHLY_60 = 27;

export const UNINSTALL_PRICE = 290.00;

export const ADMIN_FEES = {
  simCard: 50.00,
  processingFee: 190.00
};

export const CAMERA_INSTALL_BASE_PRICE = 690.00;
export const CAMERA_INSTALL_ONE_CAMERA = 350.00;
export const REMOTE_ACCESS_PRICE = 20.00;
export const REMOTE_ACCESS_PRICE_2_7 = 35.00;
export const REMOTE_ACCESS_PRICE_8_PLUS = 60.00;
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
    name: "Alarme Titane",
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
    name: "Alarme Jablotron",
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
  },
  xto: {
    id: 100,
    name: "Kit XTO",
    price: 0,
    description: "Kit XTO avec centrale",
    kits: {
      base: {
        name: "Kit de base XTO",
        icon: "📦",
        products: []
      }
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Round amount UP to nearest 5 cents (0.05 CHF)
 * Swiss rounding standard - rounds up to nearest 0.05 CHF
 * Switzerland eliminated 1 and 2 cent coins, so all amounts round to 0.05
 */
export function roundToFiveCents(amount: number): number {
  return Math.ceil(amount * 20) / 20;
}

/**
 * Round amount UP to nearest integer (ENTIER SUPÉRIEUR)
 * Required by Milestone 1 specifications for monthly payment calculations
 */
export function roundUpToInteger(amount: number): number {
  return Math.ceil(amount);
}

/**
 * Calculate monthly payment from cash price using EXACT formulas from Milestone 1
 * Formulas:
 * - 60 months: (Prix produit * 1.25) / 60
 * - 48 months: (Prix produit * 1.2) / 48
 * - 36 months: (Prix produit * 1.15) / 36
 * - 24 months: (Prix produit * 1.10) / 24
 * - 12 months: (Prix produit * 1.05) / 12
 * 
 * ALWAYS rounds UP to nearest integer (ENTIER SUPÉRIEUR OBLIGATOIRE)
 */
export function calculateMonthlyFromCashPrice(cashPrice: number, months: number): number {
  let result: number;
  
  switch (months) {
    case 60:
      result = (cashPrice * 1.25) / 60;
      break;
    case 48:
      result = (cashPrice * 1.2) / 48;
      break;
    case 36:
      result = (cashPrice * 1.15) / 36;
      break;
    case 24:
      result = (cashPrice * 1.10) / 24;
      break;
    case 12:
      result = (cashPrice * 1.05) / 12;
      break;
    default:
      return 0;
  }
  
  return roundUpToInteger(result);
}

/**
 * Calculate facilit\u00e9 de paiement using EXACT formulas from Milestone 1
 * Formulas (after deducting processing fee and SIM card):
 * - 60 months: ((Total après rabais - frais de dossier - carte sim) * 1.25) / 60
 * - 48 months: ((Total après rabais - frais de dossier - carte sim) * 1.2) / 48
 * - 36 months: ((Total après rabais - frais de dossier - carte sim) * 1.15) / 36
 * - 24 months: ((Total après rabais - frais de dossier - carte sim) * 1.10) / 24
 * - 12 months: ((Total après rabais - frais de dossier - carte sim) * 1.05) / 12
 * 
 * ALWAYS rounds UP to nearest integer (ENTIER SUPÉRIEUR OBLIGATOIRE)
 */
export function calculateFacilityPayment(
  totalAfterDiscount: number,
  processingFee: number,
  simCard: number,
  months: number
): number {
  const base = totalAfterDiscount - processingFee - simCard;
  let result: number;
  
  switch (months) {
    case 60:
      result = (base * 1.25) / 60;
      break;
    case 48:
      result = (base * 1.2) / 48;
      break;
    case 36:
      result = (base * 1.15) / 36;
      break;
    case 24:
      result = (base * 1.10) / 24;
      break;
    case 12:
      result = (base * 1.05) / 12;
      break;
    default:
      return 0;
  }
  
  return roundUpToInteger(result);
}

/**
 * Calculate installation price using tiered half-day system:
 * - 1 half-day = 690 CHF
 * - 2 half-days (1 full day) = 1290 CHF
 * - 3 half-days = 1290 + 690 = 1980 CHF
 * - 4 half-days (2 full days) = 1290 + 1290 = 2580 CHF
 * - And so on...
 */
export function calculateInstallationPrice(nbHalfDays: number): number {
  let total = 0;
  for (let i = 0; i < nbHalfDays; i += 2) {
    if (i + 2 <= nbHalfDays) {
      // We have a complete pair (full day)
      total += FULL_DAY_PRICE;
    } else {
      // Remaining single half-day
      total += HALF_DAY_PRICE;
    }
  }
  return total;
}

/**
 * Calculate installation monthly price using tiered half-day system
 */
export function getInstallationMonthlyPrice(nbHalfDays: number, months: number): number {
  let total = 0;
  
  // Get monthly rate for one half-day and one full-day based on payment plan
  let halfDayMonthly = 0;
  let fullDayMonthly = 0;
  
  if (months === 12) {
    halfDayMonthly = HALF_DAY_MONTHLY_12;
    fullDayMonthly = FULL_DAY_MONTHLY_12;
  } else if (months === 24) {
    halfDayMonthly = HALF_DAY_MONTHLY_24;
    fullDayMonthly = FULL_DAY_MONTHLY_24;
  } else if (months === 36) {
    halfDayMonthly = HALF_DAY_MONTHLY_36;
    fullDayMonthly = FULL_DAY_MONTHLY_36;
  } else if (months === 48) {
    halfDayMonthly = HALF_DAY_MONTHLY_48;
    fullDayMonthly = FULL_DAY_MONTHLY_48;
  } else if (months === 60) {
    halfDayMonthly = HALF_DAY_MONTHLY_60;
    fullDayMonthly = FULL_DAY_MONTHLY_60;
  } else {
    return 0;
  }
  
  // Apply tiered pricing
  for (let i = 0; i < nbHalfDays; i += 2) {
    if (i + 2 <= nbHalfDays) {
      // We have a complete pair (full day)
      total += fullDayMonthly;
    } else {
      // Remaining single half-day
      total += halfDayMonthly;
    }
  }
  
  return total;
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
