/**
 * PaymentSelector Component
 * 
 * Handles payment mode selection (Comptant, 24/36/48 mois)
 * Converted from script.js lines 1206-1218
 */

interface PaymentSelectorProps {
  selectedMonths: number;
  onSelect: (months: number) => void;
  label?: string;
  excludeComptant?: boolean; // Option to exclude comptant for cameras
}

export function PaymentSelector({ selectedMonths, onSelect, label = "Mode de paiement", excludeComptant = false }: PaymentSelectorProps) {
  const allOptions = [
    { months: 0, label: 'Comptant' },
    { months: 12, label: '12 mois' },
    { months: 24, label: '24 mois' },
    { months: 36, label: '36 mois' },
    { months: 48, label: '48 mois' },
    { months: 60, label: '60 mois' }
  ];
  
  // Filter out comptant if requested
  const options = excludeComptant ? allOptions.filter(opt => opt.months !== 0) : allOptions;

  return (
    <div className="quote-section">
      <h3>💳 {label}</h3>
      <div className="payment-options">
        {options.map(({ months, label }) => (
          <div
            key={months}
            className={`payment-option ${selectedMonths === months ? 'active' : ''}`}
            onClick={() => onSelect(months)}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

