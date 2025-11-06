/**
 * ProductSection Component
 * 
 * Manages a section of products with add/remove functionality
 * Replaces DOM-based product management from script.js
 */

import { ProductLine, Product, ProductLineData } from './ProductLine';

interface ProductSectionProps {
  title: string;
  lines: ProductLineData[];
  productCatalog: Product[];
  centralType: 'titane' | 'jablotron' | null;
  onLinesChange: (lines: ProductLineData[]) => void;
  showAddButton?: boolean;
  emoji?: string;
}

export function ProductSection({
  title,
  lines,
  productCatalog,
  centralType,
  onLinesChange,
  showAddButton = true,
  emoji = '🛡️'
}: ProductSectionProps) {
  
  const addProductLine = () => {
    const newLine: ProductLineData = {
      id: Date.now(),
      product: null,
      quantity: 1,
      offered: false
    };
    onLinesChange([...lines, newLine]);
  };

  const updateLine = (id: number, updates: Partial<ProductLineData>) => {
    const updatedLines = lines.map(line =>
      line.id === id ? { ...line, ...updates } : line
    );
    onLinesChange(updatedLines);
  };

  const removeLine = (id: number) => {
    const updatedLines = lines.filter(line => line.id !== id);
    onLinesChange(updatedLines);
  };

  return (
    <div className="quote-section">
      <h3>
        {emoji} {title}
        {showAddButton && (
          <button
            className="add-product-btn"
            onClick={addProductLine}
            title="Ajouter un produit"
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '20px',
              cursor: 'pointer',
              marginLeft: '10px',
              transition: 'all 0.2s',
              lineHeight: '1'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#218838'}
            onMouseOut={(e) => e.currentTarget.style.background = '#28a745'}
          >
            +
          </button>
        )}
      </h3>

      {/* Product Lines */}
      {lines.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#6c757d',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          Aucun produit ajouté. Cliquez sur "+" pour commencer.
        </div>
      ) : (
        <div id="product-lines-container">
          {lines.map((line) => (
            <ProductLine
              key={line.id}
              line={line}
              productCatalog={productCatalog}
              centralType={centralType}
              onUpdate={updateLine}
              onRemove={removeLine}
              showRemoveButton={lines.length > 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
