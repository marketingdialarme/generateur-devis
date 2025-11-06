'use client';

/**
 * ============================================================================
 * PRODUCT SECTION COMPONENT
 * ============================================================================
 * 
 * Manages a collection of product lines for a specific section
 * (e.g., alarm-material, camera-material, etc.)
 */

import { useState, useCallback, useMemo } from 'react';
import { ProductLine, type ProductLineData } from './ProductLine';
import { 
  CATALOG_ALARM_PRODUCTS, 
  CATALOG_CAMERA_MATERIAL,
  getFilteredProducts,
  type AlarmProduct,
  type CameraProduct
} from '@/lib/quote-generator';

interface ProductSectionProps {
  sectionId: string;
  selectedCentral?: string | null;
  onTotalsChange?: () => void;
  onCentralChange?: () => void;
  onCameraInstallUpdate?: () => void;
}

export function ProductSection({
  sectionId,
  selectedCentral,
  onTotalsChange,
  onCentralChange,
  onCameraInstallUpdate
}: ProductSectionProps) {
  const [productLines, setProductLines] = useState<Map<string, ProductLineData>>(new Map());

  // Get available products based on section
  const availableProducts = useMemo(() => {
    if (sectionId === 'alarm-material' || sectionId === 'alarm-installation') {
      const isInstallationSection = sectionId === 'alarm-installation';
      return getFilteredProducts(
        CATALOG_ALARM_PRODUCTS,
        selectedCentral || null,
        isInstallationSection
      );
    } else if (sectionId === 'camera-material') {
      return CATALOG_CAMERA_MATERIAL;
    }
    return [];
  }, [sectionId, selectedCentral]);

  // Add new product line
  const addProductLine = useCallback(() => {
    const lineId = `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setProductLines(prev => {
      const newMap = new Map(prev);
      newMap.set(lineId, {
        id: lineId,
        productId: null,
        productName: '',
        quantity: 1,
        price: 0,
        isOffered: false,
        isCustom: false
      });
      return newMap;
    });
  }, []);

  // Update product line
  const updateProductLine = useCallback((lineId: string, data: ProductLineData) => {
    setProductLines(prev => {
      const newMap = new Map(prev);
      newMap.set(lineId, data);
      return newMap;
    });
    onTotalsChange?.();
  }, [onTotalsChange]);

  // Remove product line
  const removeProductLine = useCallback((lineId: string) => {
    setProductLines(prev => {
      const newMap = new Map(prev);
      newMap.delete(lineId);
      return newMap;
    });
    onTotalsChange?.();
  }, [onTotalsChange]);

  // Expose product lines data for parent components
  const getProductLinesData = useCallback(() => {
    return Array.from(productLines.values());
  }, [productLines]);

  // Make getProductLinesData available globally for calculations
  // This is a temporary bridge until we fully migrate calculations
  if (typeof window !== 'undefined') {
    (window as any)[`get${sectionId}ProductLines`] = getProductLinesData;
  }

  return (
    <div className="quote-section">
      <div id={`${sectionId}-products`} className="products-container">
        {Array.from(productLines.entries()).map(([lineId, data]) => (
          <ProductLine
            key={lineId}
            lineId={lineId}
            sectionId={sectionId}
            availableProducts={availableProducts}
            selectedCentral={selectedCentral}
            onUpdate={updateProductLine}
            onRemove={removeProductLine}
            onCentralChange={onCentralChange}
            onCameraInstallUpdate={onCameraInstallUpdate}
          />
        ))}
      </div>

      {/* Add Product Button */}
      <button
        type="button"
        className="add-product-btn"
        onClick={addProductLine}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          background: '#f4e600',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        + Ajouter un produit
      </button>
    </div>
  );
}

