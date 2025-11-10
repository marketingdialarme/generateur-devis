'use client';

/**
 * ============================================================================
 * CREATE DEVIS PAGE - Fully Integrated with React Hooks
 * ============================================================================
 * 
 * Complete integration of all migrated functionality:
 * - useQuoteGenerator: Main state management
 * - useQuoteCalculations: Real-time calculations
 * - usePdfGenerator: PDF generation
 * - usePdfAssembly: PDF assembly with base documents
 * - useQuoteSender: Email & Drive upload
 * 
 * Replaces old script.js with modern React architecture
 * ============================================================================
 */

import { useState, useEffect, useMemo } from 'react';
import { usePdfGenerator } from '@/hooks/usePdfGenerator';
import { usePdfAssembly } from '@/hooks/usePdfAssembly';
import { useQuoteSender } from '@/hooks/useQuoteSender';
import { collectAllProducts } from '@/lib/product-collector';
import { getCommercialInfo } from '@/lib/config';
import { calculateAlarmTotals, calculateCameraTotals } from '@/lib/calculations';
import { CATALOG_ALARM_PRODUCTS, CATALOG_CAMERA_MATERIAL, UNINSTALL_PRICE } from '@/lib/quote-generator';
import { ProductLineData } from '@/components/ProductLine';
import { ProductSection } from '@/components/ProductSection';
import { CommercialSelector } from '@/components/CommercialSelector';
import { ServicesSection } from '@/components/ServicesSection';
import { OptionsSection } from '@/components/OptionsSection';
import { PaymentSelector } from '@/components/PaymentSelector';
import { detectCentralType, calculateCameraInstallation, toCalcFormat } from '@/lib/product-line-adapter';

// Commercial list
const COMMERCIALS_LIST = [
  "Arnaud Bloch",
  "Benali Kodad",
  "Bryan Debrosse",
  "Cédric Boldron",
  "Emin Comert",
  "Gérald Clausen",
  "Heythem Ziaya",
  "Iyed Baccouche",
  "Matys Goiot",
  "Mohamed Tartik",
  "Nassim Jaza",
  "Nora Sassi",
  "Rodolphe De Vito",
  "Samir Ouhameni",
  "Thilan Curt",
  "Thomas Garcia",
  "Wassim Tahiri"
];

