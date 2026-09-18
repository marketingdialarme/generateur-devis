/**
 * Shared product-line types.
 *
 * The ProductLine *component* that used to live in this file was never
 * actually rendered anywhere -- every category builds its own inline product
 * rows instead -- so it was removed as dead code. These two interfaces are
 * still the real, widely-used shared shape for a product and a product line
 * across all 4 categories.
 */

export interface Product {
  id: number;
  name: string;
  price?: number;
  priceTitane?: number;
  priceJablotron?: number;
  monthlyTitane?: number;
  monthlyJablotron?: number;
  isCustom?: boolean;
  requiresJablotron?: boolean;
  isXTO?: boolean;
  ref?: string;
  /** Drive file ID or shareable link, from the Sheet's "Fiche" column. */
  fiche?: string;
}

export interface ProductLineData {
  id: number;
  product: Product | null;
  quantity: number;
  offered: boolean;
  customName?: string;
  customPrice?: number;
}
