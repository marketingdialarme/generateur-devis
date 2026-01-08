/**
 * OptionsSection Component - MILESTONE 1 UPDATE
 * 
 * Handles intervention and service options for Alarm tab
 * Updated to support:
 * - Multiple Option 5 selections
 * - Intervention payante (new)
 * - Intervention police (new)
 */

interface OptionsSectionProps {
  interventionsGratuites: boolean;
  interventionsAnnee: boolean;
  interventionsQty: number;
  serviceCles: boolean;
  interventionPayante: boolean;
  interventionPayantePrice: number;
  interventionPolice: boolean;
  onInterventionsGratuitesChange: (value: boolean) => void;
  onInterventionsAnneeChange: (value: boolean) => void;
  onInterventionsQtyChange: (value: number) => void;
  onServiceClesChange: (value: boolean) => void;
  onInterventionPayanteChange: (value: boolean) => void;
  onInterventionPayantePriceChange: (value: number) => void;
  onInterventionPoliceChange: (value: boolean) => void;
}

export function OptionsSection(props: OptionsSectionProps) {
  const {
    interventionsGratuites,
    interventionsAnnee,
    interventionsQty,
    serviceCles,
    interventionPayante,
    interventionPayantePrice,
    interventionPolice,
    onInterventionsGratuitesChange,
    onInterventionsAnneeChange,
    onInterventionsQtyChange,
    onServiceClesChange,
    onInterventionPayanteChange,
    onInterventionPayantePriceChange,
    onInterventionPoliceChange,
  } = props;

  return (
    <div className="quote-section">
      <h3>⭐ Options de l&apos;offre</h3>
      <div className="options-grid" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Interventions gratuites */}
        <div className="option-item" style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          background: interventionsGratuites ? '#f0f8ff' : 'transparent',
          borderRadius: '6px',
          transition: 'all 0.2s'
        }}>
          <input
            type="checkbox"
            id="option-interventions-gratuites"
            checked={interventionsGratuites}
            onChange={(e) => {
              onInterventionsGratuitesChange(e.target.checked);
              if (e.target.checked && interventionsAnnee) {
                onInterventionsAnneeChange(false);
              }
            }}
            style={{ 
              margin: 0,
              marginRight: '12px',
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              flexShrink: 0,
              verticalAlign: 'middle'
            }}
          />
          <label
            htmlFor="option-interventions-gratuites"
            style={{ 
              cursor: 'pointer', 
              fontSize: '14px', 
              fontWeight: interventionsGratuites ? 600 : 400,
              lineHeight: '1.4',
              flex: 1,
              margin: 0,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Interventions gratuites & illimitées des agents
          </label>
        </div>

        {/* Interventions par année */}
        <div className="option-item" style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          background: interventionsAnnee ? '#f0f8ff' : 'transparent',
          borderRadius: '6px',
          transition: 'all 0.2s'
        }}>
          <input
            type="checkbox"
            id="option-interventions-annee"
            checked={interventionsAnnee}
            onChange={(e) => {
              onInterventionsAnneeChange(e.target.checked);
              if (e.target.checked && interventionsGratuites) {
                onInterventionsGratuitesChange(false);
              }
            }}
            style={{ 
              margin: 0,
              marginRight: '12px',
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              flexShrink: 0,
              verticalAlign: 'middle'
            }}
          />
          <label
            htmlFor="option-interventions-annee"
            style={{ 
              cursor: 'pointer', 
              fontSize: '14px', 
              flex: 1, 
              fontWeight: interventionsAnnee ? 600 : 400,
              lineHeight: '1.4',
              margin: 0,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Intervention par année des agents
          </label>
          {interventionsAnnee && (
            <input
              type="number"
              value={interventionsQty}
              onChange={(e) => onInterventionsQtyChange(parseInt(e.target.value) || 1)}
              onFocus={(e) => e.target.select()}
              min="1"
              max="10"
              className="quantity-input"
              style={{
                width: '70px',
                padding: '6px 8px',
                border: '2px solid #007bff',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '14px',
                flexShrink: 0
              }}
            />
          )}
        </div>

        {/* Service des clés */}
        <div className="option-item" style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          background: serviceCles ? '#f0f8ff' : 'transparent',
          borderRadius: '6px',
          transition: 'all 0.2s'
        }}>
          <input
            type="checkbox"
            id="option-service-cles"
            checked={serviceCles}
            onChange={(e) => onServiceClesChange(e.target.checked)}
            style={{ 
              margin: 0,
              marginRight: '12px',
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              flexShrink: 0,
              verticalAlign: 'middle'
            }}
          />
          <label
            htmlFor="option-service-cles"
            style={{ 
              cursor: 'pointer', 
              fontSize: '14px', 
              fontWeight: serviceCles ? 600 : 400,
              lineHeight: '1.4',
              flex: 1,
              margin: 0,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Service des clés offert
          </label>
        </div>

        {/* NEW: Intervention payante */}
        <div className="option-item" style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          background: interventionPayante ? '#f0f8ff' : 'transparent',
          borderRadius: '6px',
          transition: 'all 0.2s'
        }}>
          <input
            type="checkbox"
            id="option-intervention-payante"
            checked={interventionPayante}
            onChange={(e) => onInterventionPayanteChange(e.target.checked)}
            style={{ 
              margin: 0,
              marginRight: '12px',
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              flexShrink: 0,
              verticalAlign: 'middle'
            }}
          />
          <label
            htmlFor="option-intervention-payante"
            style={{ 
              cursor: 'pointer', 
              fontSize: '14px', 
              fontWeight: interventionPayante ? 600 : 400,
              lineHeight: '1.4',
              flex: 1,
              margin: 0,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Intervention payante
          </label>
          {interventionPayante && (
            <>
              <input
                type="number"
                value={interventionPayantePrice}
                onChange={(e) => onInterventionPayantePriceChange(parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                min="0"
                className="quantity-input"
                style={{
                  width: '80px',
                  padding: '6px 8px',
                  border: '2px solid #007bff',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '14px',
                  flexShrink: 0,
                  marginRight: '5px'
                }}
              />
              <span style={{ fontSize: '13px', color: '#6c757d' }}>CHF HT/intervention</span>
            </>
          )}
        </div>

        {/* NEW: Intervention police */}
        <div className="option-item" style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 12px',
          background: interventionPolice ? '#f0f8ff' : 'transparent',
          borderRadius: '6px',
          transition: 'all 0.2s'
        }}>
          <input
            type="checkbox"
            id="option-intervention-police"
            checked={interventionPolice}
            onChange={(e) => onInterventionPoliceChange(e.target.checked)}
            style={{ 
              margin: 0,
              marginRight: '12px',
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              flexShrink: 0,
              verticalAlign: 'middle'
            }}
          />
          <label
            htmlFor="option-intervention-police"
            style={{ 
              cursor: 'pointer', 
              fontSize: '14px', 
              fontWeight: interventionPolice ? 600 : 400,
              lineHeight: '1.4',
              flex: 1,
              margin: 0,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Intervention de la police sur levée de doute positive
          </label>
        </div>
      </div>
    </div>
  );
}
