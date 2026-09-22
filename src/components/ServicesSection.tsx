/**
 * ServicesSection Component
 * 
 * Handles Test Cyclique and Surveillance services for Alarm tab
 * Converted from script.js lines 543-817
 */

import { useEffect, useRef } from 'react';
import { CustomSelect } from './CustomSelect';

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
  centralType: string | null;
  rentalMode: boolean;
  simCardSelected: boolean; // For Titane autosurveillance pricing
  // Called whenever the selected surveillance option's "Inclu carte SIM"
  // status is known, so the separate Carte SIM + Activation checkbox
  // (Frais de dossier) can be kept in sync automatically -- checked when
  // the chosen option includes a card, unchecked when it doesn't (client
  // feedback). Optional so this component still works without it.
  onSimCardSelectedChange?: (value: boolean) => void;

  // Live prices from the Config sheet (TIT-AUTO-S-SIM, TIT-TEL-PAR, ...).
  // Falls back to the hardcoded SALE table below if a ref isn't loaded yet.
  configValues: Record<string, number>;

  // Surveillance options for ANY centrale, from Config's "Service de
  // surveillance" rows (Type/Kit_Base/REF/Variable/Valeur/"Inclu carte
  // SIM" columns) -- drives getSurveillanceOptions and the auto-price
  // effect below when non-empty, so a new centrale's options appear
  // without a code change. Empty array (not loaded yet, or the client
  // hasn't added these columns) falls back to the old hardcoded
  // Titane/Jablotron-only logic further down.
  surveillanceOptions?: { ref: string; kitBase: string; label: string; price: number; includesSimCard: boolean }[];

  // Intervention des agents de sécurité (XTO-INT, Chantier only) -- shown
  // as its own line here rather than in "Matériel supplémentaire" (client
  // request). Quantity = number of interventions.
  showChantierIntervention?: boolean;
  interventionQuantity?: number;
  interventionOffered?: boolean;
  onInterventionQuantityChange?: (value: number) => void;
  onInterventionOfferedChange?: (value: boolean) => void;
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
    onSimCardSelectedChange,
    configValues,
    surveillanceOptions = [],
    showChantierIntervention,
    interventionQuantity = 1,
    interventionOffered = false,
    onInterventionQuantityChange,
    onInterventionOfferedChange
  } = props;

  // Track the last auto-calculated price so we don't overwrite manual edits.
  const lastAutoSurveillancePriceRef = useRef<number | null>(null);

  // Available options are driven directly by Config's "Service de
  // surveillance" rows when the client has added them (Type/Kit_Base/
  // "Inclu carte SIM" columns) -- a new centrale's options then appear
  // automatically, no code change needed. Falls back to the old hardcoded
  // Titane/Jablotron-only logic when that data isn't there yet.
  const getSurveillanceOptions = () => {
    const baseOptions = [
      { value: '', label: 'Aucun' }
    ];

    if (surveillanceOptions.length > 0) {
      const matching = surveillanceOptions.filter((opt) => {
        if (opt.kitBase.toLowerCase() !== (centralType || '').toLowerCase()) return false;
        // Client feedback: don't offer the option that doesn't include a
        // SIM card (typically "sans carte SIM") once a SIM card is already
        // included elsewhere in the quote.
        if (!opt.includesSimCard && simCardSelected) return false;
        return true;
      });
      return [
        ...baseOptions,
        ...matching.map((opt) => ({ value: opt.ref, label: opt.label })),
      ];
    }

    // ---- Repli : ancienne logique figee Titane/Jablotron ----
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
    if (surveillanceOptions.length > 0) {
      // ---- Chemin generique (pilote par Config) ----
      const current = surveillanceOptions.find((o) => o.ref === surveillanceType);
      // If a SIM card gets included while the no-SIM option was selected,
      // that option just disappeared from the list — clear it rather than
      // leave the field stuck on a now-hidden value.
      if (current && !current.includesSimCard && simCardSelected) {
        onSurveillanceTypeChange('');
        return;
      }
      if (!surveillanceType) {
        onSurveillancePriceChange(0);
        lastAutoSurveillancePriceRef.current = null;
        return;
      }
      if (!current) return; // unknown ref (e.g. rental-only): keep current manual price

      // Keep the separate "Carte SIM + Activation" checkbox (Frais de
      // dossier) in sync with the chosen option -- checked if it includes
      // a card, unchecked if it doesn't (client feedback). Only acts when
      // it would actually change something, to avoid extra re-renders.
      if (onSimCardSelectedChange && current.includesSimCard !== simCardSelected) {
        onSimCardSelectedChange(current.includesSimCard);
      }

      const price = typeof configValues[current.ref] === 'number' ? configValues[current.ref] : current.price;
      const lastAuto = lastAutoSurveillancePriceRef.current;
      const shouldAutoUpdate = surveillancePrice === 0 || lastAuto === null || surveillancePrice === lastAuto;
      if (shouldAutoUpdate) {
        lastAutoSurveillancePriceRef.current = price;
        onSurveillancePriceChange(price);
      }
      return;
    }

    // ---- Repli : ancienne logique figee Titane/Jablotron ----
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
  }, [surveillanceType, centralType, rentalMode, simCardSelected, surveillancePrice, onSurveillancePriceChange, onSurveillanceTypeChange, configValues, surveillanceOptions, onSimCardSelectedChange]);

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

      {showChantierIntervention && (
        <div className="product-line">
          <div>Intervention des agents de sécurité</div>
          <input
            type="number"
            value={interventionQuantity}
            onChange={(e) => onInterventionQuantityChange?.(parseInt(e.target.value) || 1)}
            className="quantity-input"
            min="1"
          />
          <div className="checkbox-option" style={{ margin: 0 }}>
            <input
              type="checkbox"
              checked={interventionOffered}
              onChange={(e) => onInterventionOfferedChange?.(e.target.checked)}
              className="offered-checkbox"
            />
            <label style={{ margin: 0, fontSize: '12px' }}>OFFERT</label>
          </div>
          <div className="price-display">
            {interventionOffered
              ? 'OFFERT'
              : `${((configValues['XTO-INT'] ?? 175) * interventionQuantity).toFixed(2)} CHF`}
          </div>
        </div>
      )}

      {/* Surveillance -- masque en mode location (Chantier: deja inclus
          dans XTO-ABO ; Location: sa propre section dediee (LOC-AUTO,
          LOC-TEL) existe deja ailleurs, redondant sinon). */}
      {!rentalMode && (
      <div className="product-line">
        <div>Service de surveillance</div>
        <CustomSelect
          value={surveillanceType}
          onChange={(e) => onSurveillanceTypeChange(e.target.value)}
          className="service-select"
        >
          {getSurveillanceOptions().map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </CustomSelect>
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

