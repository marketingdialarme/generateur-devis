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

  // Live prices from the Config sheet (TIT-AUTO-S-SIM, TIT-TEL-PAR, ...).
  // Falls back to the hardcoded SALE table below if a ref isn't loaded yet.
  configValues: Record<string, number>;
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

// Fallback SALE prices, used only if the matching Config ref hasn't loaded
// yet. Kept in sync loosely; the live Config values (see configValues prop)
// take priority whenever available.
const SURVEILLANCE_PRICES_SALE_FALLBACK = {
  titane: {
    autosurveillanceSansSim: 69,
    autosurveillanceAvecSim: 74,
    telesurveillance: 129,
    telesurveillancePro: 169
  },
  jablotron: {
    telesurveillance: 149,
    telesurveillancePro: 179
  }
};

// No rental-specific rows exist in Config yet — rental mode keeps using
// this hardcoded table until the client adds them.
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
    simCardSelected,
    configValues
  } = props;

  // Track the last auto-calculated price so we don't overwrite manual edits.
  const lastAutoSurveillancePriceRef = useRef<number | null>(null);

  // Available options are driven directly by which Config refs exist for
  // the selected central (client spec): Titane gets 4 options (2
  // autosurveillance variants + 2 télésurveillance variants), Jablotron
  // gets only the 2 télésurveillance variants — no autosurveillance ref
  // exists for Jablotron in Config.
  const getSurveillanceOptions = () => {
    const baseOptions = [
      { value: '', label: 'Aucun' }
    ];

    // Client feedback: don't offer "autosurveillance sans carte SIM" when a
    // SIM card is already included in the quote — doesn't make sense to
    // propose the no-SIM variant when one is being sold as part of the same
    // devis.
    const autosurveillanceSansSim = simCardSelected
      ? []
      : [{ value: 'autosurveillance-sans-sim', label: 'Autosurveillance sans carte SIM' }];

    // If no central type, show all options with manual pricing
    if (!centralType) {
      return [
        ...baseOptions,
        ...autosurveillanceSansSim,
        { value: 'autosurveillance-avec-sim', label: 'Autosurveillance avec carte SIM' },
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
        ...autosurveillanceSansSim,
        { value: 'autosurveillance-avec-sim', label: 'Autosurveillance avec carte SIM' },
        { value: 'telesurveillance', label: 'Télésurveillance Particulier' },
        { value: 'telesurveillance-pro', label: 'Télésurveillance Professionnel' }
      ];
    }

    return baseOptions;
  };

  // Auto-update surveillance price when type changes
  useEffect(() => {
    // If a SIM card gets included while "sans carte SIM" was selected, that
    // option just disappeared from the list — clear it rather than leave
    // the field stuck on a now-hidden value.
    if (surveillanceType === 'autosurveillance-sans-sim' && simCardSelected) {
      onSurveillanceTypeChange('');
      return;
    }

    if (!surveillanceType) {
      onSurveillancePriceChange(0);
      lastAutoSurveillancePriceRef.current = null;
      return;
    }
    
    // If no central type, keep current manual price
    if (!centralType) {
      return;
    }

    let price = 0;

    if (!rentalMode) {
      // Sale mode: read straight from Config, one ref per option — no more
      // "autosurveillance price depends on SIM selection" special case,
      // since TIT-AUTO-S-SIM / TIT-AUTO-SIM are now two separate options
      // instead of one option with a hidden SIM-dependent price.
      const refByOption: Record<string, string> = centralType === 'titane'
        ? {
            'autosurveillance-sans-sim': 'TIT-AUTO-S-SIM',
            'autosurveillance-avec-sim': 'TIT-AUTO-SIM',
            'telesurveillance': 'TIT-TEL-PAR',
            'telesurveillance-pro': 'TIT-TEL-PRO',
          }
        : {
            'telesurveillance': 'JAB-TEL-PAR',
            'telesurveillance-pro': 'JAB-TEL-PRO',
          };
      const ref = refByOption[surveillanceType];
      const fallback = centralType === 'titane'
        ? {
            'autosurveillance-sans-sim': SURVEILLANCE_PRICES_SALE_FALLBACK.titane.autosurveillanceSansSim,
            'autosurveillance-avec-sim': SURVEILLANCE_PRICES_SALE_FALLBACK.titane.autosurveillanceAvecSim,
            'telesurveillance': SURVEILLANCE_PRICES_SALE_FALLBACK.titane.telesurveillance,
            'telesurveillance-pro': SURVEILLANCE_PRICES_SALE_FALLBACK.titane.telesurveillancePro,
          }[surveillanceType]
        : {
            'telesurveillance': SURVEILLANCE_PRICES_SALE_FALLBACK.jablotron.telesurveillance,
            'telesurveillance-pro': SURVEILLANCE_PRICES_SALE_FALLBACK.jablotron.telesurveillancePro,
          }[surveillanceType];
      price = (ref && typeof configValues[ref] === 'number') ? configValues[ref] : (fallback ?? 0);
    } else {
      // Rental mode: no Config refs exist yet for these, stays on the
      // hardcoded table until the client adds rental-specific rows.
      const keyMap: Record<string, string> = {
        'telesurveillance': 'telesurveillance',
        'telesurveillance-pro': 'telesurveillancePro',
        'autosurveillance-sans-sim': 'autosurveillance',
        'autosurveillance-avec-sim': 'autosurveillance',
      };
      const priceKey = keyMap[surveillanceType];
      if (priceKey) {
        const prices = centralType === 'titane' ? SURVEILLANCE_PRICES_RENTAL.titane : SURVEILLANCE_PRICES_RENTAL.jablotron;
        price = (prices as any)[priceKey] || 0;
      }
    }

    // Only auto-update if the user hasn't manually overridden the price.
    const lastAuto = lastAutoSurveillancePriceRef.current;
    const shouldAutoUpdate = surveillancePrice === 0 || lastAuto === null || surveillancePrice === lastAuto;
    if (shouldAutoUpdate) {
      lastAutoSurveillancePriceRef.current = price;
      onSurveillancePriceChange(price);
    }
  }, [surveillanceType, centralType, rentalMode, simCardSelected, surveillancePrice, onSurveillancePriceChange, onSurveillanceTypeChange, configValues]);

  const testCycliqueTotal = testCycliqueSelected ? (testCycliqueOffered ? 0 : testCycliquePrice) : 0;
  const surveillanceTotal = surveillanceType ? (surveillanceOffered ? 0 : surveillancePrice) : 0;

  return (
    <div className="quote-section">
      <h3>🔧 Services</h3>
      
      {/* Test Cyclique */}
      <div className="product-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={testCycliqueSelected}
            onChange={(e) => onTestCycliqueSelectedChange(e.target.checked)}
            className="include-checkbox"
          />
          <span>Test Cyclique</span>
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

      {/* Surveillance -- masque en mode location (Chantier: deja inclus
          dans XTO-ABO ; Location: sa propre section dediee (LOC-AUTO,
          LOC-TEL) existe deja ailleurs, redondant sinon). */}
      {!rentalMode && (
      <div className="product-line">
        <div>Service de surveillance</div>
        <select
          value={surveillanceType}
          onChange={(e) => onSurveillanceTypeChange(e.target.value)}
          className="service-select"
        >
          {getSurveillanceOptions().map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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
      )}

      {!rentalMode && !centralType && surveillanceType && (
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

