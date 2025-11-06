'use client';

/**
 * ============================================================================
 * PRODUCT LINE COMPONENT
 * ============================================================================
 * 
 * Migrated from script.js (lines 589-690)
 * Manages individual product lines with quantity, pricing, and custom products
 */

import { useState, useEffect, useCallback } from 'react';
import { getProductPrice, type AlarmProduct, type CameraProduct } from '@/lib/quote-generator';

export interface ProductLineData {
  id: string;
  productId: number | null;
  productName: string;
  customName?: string;
  quantity: number;
  price: number;
  isOffered: boolean;
  isCustom: boolean;
}

interface ProductLineProps {
  lineId: string;
  sectionId: string;
  availableProducts: (AlarmProduct | CameraProduct)[];
  selectedCentral?: string | null;
  onUpdate: (lineId: string, data: ProductLineData) => void;
  onRemove: (lineId: string) => void;
  onCentralChange?: () => void;
  onCameraInstallUpdate?: () => void;
}

export function ProductLine({
  lineId,
  sectionId,
  availableProducts,
  selectedCentral,
  onUpdate,
  onRemove,
  onCentralChange,
  onCameraInstallUpdate
}: ProductLineProps) {
  const [productId, setProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isOffered, setIsOffered] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState(0);

  // Get current product
  const selectedProduct = productId 
    ? availableProducts.find(p => p.id === productId) 
    : null;

  // Calculate price
  const price = isCustomMode 
    ? customPrice 
    : selectedProduct 
      ? getProductPrice(selectedProduct, selectedCentral) 
      : 0;

  const lineTotal = price * quantity;

  // Notify parent of changes
  useEffect(() => {
    const data: ProductLineData = {
      id: lineId,
      productId: isCustomMode ? 99 : productId,
      productName: isCustomMode 
        ? customName 
        : selectedProduct?.name || '',
      customName: isCustomMode ? customName : undefined,
      quantity,
      price,
      isOffered,
      isCustom: isCustomMode
    };
    onUpdate(lineId, data);
  }, [lineId, productId, customName, quantity, price, isOffered, isCustomMode, selectedProduct, onUpdate]);

  // Handle product selection
  const handleProductChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProductId = parseInt(e.target.value);
    
    if (newProductId === 99) {
      // Custom product mode
      setIsCustomMode(true);
      setProductId(99);
      setCustomPrice(0);
      setCustomName('');
    } else if (newProductId) {
      // Regular product
      setIsCustomMode(false);
      setProductId(newProductId);
      setCustomName('');
      
      // Detect central change for alarm products
      if (sectionId === 'alarm-material' && (newProductId === 5 || newProductId === 6)) {
        onCentralChange?.();
      } else if (sectionId === 'alarm-material') {
        onCentralChange?.();
      }
      
      // Update camera installation if needed
      if (sectionId === 'camera-material') {
        onCameraInstallUpdate?.();
      }
    } else {
      // No selection
      setProductId(null);
      setIsCustomMode(false);
    }
  }, [sectionId, onCentralChange, onCameraInstallUpdate]);

  // Handle back from custom mode
  const handleBackFromCustom = useCallback(() => {
    setIsCustomMode(false);
    setProductId(null);
    setCustomName('');
    setCustomPrice(0);
    
    if (sectionId === 'camera-material') {
      onCameraInstallUpdate?.();
    }
  }, [sectionId, onCameraInstallUpdate]);

  return (
    <div className="product-line">
      {/* Product Selection */}
      <div className="product-select-container" style={{ width: '100%', position: 'relative' }}>
        {!isCustomMode ? (
          <select
            className="product-select"
            value={productId || ''}
            onChange={handleProductChange}
            data-section={sectionId}
          >
            <option value="">Sélectionner un produit</option>
            {availableProducts.map(product => {
              const productPrice = getProductPrice(product, selectedCentral);
              return (
                <option 
                  key={product.id} 
                  value={product.id}
                  data-price={productPrice}
                  data-custom={product.isCustom ? 'true' : 'false'}
                >
                  {product.name} - {productPrice.toFixed(2)} CHF
                </option>
              );
            })}
          </select>
        ) : (
          <>
            <input
              type="text"
              className="product-name-input"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nom du produit personnalisé"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #dee2e6',
                borderRadius: '5px'
              }}
              autoFocus
            />
            <button
              className="back-to-select-btn"
              onClick={handleBackFromCustom}
              style={{
                position: 'absolute',
                right: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                padding: '2px 8px',
                cursor: 'pointer',
                fontSize: '12px',
                zIndex: 10
              }}
            >
              ↩
            </button>
          </>
        )}
      </div>

      {/* Quantity Input */}
      <input
        type="number"
        value={quantity}
        min="1"
        className="quantity-input"
        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
      />

      {/* Custom Price Input (only visible in custom mode) */}
      <input
        type="number"
        value={customPrice}
        min="0"
        step="0.01"
        className="price-input discount-input"
        style={{ display: isCustomMode ? 'block' : 'none' }}
        placeholder="Prix unitaire"
        onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
      />

      {/* Offered Checkbox */}
      <div className="checkbox-option" style={{ margin: 0 }}>
        <input
          type="checkbox"
          className="offered-checkbox"
          checked={isOffered}
          onChange={(e) => setIsOffered(e.target.checked)}
        />
        <label style={{ margin: 0, fontSize: '12px' }}>OFFERT</label>
      </div>

      {/* Price Display */}
      <div className="price-display">
        {isOffered ? 'OFFERT' : `${lineTotal.toFixed(2)} CHF`}
      </div>

      {/* Remove Button */}
      <button
        className="remove-btn"
        onClick={() => onRemove(lineId)}
      >
        ×
      </button>
    </div>
  );
}

