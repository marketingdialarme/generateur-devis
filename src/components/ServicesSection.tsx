/**
 * ServicesSection Component
 * 
 * Handles Test Cyclique and Surveillance services for Alarm tab
 * Converted from script.js lines 543-817
 */

import { useEffect, useRef } from 'react';

interface ServicesSectionProps {
  // Test Cyclique
  testCycliqueSelected: boolean;
  testCycliquePrice: number;
  testCycliqueOffered: boolean;
  onTestCycliqueSelectedChange: (value: boolean) => void;
  onTestCycliquePriceChange: (value: number) => void;
  onTestCycliqueOfferedChange: (value: boolean) => void;
  
  // Surveillance
  surveillanceType: string;
  surveillancePrice: number;
  surveillanceOffered: boolean;
  onSurveillanceTypeChange: (value: string) => void;
  onSurveillancePriceChange: (value: number) => void;
  onSurveillanceOfferedChange: (value: boolean) => void;
  
  // Central type for pricing
  centralType: 'titane' | 'jablotron' | null;
  rentalMode: boolean;
  simCardSelected: boolean; // For Titane autosurveillance pricing

  // Admin fees selection can affect surveillance price (client feedback)
  simCardSelected: boolean;
}

// Surveillance pricing constants from script.js lines 136-177
const SURVEILLANCE_PRICES_SALE = {
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

const SURVEILLANCE_PRICES_RENTAL = {
  titane: {
    autosurveillance: 71,
    autosurveillancePro: 91,
    telesurveillance: 151,
    telesurveillancePro: 181
  },
  jablotron: {
    telesurveillance: 161,
    telesurveillancePro: 191
  },
  default: {
    autosurveillance: 71,
    autosurveillancePro: 91,
    telesurveillance: 151,
    telesurveillancePro: 181
  }
};

export function ServicesSection(props: ServicesSectionProps) {
  const {
    testCycliqueSelected,
    testCycliquePrice,
    testCycliqueOffered,
    onTestCycliqueSelectedChange,
    onTestCycliquePriceChange,
    onTestCycliqueOfferedChange,
    surveillanceType,
    surveillancePrice,
    surveillanceOffered,
    onSurveillanceTypeChange,
    onSurveillancePriceChange,
    onSurveillanceOfferedChange,
    centralType,
    rentalMode,
    simCardSelected
  } = props;

  // Track the last auto-calculated price so we don't overwrite manual edits.
  const lastAutoSurveillancePriceRef = useRef<number | null>(null);

  // Get available surveillance options based on central type
  const getSurveillanceOptions = () => {
    const baseOptions = [
      { value: '', label: 'Aucun' }
    ];

    // If no central type, show all options with manual pricing
    if (!centralType) {
      return [
        ...baseOptions,
        { value: 'autosurveillance', label: 'Autosurveillance' },
        { value: 'telesurveillance', label: 'Télésurveillance Particulier' },
        { value: 'telesurveillance-pro', label: 'Télésurveillance Professionnel' }
      ];
    }

    if (centralType === 'jablotron') {
      return [
        ...baseOptions,
        { value: 'telesurveillance', label: 'Télésurveillance Particulier' },
        { value: 'telesurveillance-pro', label: 'Télésurveillance Professionnel' }
      ];
    } else if (centralType === 'titane') {
      return [
        ...baseOptions,
        { value: 'telesurveillance', label: 'Télésurveillance Particulier' },
        { value: 'telesurveillance-pro', label: 'Télésurveillance Professionnel' },
        { value: 'autosurveillance', label: 'Autosurveillance' }
      ];
    }

    return baseOptions;
  };

  // Auto-update surveillance price when type changes
  useEffect(() => {
    if (!surveillanceType) {
      onSurveillancePriceChange(0);
      lastAutoSurveillancePriceRef.current = null;
      return;
    }
    
    // If no central type, keep current manual price
    if (!centralType) {
      return;
    }

    // Proper key mapping for price lookup
    const keyMap: Record<string, string> = {
      'telesurveillance': 'telesurveillance',
      'telesurveillance-pro': 'telesurveillancePro',
      'autosurveillance': 'autosurveillance',
      'autosurveillance-pro': 'autosurveillancePro'
    };

    const priceKey = keyMap[surveillanceType];
    if (!priceKey) {
      onSurveillancePriceChange(0);
      return;
    }

    const prices = rentalMode ? SURVEILLANCE_PRICES_RENTAL : SURVEILLANCE_PRICES_SALE;
    let price = 0;

    if (centralType === 'titane') {
      price = (prices.titane as any)[priceKey] || 0;
    } else if (centralType === 'jablotron') {
      price = (prices.jablotron as any)[priceKey] || 0;
    } else {
      price = (prices.default as any)[priceKey] || 0;
    }

    // Client feedback: Titane autosurveillance depends on SIM selection
    // - Autosurveillance WITHOUT SIM: 59 CHF/mois
    // - Autosurveillance WITH SIM: 64 CHF/mois
    if (!rentalMode && centralType === 'titane' && surveillanceType === 'autosurveillance') {
      price = simCardSelected ? 64 : 59;
    }

    // Only auto-update if the user hasn't manually overridden the price.
    const lastAuto = lastAutoSurveillancePriceRef.current;
    const shouldAutoUpdate = surveillancePrice === 0 || lastAuto === null || surveillancePrice === lastAuto;
    if (shouldAutoUpdate) {
      lastAutoSurveillancePriceRef.current = price;
      onSurveillancePriceChange(price);
    }
  }, [surveillanceType, centralType, rentalMode, simCardSelected, surveillancePrice, onSurveillancePriceChange]);

  const testCycliqueTotal = testCycliqueSelected ? (testCycliqueOffered ? 0 : testCycliquePrice) : 0;
  const surveillanceTotal = surveillanceType ? (surveillanceOffered ? 0 : surveillancePrice) : 0;

  return (
    <div className="quote-section">
      <h3>🔧 4. Services</h3>
      
      {/* Test Cyclique */}
      <div className="product-line">
        <div>Test Cyclique</div>
        <div className="checkbox-option" style={{ margin: 0 }}>
          <input
            type="checkbox"
            checked={testCycliqueSelected}
            onChange={(e) => onTestCycliqueSelectedChange(e.target.checked)}
          />
          <label style={{ margin: 0, fontSize: '12px', marginLeft: '4px' }}>Inclure</label>
        </div>
        <input
          type="number"
          value={testCycliquePrice}
          onChange={(e) => onTestCycliquePriceChange(parseFloat(e.target.value) || 0)}
          className="discount-input"
          placeholder="Prix"
          style={{ width: '100px' }}
        />
        <div className="checkbox-option" style={{ margin: 0 }}>
          <input
            type="checkbox"
            checked={testCycliqueOffered}
            onChange={(e) => onTestCycliqueOfferedChange(e.target.checked)}
            className="offered-checkbox"
          />
          <label style={{ margin: 0, fontSize: '12px', marginLeft: '4px' }}>OFFERT</label>
        </div>
        <div className="price-display">
          {testCycliqueSelected ? (testCycliqueOffered ? 'OFFERT' : `${testCycliqueTotal.toFixed(2)} CHF`) : '0.00 CHF'}
        </div>
      </div>

      {/* Surveillance */}
      <div className="product-line">
        <div>Service de surveillance</div>
        <div>
          <select
            value={surveillanceType}
            onChange={(e) => onSurveillanceTypeChange(e.target.value)}
            className="service-select"
            style={{
              padding: '8px 12px',
              border: '2px solid #e9ecef',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          >
            {getSurveillanceOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <input
          type="number"
          value={surveillancePrice}
          onChange={(e) => onSurveillancePriceChange(parseFloat(e.target.value) || 0)}
          className="discount-input"
          placeholder="Prix/mois"
          style={{ width: '100px' }}
        />
        <div className="checkbox-option" style={{ margin: 0 }}>
          <input
            type="checkbox"
            checked={surveillanceOffered}
            onChange={(e) => onSurveillanceOfferedChange(e.target.checked)}
            className="offered-checkbox"
            disabled={!surveillanceType}
          />
          <label style={{ margin: 0, fontSize: '12px', marginLeft: '4px' }}>OFFERT</label>
        </div>
        <div className="price-display">
          {surveillanceTotal > 0 ? `${surveillanceTotal.toFixed(2)} CHF/mois` : '0.00 CHF/mois'}
        </div>
      </div>

      {!centralType && surveillanceType && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          background: '#d1ecf1',
          border: '1px solid #0c5460',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#0c5460'
        }}>
          ℹ️ Prix manuel - Aucune centrale sélectionnée. Veuillez saisir le prix manuellement.
        </div>
      )}
    </div>
  );
}

