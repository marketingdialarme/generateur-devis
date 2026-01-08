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
}

export function PaymentSelector({ selectedMonths, onSelect, label = "Mode de paiement" }: PaymentSelectorProps) {
  const options = [
    { months: 0, label: 'Comptant' },
    { months: 12, label: '12 mois' },
    { months: 24, label: '24 mois' },
    { months: 36, label: '36 mois' },
    { months: 48, label: '48 mois' },
    { months: 60, label: '60 mois' }
  ];

  return (
    <div className="quote-section">
      <h3>💳 {label}</h3>
      <div className="payment-options" style={{ 
        display: 'flex', 
        gap: '12px', 
        flexWrap: 'wrap' 
      }}>
        {options.map(({ months, label }) => (
          <div
            key={months}
            className={`payment-option ${selectedMonths === months ? 'active' : ''}`}
            onClick={() => onSelect(months)}
            style={{
              flex: '1 1 120px',
              minWidth: '120px',
              padding: '15px 20px',
              background: selectedMonths === months ? '#f4e600' : 'white',
              border: `2px solid ${selectedMonths === months ? '#f4e600' : '#e9ecef'}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: selectedMonths === months ? 600 : 400,
              fontSize: '14px'
            }}
            onMouseOver={(e) => {
              if (selectedMonths !== months) {
                e.currentTarget.style.background = '#f8f9fa';
              }
            }}
            onMouseOut={(e) => {
              if (selectedMonths !== months) {
                e.currentTarget.style.background = 'white';
              }
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

