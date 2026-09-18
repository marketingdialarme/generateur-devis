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

export interface AlarmProduct {
  id: number;
  name: string;
  price: number;
  ref?: string;
  isCustom?: boolean;
  /** Drive file ID or shareable link for this product's fiche technique,
   * from the Sheet's "Fiche" column. Preferred over the old name-based
   * Drive folder search when present. */
  fiche?: string;
}

export interface CameraProduct {
  id: number;
  name: string;
  price: number;
  ref?: string;
  type?: string; // 'Caméra' | 'NVR' | 'Modem' | 'Accessoire' — drives vision à distance + maintenance counting
  is4G?: boolean;
  isCustom?: boolean;
  fiche?: string;
}

/**
 * No hardcoded Camera product data — read live from the "Produits_Cameras"
 * tab (see fetchCameraProductsFromSheet). The old monthly48/36/24/12
 * stored-value fields are gone too: monthly prices are computed from
 * `price` via calculateMonthlyFromCashPrice on branches that have that fix
 * (this one doesn't yet — see fix/monthly-formula-all-categories, to be
 * merged separately); until merged, Camera's on-screen monthly preview
 * falls back to plain price/months here, same as it already did for the
 * 12-month case before that fix.
 *
 * `type` and `is4G` come from the two columns the client added
 * specifically for this migration, replacing CAMERA_DEVICE_IDS (a
 * hardcoded id set) and name.includes('4G') for the vision-à-distance and
 * maintenance-counting logic.
 */

/**
 * No hardcoded Titane/Jablotron product data — read live from the
 * "Produits_Alarme" tab (see fetchAlarmProductsFromSheet). Titane and
 * Jablotron are separate rows in the sheet (TIT-.../JAB-... refs), each
 * with a single price — unlike the old CATALOG_ALARM_PRODUCTS, there is no
 * more per-central priceTitane/priceJablotron pair on one entry. Central
 * detection and kit membership are both driven by `ref` now (see
 * detectCentralType in product-line-adapter.ts and the kit application
 * logic in create-devis/page.tsx), not by hardcoded ids.
 *
 * XTO keeps its own hardcoded catalog below (CATALOG_XTO_PRODUCTS /
 * XTO_KIT_LINES) for now — it's a monthly-only rental model, structurally
 * unrelated to Titane/Jablotron pricing, and is being migrated separately.
 *
 * "Autre" (custom product) and the two "Installation X journée" entries
 * used by the Caméras installation section stay code-defined below —
 * neither is sourced from the sheet.
 */
export const CATALOG_ALARM_PRODUCTS: AlarmProduct[] = [
  { id: 99, name: "Autre", price: 0.00, isCustom: true },
  // Installation (demi-journée / journée) - used for camera installation section only
  { id: 101, name: "Installation 1/2 journée", price: 690.00 },
  { id: 102, name: "Installation 1 journée", price: 1290.00 },
];

export const CATALOG_CAMERA_MATERIAL: CameraProduct[] = [
  { id: 99, name: "Autre", price: 0.00, isCustom: true },
];

export interface FogProduct {
  id: number;
  name: string;
  price: number;
  ref?: string;
  isCustom?: boolean;
  fiche?: string;
}

/**
 * No hardcoded product data — read live from the "Produits_Générateur_de_
 * brouillard" tab (see fetchFogProductsFromSheet). Matched by `ref` (the
 * Sheet's REF column) wherever possible, not by `name`: unlike Visiophone,
 * this Sheet already has stable references, so there is no reason to key
 * off text that editors may reword. No fallback catalog, same as
 * Visiophone (client decision) — the Sheet is the single source of truth.
 */

export interface VisiophoProduct {
  id: number;
  name: string;
  price: number;
  isCustom?: boolean;
  fiche?: string;
}

/**
 * Visiophone has no hardcoded product data anymore — it's read live from the
 * "Produits_Visiophone" tab (see fetchVisiophoneProductsFromSheet in
 * google-sheets.service.ts). No fallback catalog on purpose: the Sheet is
 * the single source of truth, so a broken connection surfaces as a visible
 * error in the app rather than silently serving stale duplicate data.
 */

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
  { id: 401, name: "Caméras", monthlyPrice: 100, description: "100 CHF HT/mois" },
  { id: 402, name: "Lecteur de badge", monthlyPrice: 30, description: "30 CHF HT/mois" },
  { id: 403, name: "Sirène", monthlyPrice: 50, description: "50 CHF HT/mois" },
];

/**
 * XTO base-kit contents — the five lines promised by the kit-selection modal
 * (client sheet, Alarme tab: "Ajouter un Kit XTO avec ..."). Injected into the
 * material lines when "Kit Complet XTO" is selected. Zero-price entries
 * (centrale, centre d'intervention) are part of the kit and render as "-" on
 * the quote, like the other always-included base-kit items.
 */
export interface XTOKitLine {
  xtoId: number;
  name: string;
  monthlyPrice: number;
  quantity: number;
}

export const XTO_KIT_LINES: XTOKitLine[] = [
  { xtoId: 400, name: "Centrale XTO", monthlyPrice: 0, quantity: 1 },
  { xtoId: 403, name: "Sirène extérieure avec gyrophare", monthlyPrice: 50, quantity: 1 },
  { xtoId: 401, name: "Caméras à détection infrarouge", monthlyPrice: 100, quantity: 4 },
  { xtoId: 402, name: "Lecteur de badge + 8 badges", monthlyPrice: 30, quantity: 1 },
  { xtoId: 404, name: "Centre d'intervention GS", monthlyPrice: 0, quantity: 1 },
];

// ============================================
// PRICING CONFIGURATION
// ============================================

// Mutable on purpose: overwritten once from the Config sheet's single "TVA"
// row (see fetchConfigFromSheet / setTvaRate) instead of being a fixed
// constant. Every importer reads the current value via ES module live
// bindings, so nothing downstream needs to change to pick up the update.
export let TVA_RATE = 0.081; // 8.1% — fallback until the Config fetch resolves

export function setTvaRate(percent: number) {
  TVA_RATE = percent / 100;
}

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

export const UNINSTALL_PRICE = 390.00;

// Fallback values until the Config fetch resolves — see setAdminFees, which
// mutates this object's fields in place from the Config sheet's single
// "SIM" (Carte SIM + Activation) and "FD" (Frais de dossier) rows (client
// consolidated what used to be separate per-category duplicates).
export const ADMIN_FEES = {
  simCard: 50.00,
  processingFee: 190.00
};

export function setAdminFees(simCard: number, processingFee: number) {
  ADMIN_FEES.simCard = simCard;
  ADMIN_FEES.processingFee = processingFee;
}

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
  return product.price || 0;
}

export function getFilteredProducts(
  products: AlarmProduct[],
  selectedCentral: string | null,
  isInstallationSection: boolean
): AlarmProduct[] {
  const ref = (p: AlarmProduct) => (p as any).ref as string | undefined;
  if (selectedCentral === 'jablotron') {
    return products.filter(p => ref(p)?.startsWith('JAB-') ?? true);
  }
  if (selectedCentral === 'titane') {
    return products.filter(p => ref(p)?.startsWith('TIT-') ?? true);
  }
  return products;
}
