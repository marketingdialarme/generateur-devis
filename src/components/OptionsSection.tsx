/**
 * OptionsSection Component
 * 
 * Handles intervention and service options for Alarm tab
 * Converted from script.js lines 3306-3333
 */

interface OptionsSectionProps {
  interventionsGratuites: boolean;
  interventionsAnnee: boolean;
  interventionsQty: number;
  serviceCles: boolean;
  onInterventionsGratuitesChange: (value: boolean) => void;
  onInterventionsAnneeChange: (value: boolean) => void;
  onInterventionsQtyChange: (value: number) => void;
  onServiceClesChange: (value: boolean) => void;
}

export function OptionsSection(props: OptionsSectionProps) {
  const {
    interventionsGratuites,
    interventionsAnnee,
    interventionsQty,
    serviceCles,
    onInterventionsGratuitesChange,
    onInterventionsAnneeChange,
    onInterventionsQtyChange,
    onServiceClesChange
  } = props;

  return (
    <div className="quote-section">
      <h3>⭐ 5. Options de l&apos;offre</h3>
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
              margin: '0 12px 0 0', 
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
          transition: 'all 0.2s',
          gap: '12px'
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
              margin: '0 12px 0 0', 
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
      </div>
    </div>
  );
}