export default function CreateDevisPage() {
  const [mounted, setMounted] = useState(false);
  
  // Client info state
  const [clientName, setClientName] = useState('');
  const [commercial, setCommercial] = useState('');
  const [customCommercial, setCustomCommercial] = useState('');
  const [showCustomCommercial, setShowCustomCommercial] = useState(false);
  
  // Product lines state - now using ProductLineData type
  const [alarmMaterialLines, setAlarmMaterialLines] = useState<ProductLineData[]>([]);
  const [alarmInstallationLines, setAlarmInstallationLines] = useState<ProductLineData[]>([]);
  const [cameraMaterialLines, setCameraMaterialLines] = useState<ProductLineData[]>([]);
  
  // Discounts state
  const [alarmMaterialDiscount, setAlarmMaterialDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  const [alarmInstallationDiscount, setAlarmInstallationDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  const [cameraMaterialDiscount, setCameraMaterialDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  
  // Installation state
  const [alarmInstallationQty, setAlarmInstallationQty] = useState(1);
  const [alarmInstallationOffered, setAlarmInstallationOffered] = useState(false);
  const [cameraInstallationQty, setCameraInstallationQty] = useState(1);
  const [cameraInstallationOffered, setCameraInstallationOffered] = useState(false);

  // Auto-calculate camera installation price: 690 + (cameras × 140)
  const cameraInstallationPrice = useMemo(() => {
    return calculateCameraInstallation(cameraMaterialLines);
  }, [cameraMaterialLines]);
  
  // Admin fees state
  const [simcardOffered, setSimcardOffered] = useState(false);
  const [processingOffered, setProcessingOffered] = useState(false);
  
  // Services state
  const [testCycliqueSelected, setTestCycliqueSelected] = useState(true);
  const [testCycliquePrice, setTestCycliquePrice] = useState(0);
  const [testCycliqueOffered, setTestCycliqueOffered] = useState(true);
  const [surveillanceType, setSurveillanceType] = useState('');
  const [surveillancePrice, setSurveillancePrice] = useState(0);
  const [surveillanceOffered, setSurveillanceOffered] = useState(false);

  // Options state
  const [interventionsGratuites, setInterventionsGratuites] = useState(false);
  const [interventionsAnnee, setInterventionsAnnee] = useState(false);
  const [interventionsQty, setInterventionsQty] = useState(1);
  const [serviceCles, setServiceCles] = useState(false);
  
  // Camera options state
  const [cameraRemoteAccess, setCameraRemoteAccess] = useState(false);
  
  // Payment state
  const [alarmPaymentMonths, setAlarmPaymentMonths] = useState(48);
  const [cameraPaymentMonths, setCameraPaymentMonths] = useState(48);
  
  // Rental mode state (local)
  const [alarmRentalMode, setAlarmRentalMode] = useState(false);
  const [cameraRentalMode, setCameraRentalMode] = useState(false);
  
  // Tab state (local - simpler than using the hook)
  const [currentTab, setCurrentTab] = useState<'alarm' | 'camera'>('alarm');
  
  // Kit modal state
  const [showKitModal, setShowKitModal] = useState(false);
  
  // Auto-detect selected central from product lines
  const selectedCentral = useMemo(() => {
    return detectCentralType(alarmMaterialLines);
  }, [alarmMaterialLines]);
  
  // Apply kit function
  const applyKit = (centralType: 'titane' | 'jablotron', kitType: 'kit1' | 'kit2') => {
    const centralProduct = CATALOG_ALARM_PRODUCTS.find(p => 
      centralType === 'jablotron' ? p.id === 5 : p.id === 6
    );
    
    const kit1Products = [
      { id: 8, quantity: 2 }, // 2 Détecteurs volumétriques
      { id: 10, quantity: 1 }, // 1 Détecteur d'ouverture
      { id: 7, quantity: 1 }, // 1 Clavier
      { id: 18, quantity: 1 }, // 1 Sirène
    ];
    
    const kit2Products = [
      { id: 8, quantity: 1 }, // 1 Détecteur volumétrique
      { id: 10, quantity: 3 }, // 3 Détecteurs d'ouverture
      { id: 7, quantity: 1 }, // 1 Clavier
      { id: 18, quantity: 1 }, // 1 Sirène
    ];
    
    const kitProducts = kitType === 'kit1' ? kit1Products : kit2Products;
    
    const newLines: ProductLineData[] = [];

    // Add central
    if (centralProduct) {
      newLines.push({
        id: Date.now(),
        product: centralProduct,
        quantity: 1,
        offered: true
      });
    }
    
    // Add kit products
    kitProducts.forEach((kp, index) => {
      const product = CATALOG_ALARM_PRODUCTS.find(p => p.id === kp.id);
      if (product) {
        newLines.push({
          id: Date.now() + index + 1,
          product,
          quantity: kp.quantity,
          offered: true
        });
      }
    });
    
    setAlarmMaterialLines(newLines);
    setShowKitModal(false);
  };

  // Calculate alarm totals with default values
  const alarmTotals = useMemo(() => {
    try {
      return calculateAlarmTotals(
        alarmMaterialLines,
        alarmInstallationLines,
        alarmMaterialDiscount,
        alarmInstallationDiscount,
        {
          quantity: alarmInstallationQty,
          isOffered: alarmInstallationOffered,
          price: 690
        },
        {
          simCardOffered: simcardOffered,
          processingOffered: processingOffered
        },
        {
          testCyclique: { 
            selected: testCycliqueSelected, 
            offered: testCycliqueOffered, 
            price: testCycliquePrice 
          },
          surveillance: { 
            type: surveillanceType, 
            price: surveillancePrice, 
            offered: surveillanceOffered 
          }
        },
        alarmPaymentMonths,
        alarmRentalMode,
        selectedCentral,
        CATALOG_ALARM_PRODUCTS
      );
    } catch (error) {
      console.error('Error calculating alarm totals:', error);
      return {
        material: { subtotal: 0, discount: 0, total: 0, totalBeforeDiscount: 0, discountDisplay: '' },
        installation: { subtotal: 0, discount: 0, total: 0, totalBeforeDiscount: 0, discountDisplay: '' },
        adminFees: { simCard: 0, processing: 0, total: 0 },
        services: { testCyclique: 0, surveillance: 0 },
        totalHT: alarmInstallationOffered ? 0 : 690 * alarmInstallationQty,
        totalTTC: alarmInstallationOffered ? 0 : 690 * alarmInstallationQty * 1.081
      };
    }
  }, [
    alarmMaterialLines,
    alarmInstallationLines,
    alarmMaterialDiscount,
    alarmInstallationDiscount,
    alarmInstallationQty,
    alarmInstallationOffered,
    simcardOffered,
    processingOffered,
    testCycliqueSelected,
    testCycliquePrice,
    testCycliqueOffered,
    surveillanceType,
    surveillancePrice,
    surveillanceOffered,
    alarmPaymentMonths,
    alarmRentalMode,
    selectedCentral
  ]);
  
  // Calculate camera totals with default values
  const cameraTotals = useMemo(() => {
    try {
      return calculateCameraTotals(
        cameraMaterialLines,
        cameraMaterialDiscount,
        {
          quantity: cameraInstallationQty,
          isOffered: cameraInstallationOffered,
          price: cameraInstallationPrice
        },
        cameraRemoteAccess,
        cameraPaymentMonths,
        cameraRentalMode,
        CATALOG_CAMERA_MATERIAL
      );
    } catch (error) {
      console.error('Error calculating camera totals:', error);
      return {
        material: { subtotal: 0, discount: 0, total: 0, totalBeforeDiscount: 0, discountDisplay: '' },
        installation: { total: 0, isOffered: false },
        remoteAccess: { enabled: false, price: 0 },
        totalHT: cameraInstallationOffered ? 0 : cameraInstallationPrice * cameraInstallationQty,
        totalTTC: cameraInstallationOffered ? 0 : cameraInstallationPrice * cameraInstallationQty * 1.081
      };
    }
  }, [
    cameraMaterialLines,
    cameraMaterialDiscount,
    cameraInstallationQty,
    cameraInstallationOffered,
    cameraInstallationPrice,
    cameraRemoteAccess,
    cameraPaymentMonths,
    cameraRentalMode
  ]);
      
  const { generatePDF, isGenerating: isPdfGenerating, error: pdfError } = usePdfGenerator();
  const { assemblePdf, isAssembling, progress: assemblyProgress, error: assemblyError } = usePdfAssembly();
  const { sendQuote, isSending, progress: sendProgress, error: sendError } = useQuoteSender();
  
  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Debug log
  useEffect(() => {
    if (mounted) {
      console.log('Page mounted, currentTab:', currentTab);
      console.log('Alarm totals:', alarmTotals);
    }
  }, [mounted, currentTab, alarmTotals]);
  
  // Get current date
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('fr-CH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle commercial selection
  const handleCommercialSelection = (value: string) => {
    if (value === 'autre') {
      setShowCustomCommercial(true);
      setCommercial('');
      } else {
      setShowCustomCommercial(false);
      setCommercial(value);
      }
  };
  
  // Handle generate and send quote
  const handleGenerateAndSend = async () => {
    try {
      // Validate inputs
      const finalClientName = currentTab === 'alarm' ? clientName : clientName;
      const finalCommercial = showCustomCommercial ? customCommercial : commercial;
      
      if (!finalClientName) {
        alert('Veuillez entrer le nom du client');
        return;
      }
      
      if (!finalCommercial) {
        alert('Veuillez sélectionner un commercial');
        return;
      }
      
      // Get commercial info
      const commercialInfo = getCommercialInfo(finalCommercial);
      if (!commercialInfo) {
        alert('Informations du commercial introuvables');
        return;
      }
      
      // Step 1: Generate PDF
      console.log('🔄 Step 1: Generating PDF...');
      const totals = currentTab === 'alarm' ? alarmTotals : cameraTotals;
      
      const generatedPdf = await generatePDF({
        type: currentTab === 'alarm' ? 'alarm' : 'camera',
        clientName: finalClientName,
        commercial: finalCommercial,
        isRental: currentTab === 'alarm' ? alarmRentalMode : cameraRentalMode,
        materialLines: currentTab === 'alarm' ? alarmMaterialLines : cameraMaterialLines,
        installationLines: currentTab === 'alarm' ? alarmInstallationLines : [],
        totals: totals as any,
        paymentMonths: currentTab === 'alarm' ? alarmPaymentMonths : cameraPaymentMonths
      });
      
      // Step 2: Collect products for assembly
      console.log('🔄 Step 2: Collecting products...');
      const allProductLines = currentTab === 'alarm' 
        ? { material: alarmMaterialLines, installation: alarmInstallationLines }
        : { material: cameraMaterialLines, installation: [] };
      const products = collectAllProducts(allProductLines);
      
      // Step 3: Assemble PDF (add base docs, product sheets, overlay)
      console.log('🔄 Step 3: Assembling PDF...');
      const assembled = await assemblePdf({
        pdfBlob: generatedPdf.blob,
        quoteType: currentTab === 'alarm' ? 'alarme' : 'video',
        centralType: selectedCentral || null,
        products,
        commercial: {
          name: finalCommercial,
          phone: commercialInfo.phone,
          email: commercialInfo.email
        }
      });
      
      // Step 4: Send quote (upload to Drive, send email, log to DB)
      console.log('🔄 Step 4: Sending quote...');
      const filename = `devis-${finalClientName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      
      const result = await sendQuote({
        pdfBlob: assembled.blob,
        filename,
        commercial: finalCommercial,
        clientName: finalClientName,
        type: currentTab === 'alarm' ? 'alarme' : 'video',
        centralType: selectedCentral || undefined,
        products,
        assemblyInfo: assembled.info
      });
      
      if (result.success) {
        alert(`✅ Devis envoyé avec succès!\n\n📁 Lien Drive: ${result.driveLink}\n📧 Email envoyé: ${result.emailSent ? 'Oui' : 'Non'}\n📊 Enregistré: ${result.logged ? 'Oui' : 'Non'}`);
      } else {
        alert(`❌ Erreur lors de l'envoi: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Error in generate and send:', error);
      alert(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };
  
  // Show loading state
  if (!mounted) {
    return null;
    }

  const isProcessing = isPdfGenerating || isAssembling || isSending;
  const currentProgress = isPdfGenerating 
    ? 'Génération du PDF...' 
    : isAssembling 
    ? assemblyProgress 
    : isSending 
    ? sendProgress 
    : '';

  return (
    <div className="container">
        {/* Header */}
      <div className="header">
        <div className="logo">
          <div className="logo-img">D</div>
          <div className="company-info">
            <h1>Dialarme</h1>
            <p>Générateur de devis professionnel</p>
          </div>
        </div>
        <div>
          <span id="currentDate">{getCurrentDate()}</span>
        </div>
        </div>

      {/* Progress Indicator */}
      {isProcessing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '15px',
          textAlign: 'center',
          zIndex: 9999,
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          ⏳ {currentProgress}
        </div>
      )}

      {/* Error Display */}
      {(pdfError || assemblyError || sendError) && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          margin: '20px 0',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ Erreur: {pdfError || assemblyError || sendError}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${currentTab === 'alarm' ? 'active' : ''}`}
          onClick={() => setCurrentTab('alarm')}
        >
          🚨 Alarme
        </button>
        <button 
          className={`nav-tab ${currentTab === 'camera' ? 'active' : ''}`}
          onClick={() => setCurrentTab('camera')}
        >
          📹 Caméra de surveillance
        </button>
      </div>

      {/* TAB ALARME */}
      <div 
        id="alarm-tab" 
        className="tab-content" 
        style={{ display: currentTab === 'alarm' ? 'block' : 'none' }}
      >
        <div className="rental-toggle-container">
          <span>Mode vente</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={alarmRentalMode}
              onChange={() => setAlarmRentalMode(!alarmRentalMode)} 
            />
            <span className="toggle-slider"></span>
          </label>
          <span>Location</span>
        </div>

        <div className="form-section">
          <h3>📋 Informations Client</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="clientName">Nom du client</label>
              <input 
                type="text" 
                      id="clientName"
                placeholder="Nom complet du client"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
            <div className="form-group">
              <label htmlFor="commercial">Commercial</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <select 
                  id="commercial" 
                  value={showCustomCommercial ? 'autre' : commercial}
                  onChange={(e) => handleCommercialSelection(e.target.value)}
                  style={{ padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="">Sélectionner un commercial</option>
                  {COMMERCIALS_LIST.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value="autre" style={{ fontStyle: 'italic', color: '#007bff' }}>
                    ➕ Autre (saisir le nom)
                  </option>
                </select>
                {showCustomCommercial && (
                  <input 
                    type="text" 
                    id="commercial-custom" 
                    placeholder="Entrez le nom du commercial"
                    value={customCommercial}
                    onChange={(e) => setCustomCommercial(e.target.value)}
                    style={{ padding: '12px 15px', border: '2px solid #007bff', borderRadius: '8px', fontSize: '14px', background: '#f0f8ff' }}
                  />
                )}
              </div>
            </div>
                  </div>
                </div>
                
        {/* Product Sections */}
        <div className="quote-section">
          <h3>
            🛡️ 1. Kit de base
            <button 
              className="add-product-btn" 
              onClick={() => setShowKitModal(true)}
              title="Sélectionner un kit"
            >
              +
            </button>
          </h3>
          <div id="alarm-material-products">
            {alarmMaterialLines.map((line, index) => (
              <div key={line.id} className="product-line">
                <select 
                  className="product-select"
                  value={line.product?.name || ''}
                  onChange={(e) => {
                    const productName = e.target.value;
                    const product = CATALOG_ALARM_PRODUCTS.find(p => p.name === productName);
                    const newLines = [...alarmMaterialLines];
                    newLines[index] = { ...line, product: product || null };
                    setAlarmMaterialLines(newLines);
                  }}
                >
                  <option value="">Sélectionner un produit</option>
                  {CATALOG_ALARM_PRODUCTS.map(product => {
                    const price = product.price || product.priceTitane || product.priceJablotron || 0;
                    return (
                      <option key={product.name} value={product.name}>
                        {product.name} - {price.toFixed(2)} CHF
                      </option>
                    );
                  })}
                </select>
                <input 
                  type="number" 
                  className="quantity-input"
                  value={line.quantity}
                  onChange={(e) => {
                    const newLines = [...alarmMaterialLines];
                    newLines[index] = { ...line, quantity: parseInt(e.target.value) || 1 };
                    setAlarmMaterialLines(newLines);
                  }}
                  min="1"
                />
                <div className="checkbox-option" style={{ margin: 0 }}>
                  <input 
                    type="checkbox" 
                    className="offered-checkbox"
                    checked={line.offered}
                    onChange={(e) => {
                      const newLines = [...alarmMaterialLines];
                      newLines[index] = { ...line, offered: e.target.checked };
                      setAlarmMaterialLines(newLines);
                    }}
                  />
                  <label style={{ margin: 0, fontSize: '12px' }}>OFFERT</label>
                </div>
                <div className="price-display">
                  {line.offered ? 'OFFERT' : line.product ? `${((line.product.price || line.product.priceTitane || line.product.priceJablotron || 0) * line.quantity).toFixed(2)} CHF` : '0.00 CHF'}
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => {
                    setAlarmMaterialLines(alarmMaterialLines.filter((_, i) => i !== index));
                  }}
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="discount-section">
            <label>Réduction:</label>
            <select 
              value={alarmMaterialDiscount.type}
              onChange={(e) => setAlarmMaterialDiscount({ ...alarmMaterialDiscount, type: e.target.value as 'percent' | 'fixed' })}
            >
              <option value="percent">%</option>
              <option value="fixed">CHF</option>
            </select>
            <input 
              type="number" 
              value={alarmMaterialDiscount.value}
              onChange={(e) => setAlarmMaterialDiscount({ ...alarmMaterialDiscount, value: parseFloat(e.target.value) || 0 })}
              placeholder="0" 
              min="0" 
              className="discount-input" 
            />
          </div>
        </div>

        {/* Installation Section */}
        <div className="quote-section">
          <h3>🔧 2. Installation et matériel supplémentaire</h3>
          <div className="product-line" style={{ background: '#f0f8ff' }}>
            <div>Installation, paramétrages, tests, mise en service & formation</div>
                  <div>
              <label style={{ marginRight: '5px', fontSize: '12px' }}>Nombre:</label>
              <input 
                type="number" 
                value={alarmInstallationQty}
                onChange={(e) => setAlarmInstallationQty(parseInt(e.target.value) || 1)}
                min="1" 
                max="10" 
                className="quantity-input" 
              />
                  </div>
            <input 
              type="number" 
              value={690}
              className="discount-input" 
              placeholder="Prix" 
              readOnly 
              style={{ background: '#f0f0f0' }}
            />
            <div className="checkbox-option" style={{ margin: 0 }}>
              <input 
                type="checkbox" 
                checked={alarmInstallationOffered}
                onChange={(e) => setAlarmInstallationOffered(e.target.checked)}
                className="offered-checkbox" 
              />
              <label style={{ margin: 0, fontSize: '12px' }}>OFFERT</label>
            </div>
            <div className="price-display">
              {alarmInstallationOffered ? 'OFFERT' : `${(690 * alarmInstallationQty).toFixed(2)} CHF`}
            </div>
          </div>
        </div>

        {/* Admin Fees */}
        <div className="quote-section">
          <h3>📄 3. Frais de dossier</h3>
          <div className="product-line">
            <div>Carte SIM + Activation</div>
            <input type="number" defaultValue="1" className="quantity-input" readOnly />
            <div></div>
            <div className="checkbox-option" style={{ margin: 0 }}>
              <input 
                type="checkbox" 
                checked={simcardOffered}
                onChange={(e) => setSimcardOffered(e.target.checked)}
                className="offered-checkbox" 
              />
              <label style={{ margin: 0, fontSize: '12px' }}>OFFERT</label>
            </div>
            <div className="price-display">{simcardOffered ? 'OFFERT' : '50.00 CHF HT'}</div>
          </div>
          <div className="product-line">
            <div>Frais de dossier</div>
            <input type="number" defaultValue="1" className="quantity-input" readOnly />
            <div></div>
            <div className="checkbox-option" style={{ margin: 0 }}>
              <input 
                type="checkbox" 
                checked={processingOffered}
                onChange={(e) => setProcessingOffered(e.target.checked)}
                className="offered-checkbox" 
              />
              <label style={{ margin: 0, fontSize: '12px' }}>OFFERT</label>
            </div>
            <div className="price-display">{processingOffered ? 'OFFERT' : '190.00 CHF HT'}</div>
          </div>
          <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '10px' }}>
            * Les frais de dossier se payent à l&apos;installation
          </p>
        </div>

        {/* Services Section */}
        <ServicesSection
          testCycliqueSelected={testCycliqueSelected}
          testCycliquePrice={testCycliquePrice}
          testCycliqueOffered={testCycliqueOffered}
          onTestCycliqueSelectedChange={setTestCycliqueSelected}
          onTestCycliquePriceChange={setTestCycliquePrice}
          onTestCycliqueOfferedChange={setTestCycliqueOffered}
          surveillanceType={surveillanceType}
          surveillancePrice={surveillancePrice}
          surveillanceOffered={surveillanceOffered}
          onSurveillanceTypeChange={setSurveillanceType}
          onSurveillancePriceChange={setSurveillancePrice}
          onSurveillanceOfferedChange={setSurveillanceOffered}
          centralType={selectedCentral}
          rentalMode={alarmRentalMode}
        />

        {/* Options Section */}
        <OptionsSection
          interventionsGratuites={interventionsGratuites}
          interventionsAnnee={interventionsAnnee}
          interventionsQty={interventionsQty}
          serviceCles={serviceCles}
          onInterventionsGratuitesChange={setInterventionsGratuites}
          onInterventionsAnneeChange={setInterventionsAnnee}
          onInterventionsQtyChange={setInterventionsQty}
          onServiceClesChange={setServiceCles}
        />

        {/* Payment Mode */}
        {!alarmRentalMode && (
          <PaymentSelector
            selectedMonths={alarmPaymentMonths}
            onSelect={setAlarmPaymentMonths}
            label="6. Mode de paiement"
          />
        )}

        {/* Uninstall Line (Rental Mode Only) */}
        {alarmRentalMode && (
          <div className="quote-section">
            <h3>💰 Désinstallation</h3>
            <div className="product-line" style={{ background: '#fff3cd' }}>
              <div>Désinstallation facturée si durée inférieure à 12 mois</div>
              <input type="number" defaultValue="1" className="quantity-input" readOnly />
              <div></div>
              <div></div>
              <div className="price-display">{UNINSTALL_PRICE.toFixed(2)} CHF</div>
            </div>
          </div>
                )}

        {/* Summary */}
        <div className="quote-summary">
          <h3>📊 Récapitulatif du devis</h3>
          <div className="summary-item">
            <span>Matériel</span>
            <span>{((alarmTotals?.material?.total || 0) * 1.081).toFixed(2)} CHF TTC</span>
          </div>
          <div className="summary-item">
            <span>Installation</span>
            <span>{((alarmTotals?.installation?.total || 0) * 1.081).toFixed(2)} CHF TTC</span>
          </div>
          <div className="summary-item">
            <span>Frais de dossier</span>
            <span>{((alarmTotals?.adminFees?.total || 0) * 1.081).toFixed(2)} CHF TTC</span>
          </div>
          {surveillanceType && (
            <div className="summary-item">
              <span>Service de surveillance</span>
              <span>{surveillanceOffered ? 'OFFERT' : `${surveillancePrice.toFixed(2)} CHF/mois`}</span>
            </div>
          )}
          <div className="summary-item" style={{ borderTop: '2px solid #e9ecef', marginTop: '10px', paddingTop: '10px', fontWeight: 600 }}>
            <span>TOTAL HT (hors surveillance)</span>
            <span>{(alarmTotals?.totalHT || 0).toFixed(2)} CHF</span>
          </div>
          <div className="summary-item" style={{ fontWeight: 600, fontSize: '18px' }}>
            <span>TOTAL TTC (hors surveillance)</span>
            <span>{(alarmTotals?.totalTTC || 0).toFixed(2)} CHF</span>
          </div>
          {!alarmRentalMode && alarmPaymentMonths > 0 && alarmTotals?.monthly && (
            <div className="monthly-payment" style={{ 
              background: '#f4e600', 
              padding: '15px', 
              borderRadius: '8px', 
              marginTop: '15px' 
            }}>
              <strong style={{ fontSize: '16px' }}>
                💳 Mensualités: {(alarmTotals.monthly.totalTTC || 0).toFixed(2)} CHF/mois pendant {alarmPaymentMonths} mois
              </strong>
            </div>
          )}
          {!alarmRentalMode && alarmPaymentMonths === 0 && alarmTotals?.cash && (
            <div className="monthly-payment" style={{ 
              background: '#28a745', 
              color: 'white',
              padding: '15px', 
              borderRadius: '8px', 
              marginTop: '15px' 
            }}>
              <strong style={{ fontSize: '16px' }}>
                💰 Montant comptant: {(alarmTotals.cash.totalTTC || 0).toFixed(2)} CHF
              </strong>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button 
            className="btn btn-primary" 
            onClick={handleGenerateAndSend}
            disabled={isProcessing}
          >
            {isProcessing ? '⏳ Traitement...' : '📄 Générer et Envoyer le Devis'}
          </button>
                    </div>
      </div>

      {/* TAB CAMERA - Similar structure */}
      <div 
        id="camera-tab" 
        className="tab-content"
        style={{ display: currentTab === 'camera' ? 'block' : 'none' }}
      >
        <div className="rental-toggle-container">
          <span>Mode vente</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={cameraRentalMode}
              onChange={() => setCameraRentalMode(!cameraRentalMode)} 
            />
            <span className="toggle-slider"></span>
          </label>
          <span>Location</span>
        </div>

        <div className="form-section">
          <h3>📋 Informations Client</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="clientNameCamera">Nom du client</label>
              <input 
                type="text" 
                id="clientNameCamera" 
                placeholder="Nom complet du client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="commercialCamera">Commercial</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <select 
                  id="commercialCamera" 
                  value={showCustomCommercial ? 'autre' : commercial}
                  onChange={(e) => handleCommercialSelection(e.target.value)}
                  style={{ padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="">Sélectionner un commercial</option>
                  {COMMERCIALS_LIST.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value="autre" style={{ fontStyle: 'italic', color: '#007bff' }}>
                    ➕ Autre (saisir le nom)
                  </option>
                </select>
                {showCustomCommercial && (
                  <input 
                    type="text" 
                    placeholder="Entrez le nom du commercial"
                    value={customCommercial}
                    onChange={(e) => setCustomCommercial(e.target.value)}
                    style={{ padding: '12px 15px', border: '2px solid #007bff', borderRadius: '8px', fontSize: '14px', background: '#f0f8ff' }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Camera product sections */}
        <div className="quote-section">
          <h3>
            📹 1. Matériel
            <button 
              className="add-product-btn" 
              onClick={() => {
                setCameraMaterialLines([...cameraMaterialLines, {
                  id: Date.now(),
                  product: null,
                  quantity: 1,
                  offered: false
                }]);
              }}
              title="Ajouter un produit"
            >
              +
            </button>
          </h3>
          <div id="camera-material-products">
            {cameraMaterialLines.map((line, index) => (
              <div key={line.id} className="product-line">
                <select 
                  className="product-select"
                  value={line.product?.name || ''}
                  onChange={(e) => {
                    const productName = e.target.value;
                    const product = CATALOG_CAMERA_MATERIAL.find(p => p.name === productName);
                    const newLines = [...cameraMaterialLines];
                    newLines[index] = { ...line, product: product || null };
                    setCameraMaterialLines(newLines);
                  }}
                >
                  <option value="">Sélectionner un produit</option>
                  {CATALOG_CAMERA_MATERIAL.map(product => (
                    <option key={product.name} value={product.name}>
                      {product.name} - {(product.price || 0).toFixed(2)} CHF
                    </option>
                  ))}
                </select>
                <input 
                      type="number"
                  className="quantity-input"
                  value={line.quantity}
                  onChange={(e) => {
                    const newLines = [...cameraMaterialLines];
                    newLines[index] = { ...line, quantity: parseInt(e.target.value) || 1 };
                    setCameraMaterialLines(newLines);
                  }}
                      min="1"
                    />
                <div className="checkbox-option" style={{ margin: 0 }}>
                  <input 
                    type="checkbox" 
                    className="offered-checkbox"
                    checked={line.offered}
                    onChange={(e) => {
                      const newLines = [...cameraMaterialLines];
                      newLines[index] = { ...line, offered: e.target.checked };
                      setCameraMaterialLines(newLines);
                    }}
                  />
                  <label style={{ margin: 0, fontSize: '12px' }}>OFFERT</label>
                </div>
                <div className="price-display">
                  {line.offered ? 'OFFERT' : line.product ? `${((line.product.price || 0) * line.quantity).toFixed(2)} CHF` : '0.00 CHF'}
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => {
                    setCameraMaterialLines(cameraMaterialLines.filter((_, i) => i !== index));
                  }}
                  title="Supprimer"
                >
                  ×
                </button>
                  </div>
                ))}
          </div>
          <div className="discount-section">
            <label>Réduction:</label>
            <select 
              value={cameraMaterialDiscount.type}
              onChange={(e) => setCameraMaterialDiscount({ ...cameraMaterialDiscount, type: e.target.value as 'percent' | 'fixed' })}
            >
              <option value="percent">%</option>
              <option value="fixed">CHF</option>
            </select>
            <input 
              type="number" 
              value={cameraMaterialDiscount.value}
              onChange={(e) => setCameraMaterialDiscount({ ...cameraMaterialDiscount, value: parseFloat(e.target.value) || 0 })}
              placeholder="0" 
              min="0" 
              className="discount-input" 
            />
          </div>
        </div>

        {/* Installation Section */}
        <div className="quote-section">
          <h3>🔧 2. Installation</h3>
          <div className="product-line" style={{ background: '#f0f8ff' }}>
            <div>Installation (690 + {cameraMaterialLines.filter(l => l.product && !l.offered).reduce((s, l) => s + l.quantity, 0)} caméras × 140)</div>
            <div>
              <label style={{ marginRight: '5px', fontSize: '12px' }}>Nombre:</label>
              <input 
                type="number" 
                value={cameraInstallationQty}
                onChange={(e) => setCameraInstallationQty(parseInt(e.target.value) || 1)}
                min="1" 
                max="10" 
                className="quantity-input" 
              />
            </div>
            <input 
              type="number" 
              value={cameraInstallationPrice}
              className="discount-input" 
              placeholder="Prix" 
              readOnly 
              style={{ background: '#f0f0f0' }}
            />
            <div className="checkbox-option" style={{ margin: 0 }}>
              <input 
                type="checkbox" 
                checked={cameraInstallationOffered}
                onChange={(e) => setCameraInstallationOffered(e.target.checked)}
                className="offered-checkbox" 
              />
              <label style={{ margin: 0, fontSize: '12px' }}>OFFERT</label>
            </div>
            <div className="price-display">
              {cameraInstallationOffered ? 'OFFERT' : `${(cameraInstallationPrice * cameraInstallationQty).toFixed(2)} CHF`}
            </div>
          </div>
        </div>

        {/* Vision à distance (only in sale mode) */}
        {!cameraRentalMode && (
          <div className="quote-section">
            <h3>📡 3. Vision à distance</h3>
            <div className="product-line">
              <div>Accès à distance via application mobile</div>
              <div></div>
              <div></div>
              <div className="checkbox-option" style={{ margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={cameraRemoteAccess}
                  onChange={(e) => setCameraRemoteAccess(e.target.checked)}
                />
                <label style={{ margin: 0, fontSize: '12px', marginLeft: '4px' }}>Activer</label>
              </div>
              <div className="price-display">
                {cameraRemoteAccess ? '20.00 CHF/mois' : '0.00 CHF/mois'}
              </div>
            </div>
                  </div>
                )}

        {/* Payment Mode */}
        {!cameraRentalMode && (
          <PaymentSelector
            selectedMonths={cameraPaymentMonths}
            onSelect={setCameraPaymentMonths}
            label="4. Mode de paiement"
          />
        )}

        {/* Uninstall Line (Rental Mode Only) */}
        {cameraRentalMode && (
          <div className="quote-section">
            <h3>💰 Désinstallation</h3>
            <div className="product-line" style={{ background: '#fff3cd' }}>
              <div>Désinstallation facturée si durée inférieure à 12 mois</div>
              <input type="number" defaultValue="1" className="quantity-input" readOnly />
              <div></div>
              <div></div>
              <div className="price-display">{UNINSTALL_PRICE.toFixed(2)} CHF</div>
                </div>
          </div>
        )}

        {/* Summary */}
        <div className="quote-summary">
          <h3>📊 Récapitulatif du devis</h3>
          <div className="summary-item">
            <span>Matériel</span>
            <span>{((cameraTotals?.material?.total || 0) * 1.081).toFixed(2)} CHF TTC</span>
                  </div>
          <div className="summary-item">
                    <span>Installation</span>
            <span>{((cameraTotals?.installation?.total || 0) * 1.081).toFixed(2)} CHF TTC</span>
                  </div>
          {cameraRemoteAccess && !cameraRentalMode && (
            <div className="summary-item">
              <span>Vision à distance</span>
              <span>20.00 CHF/mois</span>
                  </div>
          )}
          <div className="summary-item" style={{ borderTop: '2px solid #e9ecef', marginTop: '10px', paddingTop: '10px', fontWeight: 600 }}>
            <span>TOTAL HT</span>
            <span>{(cameraTotals?.totalHT || 0).toFixed(2)} CHF</span>
                  </div>
          <div className="summary-item" style={{ fontWeight: 600, fontSize: '18px' }}>
            <span>TOTAL TTC</span>
            <span>{(cameraTotals?.totalTTC || 0).toFixed(2)} CHF</span>
                </div>
          {!cameraRentalMode && cameraPaymentMonths > 0 && cameraTotals?.monthly && (
            <div className="monthly-payment" style={{ 
              background: '#f4e600', 
              padding: '15px', 
              borderRadius: '8px', 
              marginTop: '15px' 
            }}>
              <strong style={{ fontSize: '16px' }}>
                💳 Mensualités: {(cameraTotals.monthly.totalTTC || 0).toFixed(2)} CHF/mois pendant {cameraPaymentMonths} mois
              </strong>
                  </div>
                )}
          {!cameraRentalMode && cameraPaymentMonths === 0 && (
            <div className="monthly-payment" style={{ 
              background: '#28a745', 
              color: 'white',
              padding: '15px', 
              borderRadius: '8px', 
              marginTop: '15px' 
            }}>
              <strong style={{ fontSize: '16px' }}>
                💰 Montant comptant: {(cameraTotals?.totalTTC || 0).toFixed(2)} CHF
              </strong>
                  </div>
                )}
        </div>

        <div className="action-buttons">
          <button 
            className="btn btn-primary" 
            onClick={handleGenerateAndSend}
            disabled={isProcessing}
          >
            {isProcessing ? '⏳ Traitement...' : '📄 Générer et Envoyer le Devis'}
          </button>
                  </div>
      </div>

      {/* Kit Selection Modal */}
      {showKitModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowKitModal(false);
            }
          }}
        >
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '15px'
            }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>
                Sélectionner un kit de base
              </h2>
              <button
                onClick={() => setShowKitModal(false)}
                style={{
                  background: '#e0e0e0',
                  color: '#666',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  lineHeight: '1',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#d0d0d0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#e0e0e0'}
              >
                ×
              </button>
            </div>

            {/* Jablotron Kits */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                color: '#666',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Centrale Jablotron - 990.00 CHF
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => applyKit('jablotron', 'kit1')}
                  style={{
                    position: 'relative',
                    flex: 1,
                    padding: '15px',
                    background: 'white',
                    border: '2px solid #6c757d',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(108,117,125,0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '8px', color: '#333' }}>Kit 1</div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    2 Détecteurs volumétriques<br />
                    1 Détecteur d&apos;ouverture<br />
                    1 Clavier + 1 Sirène
                  </div>
                </button>
                <button
                  onClick={() => applyKit('jablotron', 'kit2')}
                  style={{
                    position: 'relative',
                    flex: 1,
                    padding: '15px',
                    background: 'white',
                    border: '2px solid #6c757d',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(108,117,125,0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '8px', color: '#333' }}>Kit 2</div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    1 Détecteur volumétrique<br />
                    3 Détecteurs d&apos;ouverture<br />
                    1 Clavier + 1 Sirène
                  </div>
                </button>
              </div>
            </div>

            {/* Titane Kits */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                color: '#666',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Centrale Titane - 690.00 CHF
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => applyKit('titane', 'kit1')}
                  style={{
                    position: 'relative',
                    flex: 1,
                    padding: '15px',
                    background: 'white',
                    border: '2px solid #f4e600',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#fffef0';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(244,230,0,0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '8px', color: '#333' }}>Kit 1</div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    2 Détecteurs volumétriques<br />
                    1 Détecteur d&apos;ouverture<br />
                    1 Clavier + 1 Sirène
                  </div>
                </button>
                <button
                  onClick={() => applyKit('titane', 'kit2')}
                  style={{
                    position: 'relative',
                    flex: 1,
                    padding: '15px',
                    background: 'white',
                    border: '2px solid #f4e600',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#fffef0';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(244,230,0,0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '8px', color: '#333' }}>Kit 2</div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    1 Détecteur volumétrique<br />
                    3 Détecteurs d&apos;ouverture<br />
                    1 Clavier + 1 Sirène
                  </div>
                </button>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '12px',
              background: '#f8f9fa',
              borderLeft: '3px solid #f4e600',
              borderRadius: '4px'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                💡 Le kit sera automatiquement marqué comme OFFERT
              </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

