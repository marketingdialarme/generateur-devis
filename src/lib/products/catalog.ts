/**
 * ============================================================================
 * PRODUCT CATALOG
 * ============================================================================
 * 
 * Centralized product catalog for quotes
 * Converted from frontend/script.js product definitions
 * ============================================================================
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

export interface ProductKit {
  id: string;
  name: string;
  products: Array<{ productId: string; quantity: number }>;
  description?: string;
}

// ============================================================================
// ALARM PRODUCTS
// ============================================================================

export const ALARM_PRODUCTS: Product[] = [
  { id: 'centrale-titane', name: 'Centrale Titane', price: 890, category: 'centrale' },
  { id: 'centrale-jablotron', name: 'Centrale Jablotron', price: 1200, category: 'centrale' },
  { id: 'detecteur-mouvement', name: 'Détecteur de mouvement', price: 120, category: 'detecteur' },
  { id: 'detecteur-ouverture', name: 'Détecteur d\'ouverture', price: 85, category: 'detecteur' },
  { id: 'sirene-interieure', name: 'Sirène intérieure', price: 150, category: 'sirene' },
  { id: 'sirene-exterieure', name: 'Sirène extérieure', price: 250, category: 'sirene' },
  { id: 'clavier', name: 'Clavier de commande', price: 180, category: 'accessoire' },
  { id: 'badge', name: 'Badge', price: 45, category: 'accessoire' },
  { id: 'telecommande', name: 'Télécommande', price: 65, category: 'accessoire' },
];

export const ALARM_KITS: ProductKit[] = [
  {
    id: 'kit-base-titane',
    name: 'Kit de base Titane',
    products: [
      { productId: 'centrale-titane', quantity: 1 },
      { productId: 'detecteur-mouvement', quantity: 2 },
      { productId: 'detecteur-ouverture', quantity: 3 },
      { productId: 'sirene-interieure', quantity: 1 },
      { productId: 'clavier', quantity: 1 },
      { productId: 'telecommande', quantity: 2 },
    ],
    description: 'Kit de base pour protection standard',
  },
  {
    id: 'kit-base-jablotron',
    name: 'Kit de base Jablotron',
    products: [
      { productId: 'centrale-jablotron', quantity: 1 },
      { productId: 'detecteur-mouvement', quantity: 2 },
      { productId: 'detecteur-ouverture', quantity: 3 },
      { productId: 'sirene-exterieure', quantity: 1 },
      { productId: 'clavier', quantity: 1 },
      { productId: 'telecommande', quantity: 2 },
    ],
    description: 'Kit de base Jablotron pour protection avancée',
  },
];

// ============================================================================
// VIDEO SURVEILLANCE PRODUCTS
// ============================================================================

export const CAMERA_PRODUCTS: Product[] = [
  { id: 'solar-4g-xl', name: 'SOLAR 4G XL', price: 890, category: 'camera' },
  { id: 'dome-night', name: 'DÔME NIGHT', price: 650, category: 'camera' },
  { id: 'bullet-zoom', name: 'BULLET ZOOM', price: 720, category: 'camera' },
  { id: 'mini-solar', name: 'MINI SOLAR', price: 580, category: 'camera' },
  { id: 'ptz-motorisee', name: 'PTZ MOTORISÉE', price: 1200, category: 'camera' },
  { id: 'nvr-4-ch', name: 'NVR 4 canaux', price: 450, category: 'enregistreur' },
  { id: 'nvr-8-ch', name: 'NVR 8 canaux', price: 680, category: 'enregistreur' },
  { id: 'nvr-16-ch', name: 'NVR 16 canaux', price: 950, category: 'enregistreur' },
  { id: 'disque-1to', name: 'Disque dur 1 To', price: 120, category: 'stockage' },
  { id: 'disque-2to', name: 'Disque dur 2 To', price: 180, category: 'stockage' },
  { id: 'disque-4to', name: 'Disque dur 4 To', price: 280, category: 'stockage' },
  { id: 'switch-poe-4', name: 'Switch PoE 4 ports', price: 150, category: 'reseau' },
  { id: 'switch-poe-8', name: 'Switch PoE 8 ports', price: 250, category: 'reseau' },
  { id: 'onduleur', name: 'Onduleur', price: 180, category: 'accessoire' },
  { id: 'coffret', name: 'Coffret de protection', price: 120, category: 'accessoire' },
];

// ============================================================================
// SERVICES
// ============================================================================

export const SERVICES = {
  alarm: {
    installation: { base: 690, perUnit: 690 },
    uninstallation: { price: 290 },
    adminFees: {
      simCard: 50,
      processing: 190,
    },
    surveillance: {
      telesurveillance: 35,
      telesurveillancePro: 45,
      autosurveillance: 15,
      autosurveillancePro: 25,
    },
  },
  camera: {
    installation: { base: 690, perCamera: 150 },
    remoteAccess: 20,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get product by ID
 */
export function getProduct(productId: string, type: 'alarm' | 'camera'): Product | null {
  const catalog = type === 'alarm' ? ALARM_PRODUCTS : CAMERA_PRODUCTS;
  return catalog.find((p) => p.id === productId) || null;
}

/**
 * Get kit by ID
 */
export function getKit(kitId: string): ProductKit | null {
  return ALARM_KITS.find((k) => k.id === kitId) || null;
}

/**
 * Calculate kit total price
 */
export function calculateKitPrice(kitId: string): number {
  const kit = getKit(kitId);
  if (!kit) return 0;
  
  return kit.products.reduce((total, item) => {
    const product = getProduct(item.productId, 'alarm');
    if (!product) return total;
    return total + product.price * item.quantity;
  }, 0);
}

/**
 * Calculate total price with discount
 */
export function applyDiscount(
  amount: number,
  discountType: 'percent' | 'amount',
  discountValue: number
): number {
  if (discountType === 'percent') {
    return amount * (1 - discountValue / 100);
  }
  return Math.max(0, amount - discountValue);
}

/**
 * Calculate monthly payment
 */
export function calculateMonthlyPayment(total: number, months: number): number {
  if (months === 0) return 0; // Cash payment
  return Math.round((total / months) * 100) / 100;
}

/**
 * Apply Swiss VAT (8.1%)
 */
export function applyVAT(amountHT: number): number {
  return Math.round(amountHT * 1.081 * 100) / 100;
}

