'use client';

/**
 * ============================================================================
 * DEVIS FORM - Milestone 1 Implementation
 * ============================================================================
 * 
 * Complete quote generation form with all product types:
 * - Alarme (with Titane, Jablotron, XTO)
 * - Caméra de surveillance
 * - Générateur de brouillard
 * - Visiophone
 */

import { useState, useEffect } from 'react';
import { PaymentSelector } from '@/components/PaymentSelector';
import { ProductSection } from '@/components/ProductSection';
import { ProductLineData } from '@/components/ProductLine';
import {
  CATALOG_ALARM_PRODUCTS,
  CATALOG_CAMERA_MATERIAL,
  CATALOG_FOG_PRODUCTS,
  CATALOG_VISIOPHONE_PRODUCTS,
  CENTRALS_CONFIG,
  calculateMonthlyFromCashPrice,
  calculateFacilityPayment,
  roundUpToInteger,
  TVA_RATE,
  ADMIN_FEES,
} from '@/lib/quote-generator';

type ProductType = 'alarm' | 'camera' | 'fog' | 'visiophone';
type CentralType = 'titane' | 'jablotron' | 'xto' | null;
type KitMode = 'kit1' | 'kit2' | 'scratch' | null;
type SurveillanceType = 'autosurveillance' | 'telesurveillance' | null;

interface AlarmOptions {
  interventionPayante: boolean;
  interventionPayantePrice: number;
  interventionPolice: boolean;
  telesurveillanceOption: boolean;
}

interface CameraOptions {
  visionDistance: boolean;
  visionDistancePrice: number;
  maintenance: boolean;
  maintenancePrice: number;
  modemSelected: boolean;
}

