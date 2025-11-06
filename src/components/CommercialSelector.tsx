/**
 * CommercialSelector Component
 * 
 * Dropdown selector for commercial with "Autre" option
 * Converted from script.js lines 3961-3978
 */

interface CommercialSelectorProps {
  value: string;
  customValue: string;
  showCustom: boolean;
  onValueChange: (value: string) => void;
  onCustomValueChange: (value: string) => void;
  onShowCustomChange: (show: boolean) => void;
  commercialsList: string[];
  label?: string;
  id?: string;
}

export function CommercialSelector(props: CommercialSelectorProps) {
  const {
    value,
    customValue,
    showCustom,
    onValueChange,
    onCustomValueChange,
    onShowCustomChange,
    commercialsList,
    label = "Commercial",
    id = "commercial"
  } = props;

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'autre') {
      onShowCustomChange(true);
      onValueChange('');
    } else {
      onShowCustomChange(false);
      onValueChange(selectedValue);
      onCustomValueChange('');
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <select
          id={id}
          value={showCustom ? 'autre' : value}
          onChange={(e) => handleSelectChange(e.target.value)}
          style={{
            padding: '12px 15px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white'
          }}
        >
          <option value="">Sélectionner un commercial</option>
          {commercialsList.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
          <option value="autre" style={{ fontStyle: 'italic', color: '#007bff' }}>
            ➕ Autre (saisir le nom)
          </option>
        </select>
        
        {showCustom && (
          <input
            type="text"
            id={`${id}-custom`}
            placeholder="Entrez le nom du commercial"
            value={customValue}
            onChange={(e) => onCustomValueChange(e.target.value)}
            style={{
              padding: '12px 15px',
              border: '2px solid #007bff',
              borderRadius: '8px',
              fontSize: '14px',
              background: '#f0f8ff'
            }}
          />
        )}
      </div>
    </div>
  );
}

