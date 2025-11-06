/**
 * ProductLine Component
 * 
 * Reusable component for displaying and managing individual product lines
 * Replaces DOM manipulation from script.js lines 589-642
 */

import { useState } from 'react';

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
}

export interface ProductLineData {
  id: number;
  product: Product | null;
  quantity: number;
  offered: boolean;
  customName?: string;
  customPrice?: number;
}

interface ProductLineProps {
  line: ProductLineData;
  productCatalog: Product[];
  centralType: 'titane' | 'jablotron' | null;
  onUpdate: (id: number, updates: Partial<ProductLineData>) => void;
  onRemove: (id: number) => void;
  showRemoveButton?: boolean;
}

export function ProductLine({
  line,
  productCatalog,
  centralType,
  onUpdate,
  onRemove,
  showRemoveButton = true
}: ProductLineProps) {
  const [showCustomFields, setShowCustomFields] = useState(line.product?.isCustom || false);

  // Get price based on central type
  const getPrice = (product: Product | null): number => {
    if (!product) return 0;
    
    // Custom product
    if (product.isCustom && line.customPrice !== undefined) {
      return line.customPrice;
    }
    
    // Fixed price
    if (product.price !== undefined) {
      return product.price;
    }
    
    // Central-specific pricing
    if (centralType === 'titane' && product.priceTitane !== undefined) {
      return product.priceTitane;
    }
    if (centralType === 'jablotron' && product.priceJablotron !== undefined) {
      return product.priceJablotron;
    }
    
    return 0;
  };

  // Filter products based on central type
  const filteredCatalog = productCatalog.filter(p => {
    if (p.requiresJablotron && centralType !== 'jablotron') {
      return false;
    }
    return true;
  });

  const handleProductChange = (productId: number) => {
    const selectedProduct = productCatalog.find(p => p.id === productId);
    if (selectedProduct) {
      const isCustom = selectedProduct.isCustom || false;
      setShowCustomFields(isCustom);
      onUpdate(line.id, {
        product: selectedProduct,
        customName: isCustom ? '' : undefined,
        customPrice: isCustom ? 0 : undefined
      });
    }
  };

  const price = getPrice(line.product);
  const total = line.offered ? 0 : price * line.quantity;

  return (
    <div className="product-line">
      {/* Product Selector */}
      <div style={{ flex: 1 }}>
        <select
          value={line.product?.id || ''}
          onChange={(e) => handleProductChange(parseInt(e.target.value))}
          className="product-select"
          style={{ 
            width: '100%', 
            padding: '8px', 
            border: '2px solid #e9ecef', 
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="">Sélectionner un produit</option>
          {filteredCatalog.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} {!product.isCustom && `- ${getPrice(product).toFixed(2)} CHF`}
            </option>
          ))}
        </select>

        {/* Custom product fields */}
        {showCustomFields && line.product?.isCustom && (
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Nom du produit"
              value={line.customName || ''}
              onChange={(e) => onUpdate(line.id, { customName: e.target.value })}
              style={{
                flex: 1,
                padding: '8px',
                border: '2px solid #007bff',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
            <input
              type="number"
              placeholder="Prix"
              value={line.customPrice || 0}
              onChange={(e) => onUpdate(line.id, { customPrice: parseFloat(e.target.value) || 0 })}
              style={{
                width: '100px',
                padding: '8px',
                border: '2px solid #007bff',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
          </div>
        )}
      </div>

      {/* Quantity */}
      <div>
        <input
          type="number"
          value={line.quantity}
          onChange={(e) => onUpdate(line.id, { quantity: parseInt(e.target.value) || 1 })}
          min="1"
          max="99"
          className="quantity-input"
          style={{
            width: '60px',
            padding: '8px',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            textAlign: 'center'
          }}
        />
      </div>

      {/* Unit Price */}
      <div className="price-display" style={{ minWidth: '100px', textAlign: 'right' }}>
        {price.toFixed(2)} CHF
      </div>

      {/* Offered Checkbox */}
      <div className="checkbox-option" style={{ margin: 0, minWidth: '80px' }}>
        <input
          type="checkbox"
          checked={line.offered}
          onChange={(e) => onUpdate(line.id, { offered: e.target.checked })}
          className="offered-checkbox"
        />
        <label style={{ margin: 0, fontSize: '12px', marginLeft: '4px' }}>OFFERT</label>
      </div>

      {/* Total */}
      <div className="price-display" style={{ minWidth: '100px', fontWeight: 600 }}>
        {line.offered ? 'OFFERT' : `${total.toFixed(2)} CHF`}
      </div>

      {/* Remove Button */}
      {showRemoveButton && (
        <button
          onClick={() => onRemove(line.id)}
          className="remove-product-btn"
          title="Supprimer"
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            width: '32px',
            height: '32px',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#c82333'}
          onMouseOut={(e) => e.currentTarget.style.background = '#dc3545'}
        >
          −
        </button>
      )}
    </div>
  );
}