export default function DevisForm() {
  // Tab state
  const [activeTab, setActiveTab] = useState<ProductType>('alarm');

  // Global state
  const [paymentMonths, setPaymentMonths] = useState(48);
  const [engagementMonths, setEngagementMonths] = useState(48);

  // Alarm state
  const [centralType, setCentralType] = useState<CentralType>(null);
  const [kitMode, setKitMode] = useState<KitMode>(null);
  const [surveillanceType, setSurveillanceType] = useState<SurveillanceType>(null);
  const [surveillancePrice, setSurveillancePrice] = useState(0);
  const [alarmLines, setAlarmLines] = useState<ProductLineData[]>([]);
  const [alarmInstallationOffered, setAlarmInstallationOffered] = useState(true);
  const [alarmInstallationPrice, setAlarmInstallationPrice] = useState(300);
  const [alarmInstallationInMonthly, setAlarmInstallationInMonthly] = useState(false);
  const [alarmOptions, setAlarmOptions] = useState<AlarmOptions>({
    interventionPayante: false,
    interventionPayantePrice: 149,
    interventionPolice: false,
    telesurveillanceOption: false,
  });

  // Camera state
  const [cameraLines, setCameraLines] = useState<ProductLineData[]>([]);
  const [cameraInstallationType, setCameraInstallationType] = useState<'half' | 'full'>('half');
  const [cameraInstallationOffered, setCameraInstallationOffered] = useState(false);
  const [cameraOptions, setCameraOptions] = useState<CameraOptions>({
    visionDistance: false,
    visionDistancePrice: 0,
    maintenance: false,
    maintenancePrice: 0,
    modemSelected: false,
  });

  // Fog generator state
  const [fogLines, setFogLines] = useState<ProductLineData[]>([
    {
      id: Date.now(),
      product: CATALOG_FOG_PRODUCTS.find(p => p.id === 200) || null,
      quantity: 1,
      offered: true,
    },
    {
      id: Date.now() + 1,
      product: CATALOG_FOG_PRODUCTS.find(p => p.id === 201) || null,
      quantity: 1,
      offered: true,
    },
    {
      id: Date.now() + 2,
      product: CATALOG_FOG_PRODUCTS.find(p => p.id === 202) || null,
      quantity: 1,
      offered: true,
    },
  ]);
  const [fogInstallationPrice, setFogInstallationPrice] = useState(490);
  const [fogProcessingFee, setFogProcessingFee] = useState(190);
  const [fogSimCard, setFogSimCard] = useState(50);

  // Visiophone state
  const [visiophoLines, setVisiophoLines] = useState<ProductLineData[]>([
    {
      id: Date.now(),
      product: CATALOG_VISIOPHONE_PRODUCTS.find(p => p.id === 300) || null,
      quantity: 1,
      offered: false,
    },
    {
      id: Date.now() + 1,
      product: CATALOG_VISIOPHONE_PRODUCTS.find(p => p.id === 301) || null,
      quantity: 1,
      offered: false,
    },
  ]);
  const [visiophoInstallationPrice, setVisiophoInstallationPrice] = useState(690);

  // Auto-check vision distance if MODEM selected
  useEffect(() => {
    const hasModem = cameraLines.some(
      (line) => line.product && line.product.name.toLowerCase().includes('modem')
    );
    if (hasModem && !cameraOptions.modemSelected) {
      setCameraOptions((prev) => ({ ...prev, modemSelected: true, visionDistance: true }));
    } else if (!hasModem && cameraOptions.modemSelected) {
      setCameraOptions((prev) => ({ ...prev, modemSelected: false }));
    }
  }, [cameraLines]);

  // Auto-calculate vision à distance price
  useEffect(() => {
    if (!cameraOptions.visionDistance) {
      setCameraOptions(prev => ({ ...prev, visionDistancePrice: 0 }));
      return;
    }

    // Count 4G cameras
    const fourGCameras = cameraLines.filter(
      (line) => line.product && line.product.name.includes('4G')
    ).reduce((sum, line) => sum + line.quantity, 0);

    // Count classic cameras (if modem selected)
    let classicCameras = 0;
    if (cameraOptions.modemSelected) {
      classicCameras = cameraLines.filter(
        (line) =>
          line.product &&
          !line.product.name.includes('4G') &&
          !line.product.name.includes('NVR') &&
          !line.product.name.toLowerCase().includes('modem') &&
          (line.product.name.toLowerCase().includes('caméra') ||
            line.product.name.includes('Bullet') ||
            line.product.name.includes('Dôme') ||
            line.product.name.includes('Solar'))
      ).reduce((sum, line) => sum + line.quantity, 0);
    }

    const totalPrice = (fourGCameras + classicCameras) * 20;
    setCameraOptions((prev) => ({ ...prev, visionDistancePrice: totalPrice }));
  }, [cameraLines, cameraOptions.visionDistance, cameraOptions.modemSelected]);

  // Auto-calculate maintenance price
  useEffect(() => {
    if (!cameraOptions.maintenance) {
      setCameraOptions(prev => ({ ...prev, maintenancePrice: 0 }));
      return;
    }

    // Count cameras
    const cameraCount = cameraLines.filter(
      (line) =>
        line.product &&
        (line.product.name.toLowerCase().includes('caméra') ||
          line.product.name.includes('Bullet') ||
          line.product.name.includes('Dôme') ||
          line.product.name.includes('Solar') ||
          line.product.name.includes('PTZ'))
    ).reduce((sum, line) => sum + line.quantity, 0);

    // Count NVRs
    const nvrCount = cameraLines.filter(
      (line) => line.product && line.product.name.includes('NVR')
    ).reduce((sum, line) => sum + line.quantity, 0);

    const totalItems = cameraCount + nvrCount;
    const pricePerItem = totalItems >= 5 ? 5 : 10;
    const totalPrice = totalItems * pricePerItem;

    setCameraOptions((prev) => ({ ...prev, maintenancePrice: totalPrice }));
  }, [cameraLines, cameraOptions.maintenance]);

  // Load kit products when kit is selected
  const loadKit = (central: 'titane' | 'jablotron', kit: 'kit1' | 'kit2') => {
    const config = CENTRALS_CONFIG[central];
    const kitConfig = config.kits[kit];

    const newLines: ProductLineData[] = kitConfig.products.map((p, index) => {
      const product = CATALOG_ALARM_PRODUCTS.find((prod) => prod.id === p.id);
      return {
        id: Date.now() + index,
        product: product || null,
        quantity: p.quantity,
        offered: false,
      };
    });

    setAlarmLines(newLines);
    setKitMode(kit);
  };

  // Calculate totals (simplified for now - full implementation needed)
  const calculateTotal = () => {
    // This is a placeholder - full calculation logic needed
    return 0;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>
        Générateur de Devis Dialarme
      </h1>

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #e9ecef', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[
            { id: 'alarm', label: '🚨 Alarme' },
            { id: 'camera', label: '📹 Caméra' },
            { id: 'fog', label: '💨 Brouillard' },
            { id: 'visiophone', label: '📞 Visiophone' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProductType)}
              style={{
                padding: '15px 25px',
                background: activeTab === tab.id ? '#f4e600' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #f4e600' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: '16px',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Payment Settings */}
      <PaymentSelector
        selectedMonths={paymentMonths}
        onSelect={setPaymentMonths}
        label="Mode de paiement"
      />

      <div className="quote-section">
        <label htmlFor="engagement" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
          Durée d'engagement (mois)
        </label>
        <select
          id="engagement"
          value={engagementMonths}
          onChange={(e) => setEngagementMonths(parseInt(e.target.value))}
          style={{
            width: '200px',
            padding: '10px',
            border: '2px solid #e9ecef',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          <option value={12}>12 mois</option>
          <option value={24}>24 mois</option>
          <option value={36}>36 mois</option>
          <option value={48}>48 mois</option>
          <option value={60}>60 mois</option>
        </select>
      </div>

      {/* Alarm Tab */}
      {activeTab === 'alarm' && (
        <div>
          <div className="quote-section">
            <h3>Choix Kit de base</h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setCentralType('titane')}
                style={{
                  padding: '20px',
                  background: centralType === 'titane' ? '#fffef0' : 'white',
                  border: `2px solid ${centralType === 'titane' ? '#f4e600' : '#e9ecef'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  flex: '1 1 200px',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '5px' }}>Alarme Titane</div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>690 CHF</div>
              </button>
              <button
                onClick={() => setCentralType('jablotron')}
                style={{
                  padding: '20px',
                  background: centralType === 'jablotron' ? '#f8f9fa' : 'white',
                  border: `2px solid ${centralType === 'jablotron' ? '#6c757d' : '#e9ecef'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  flex: '1 1 200px',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '5px' }}>Alarme Jablotron</div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>990 CHF</div>
              </button>
              <button
                onClick={() => setCentralType('xto')}
                style={{
                  padding: '20px',
                  background: centralType === 'xto' ? '#e3f2fd' : 'white',
                  border: `2px solid ${centralType === 'xto' ? '#2196f3' : '#e9ecef'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  flex: '1 1 200px',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '5px' }}>Kit XTO</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  Centrale + Sirène + 4 Caméras + Lecteur badge
                </div>
              </button>
            </div>
          </div>

          {centralType && (
            <>
              {/* Kit Selection for Titane/Jablotron */}
              {(centralType === 'titane' || centralType === 'jablotron') && (
                <div className="quote-section">
                  <h3>Choix de configuration</h3>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => loadKit(centralType as 'titane' | 'jablotron', 'kit1')}
                      style={{
                        padding: '15px 20px',
                        background: kitMode === 'kit1' ? '#f4e600' : 'white',
                        border: `2px solid ${kitMode === 'kit1' ? '#f4e600' : '#e9ecef'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: kitMode === 'kit1' ? 600 : 400,
                      }}
                    >
                      📦 Kit 1
                    </button>
                    <button
                      onClick={() => loadKit(centralType as 'titane' | 'jablotron', 'kit2')}
                      style={{
                        padding: '15px 20px',
                        background: kitMode === 'kit2' ? '#f4e600' : 'white',
                        border: `2px solid ${kitMode === 'kit2' ? '#f4e600' : '#e9ecef'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: kitMode === 'kit2' ? 600 : 400,
                      }}
                    >
                      📦 Kit 2
                    </button>
                    <button
                      onClick={() => {
                        setKitMode('scratch');
                        setAlarmLines([]);
                      }}
                      style={{
                        padding: '15px 20px',
                        background: kitMode === 'scratch' ? '#e3f2fd' : 'white',
                        border: `2px solid ${kitMode === 'scratch' ? '#2196f3' : '#e9ecef'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: kitMode === 'scratch' ? 600 : 400,
                      }}
                    >
                      ➕ Créer à partir de rien
                    </button>
                  </div>
                </div>
              )}

              {/* Surveillance Type Choice for Custom Kits */}
              {kitMode === 'scratch' && (centralType === 'titane' || centralType === 'jablotron') && (
                <div className="quote-section">
                  <h3>Type de surveillance</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="radio"
                        name="surveillance"
                        checked={surveillanceType === 'autosurveillance'}
                        onChange={() => setSurveillanceType('autosurveillance')}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: 500 }}>Autosurveillance</span>
                      {surveillanceType === 'autosurveillance' && (
                        <input
                          type="number"
                          value={surveillancePrice}
                          onChange={(e) => setSurveillancePrice(parseFloat(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          placeholder="Prix (CHF/mois)"
                          style={{
                            width: '120px',
                            padding: '8px',
                            border: '2px solid #007bff',
                            borderRadius: '6px',
                            marginLeft: '10px',
                          }}
                        />
                      )}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="radio"
                        name="surveillance"
                        checked={surveillanceType === 'telesurveillance'}
                        onChange={() => setSurveillanceType('telesurveillance')}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: 500 }}>Télésurveillance</span>
                      {surveillanceType === 'telesurveillance' && (
                        <input
                          type="number"
                          value={surveillancePrice}
                          onChange={(e) => setSurveillancePrice(parseFloat(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          placeholder="Prix (CHF/mois)"
                          style={{
                            width: '120px',
                            padding: '8px',
                            border: '2px solid #007bff',
                            borderRadius: '6px',
                            marginLeft: '10px',
                          }}
                        />
                      )}
                    </label>
                  </div>
                </div>
              )}

              <ProductSection
                title="Matériel supplémentaire"
                lines={alarmLines}
                productCatalog={CATALOG_ALARM_PRODUCTS.filter((p) => p.id !== 5 && p.id !== 6)}
                centralType={centralType === 'xto' ? null : (centralType as 'titane' | 'jablotron')}
                onLinesChange={setAlarmLines}
                emoji="📦"
              />

              <div className="quote-section">
                <h3>Installation</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        checked={alarmInstallationOffered}
                        onChange={(e) => setAlarmInstallationOffered(e.target.checked)}
                        style={{ marginRight: '8px' }}
                      />
                      Offert
                    </label>
                  </div>
                  <div>
                    <label style={{ marginRight: '8px' }}>Prix (CHF):</label>
                    <input
                      type="number"
                      value={alarmInstallationPrice}
                      onChange={(e) => setAlarmInstallationPrice(parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      style={{
                        width: '100px',
                        padding: '8px',
                        border: '2px solid #e9ecef',
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={alarmInstallationInMonthly}
                      onChange={(e) => setAlarmInstallationInMonthly(e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    Inclure le prix de l'installation dans les mensualités
                  </label>
                </div>
              </div>

              <div className="quote-section">
                <h3>⭐ Options de l'offre</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={alarmOptions.interventionPayante}
                      onChange={(e) =>
                        setAlarmOptions({ ...alarmOptions, interventionPayante: e.target.checked })
                      }
                      style={{ marginRight: '10px' }}
                    />
                    Intervention payante
                    {alarmOptions.interventionPayante && (
                      <input
                        type="number"
                        value={alarmOptions.interventionPayantePrice}
                        onChange={(e) =>
                          setAlarmOptions({
                            ...alarmOptions,
                            interventionPayantePrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        onFocus={(e) => e.target.select()}
                        style={{
                          width: '80px',
                          marginLeft: '10px',
                          padding: '5px',
                          border: '2px solid #007bff',
                          borderRadius: '4px',
                        }}
                      />
                    )}
                    {alarmOptions.interventionPayante && <span style={{ marginLeft: '5px' }}>CHF HT / intervention</span>}
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={alarmOptions.interventionPolice}
                      onChange={(e) =>
                        setAlarmOptions({ ...alarmOptions, interventionPolice: e.target.checked })
                      }
                      style={{ marginRight: '10px' }}
                    />
                    Intervention de la police sur levée de doute positive
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={alarmOptions.telesurveillanceOption}
                      onChange={(e) =>
                        setAlarmOptions({ ...alarmOptions, telesurveillanceOption: e.target.checked })
                      }
                      style={{ marginRight: '10px' }}
                    />
                    Télésurveillance (99 CHF / 48 mois)
                  </label>
                </div>
              </div>

              {centralType === 'titane' && (
                <div className="quote-section">
                  <h3>📡 Titane - Autosurveillance</h3>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 600 }}>Sans carte SIM</div>
                      <div style={{ fontSize: '20px', color: '#007bff', marginTop: '5px' }}>59 CHF/mois</div>
                    </div>
                    <div style={{ padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 600 }}>Avec carte SIM</div>
                      <div style={{ fontSize: '20px', color: '#007bff', marginTop: '5px' }}>64 CHF/mois</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Camera Tab */}
      {activeTab === 'camera' && (
        <div>
          <ProductSection
            title="Matériel"
            lines={cameraLines}
            productCatalog={CATALOG_CAMERA_MATERIAL}
            centralType={null}
            onLinesChange={setCameraLines}
            emoji="📹"
          />

          <div className="quote-section">
            <h3>Installation</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <label>
                <input
                  type="radio"
                  checked={cameraInstallationType === 'half'}
                  onChange={() => setCameraInstallationType('half')}
                  style={{ marginRight: '8px' }}
                />
                Demi-journée (690 CHF)
              </label>
              <label>
                <input
                  type="radio"
                  checked={cameraInstallationType === 'full'}
                  onChange={() => setCameraInstallationType('full')}
                  style={{ marginRight: '8px' }}
                />
                Journée complète (1290 CHF)
              </label>
            </div>
            <label>
              <input
                type="checkbox"
                checked={cameraInstallationOffered}
                onChange={(e) => setCameraInstallationOffered(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Installation offerte
            </label>
          </div>

          <div className="quote-section">
            <h3>Options</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={cameraOptions.visionDistance}
                  onChange={(e) =>
                    setCameraOptions({ ...cameraOptions, visionDistance: e.target.checked })
                  }
                  style={{ marginRight: '10px' }}
                  disabled={cameraOptions.modemSelected}
                />
                Vision à distance
                {cameraOptions.modemSelected && <span style={{ marginLeft: '10px', color: '#6c757d', fontSize: '13px' }}>(Auto-coché car MODEM sélectionné)</span>}
              </label>
              
              {cameraOptions.visionDistance && cameraOptions.visionDistancePrice > 0 && (
                <div style={{ 
                  marginLeft: '30px', 
                  padding: '10px', 
                  background: '#f0f8ff', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  <strong>Prix calculé:</strong> {cameraOptions.visionDistancePrice} CHF/mois
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                    (20 CHF par caméra avec vision à distance)
                  </div>
                </div>
              )}

              <label>
                <input
                  type="checkbox"
                  checked={cameraOptions.maintenance}
                  onChange={(e) =>
                    setCameraOptions({ ...cameraOptions, maintenance: e.target.checked })
                  }
                  style={{ marginRight: '10px' }}
                />
                Contrat de maintenance
              </label>

              {cameraOptions.maintenance && cameraOptions.maintenancePrice > 0 && (
                <div style={{ 
                  marginLeft: '30px', 
                  padding: '10px', 
                  background: '#f0f8ff', 
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  <strong>Prix calculé:</strong> {cameraOptions.maintenancePrice} CHF/mois
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                    {(() => {
                      const cameraCount = cameraLines.filter(
                        (line) =>
                          line.product &&
                          (line.product.name.toLowerCase().includes('caméra') ||
                            line.product.name.includes('Bullet') ||
                            line.product.name.includes('Dôme') ||
                            line.product.name.includes('Solar') ||
                            line.product.name.includes('PTZ'))
                      ).reduce((sum, line) => sum + line.quantity, 0);
                      
                      const nvrCount = cameraLines.filter(
                        (line) => line.product && line.product.name.includes('NVR')
                      ).reduce((sum, line) => sum + line.quantity, 0);
                      
                      const total = cameraCount + nvrCount;
                      const rate = total >= 5 ? 5 : 10;
                      
                      return `${total} items × ${rate} CHF/mois`;
                    })()}
                  </div>
                </div>
              )}
            </div>

            {!cameraOptions.modemSelected && !cameraOptions.visionDistance && (
              <div
                style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                ⚠️ <strong>Attention:</strong> Si le client ne souscrit pas la vision à distance par le biais de Dialarme,
                la société Dialarme décline toutes responsabilités dû aux pertes de connexion à distance des caméras.
                Un forfait unique de CHF 150 HT par déplacement sera facturé au client pour la remise en réseau des caméras.
                Si le client prend la vision à distance, un Modem sera facturé en plus à CHF 290.-HT.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fog Generator Tab */}
      {activeTab === 'fog' && (
        <div>
          <div className="quote-section">
            <h3>Kit de base</h3>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
              Kit de base prédéfini (tout coché en offert par défaut)
            </p>
          </div>

          <ProductSection
            title="Installation & Matériel supplémentaire"
            lines={fogLines}
            productCatalog={CATALOG_FOG_PRODUCTS}
            centralType={null}
            onLinesChange={setFogLines}
            emoji="💨"
          />

          <div className="quote-section">
            <h3>Installation et paramétrage</h3>
            <input
              type="number"
              value={fogInstallationPrice}
              onChange={(e) => setFogInstallationPrice(parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              style={{
                width: '120px',
                padding: '10px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
              }}
            />
            <span style={{ marginLeft: '10px' }}>CHF</span>
          </div>

          <div className="quote-section">
            <h3>Frais de dossier</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Frais de dossier</label>
                <input
                  type="number"
                  value={fogProcessingFee}
                  onChange={(e) => setFogProcessingFee(parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  style={{
                    width: '100px',
                    padding: '8px',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                  }}
                />
                <span style={{ marginLeft: '8px' }}>CHF</span>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Carte SIM</label>
                <input
                  type="number"
                  value={fogSimCard}
                  onChange={(e) => setFogSimCard(parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  style={{
                    width: '100px',
                    padding: '8px',
                    border: '2px solid #e9ecef',
                    borderRadius: '6px',
                  }}
                />
                <span style={{ marginLeft: '8px' }}>CHF</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visiophone Tab */}
      {activeTab === 'visiophone' && (
        <div>
          <ProductSection
            title="Matériel"
            lines={visiophoLines}
            productCatalog={CATALOG_VISIOPHONE_PRODUCTS}
            centralType={null}
            onLinesChange={setVisiophoLines}
            emoji="📞"
            showAddButton={false}
          />

          <div className="quote-section">
            <h3>Installation et paramétrage</h3>
            <input
              type="number"
              value={visiophoInstallationPrice}
              onChange={(e) => setVisiophoInstallationPrice(parseFloat(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              style={{
                width: '120px',
                padding: '10px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
              }}
            />
            <span style={{ marginLeft: '10px' }}>CHF</span>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button
          onClick={() => alert('PDF generation to be implemented')}
          style={{
            padding: '15px 40px',
            background: '#f4e600',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          📄 Générer le devis
        </button>
      </div>
    </div>
  );
}

