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
import { CATALOG_ALARM_PRODUCTS, CATALOG_CAMERA_MATERIAL, CATALOG_FOG_PRODUCTS, CATALOG_VISIOPHONE_PRODUCTS, CATALOG_XTO_PRODUCTS, UNINSTALL_PRICE, calculateInstallationPrice, TVA_RATE, roundToFiveCents } from '@/lib/quote-generator';
import { ProductLineData } from '@/components/ProductLine';
import { ProductSection } from '@/components/ProductSection';
import { CommercialSelector } from '@/components/CommercialSelector';
import { ServicesSection } from '@/components/ServicesSection';
import { OptionsSection } from '@/components/OptionsSection';
import { PaymentSelector } from '@/components/PaymentSelector';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { detectCentralType, calculateCameraInstallation, toCalcFormat, calculateRemoteAccessPrice } from '@/lib/product-line-adapter';

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
  const [propertyType, setPropertyType] = useState<'locaux' | 'habitation' | 'villa' | 'commerce' | 'entreprise'>('locaux');
  
  // Product lines state - now using ProductLineData type
  const [alarmMaterialLines, setAlarmMaterialLines] = useState<ProductLineData[]>([]);
  const [alarmInstallationLines, setAlarmInstallationLines] = useState<ProductLineData[]>([]);
  const [cameraMaterialLines, setCameraMaterialLines] = useState<ProductLineData[]>([]);
  
  // Discounts state
  const [alarmMaterialDiscount, setAlarmMaterialDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  const [alarmInstallationDiscount, setAlarmInstallationDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  const [cameraMaterialDiscount, setCameraMaterialDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  const [cameraInstallationDiscount, setCameraInstallationDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  
  // Installation state
  const [alarmInstallationQty, setAlarmInstallationQty] = useState(1);
  const [alarmInstallationOffered, setAlarmInstallationOffered] = useState(true); // Offered by default per spec
  const [alarmInstallationPriceOverride, setAlarmInstallationPriceOverride] = useState<number | null>(300); // Default 300 CHF per spec
  const [alarmInstallationInMonthly, setAlarmInstallationInMonthly] = useState(false);
  const [isCustomKit, setIsCustomKit] = useState(false); // Track if "à partir de rien" was selected
  const [customSurveillanceType, setCustomSurveillanceType] = useState<'autosurveillance' | 'telesurveillance'>('autosurveillance');
  const [customSurveillancePrice, setCustomSurveillancePrice] = useState(0);
  
  const [cameraInstallationQty, setCameraInstallationQty] = useState(1);
  const [cameraInstallationOffered, setCameraInstallationOffered] = useState(false);
  const [cameraInstallationPriceOverride, setCameraInstallationPriceOverride] = useState<number | null>(null);

  // Calculate alarm installation price using tiered half-day system (or use override)
  const alarmInstallationPrice = useMemo(() => {
    return alarmInstallationPriceOverride !== null 
      ? alarmInstallationPriceOverride 
      : calculateInstallationPrice(alarmInstallationQty);
  }, [alarmInstallationQty, alarmInstallationPriceOverride]);

  // Calculate camera installation price with tiered pricing (or use override)
  const cameraInstallationPrice = useMemo(() => {
    if (cameraInstallationPriceOverride !== null) {
      return cameraInstallationPriceOverride;
    }
    return calculateCameraInstallation(cameraMaterialLines, cameraInstallationQty);
  }, [cameraMaterialLines, cameraInstallationQty, cameraInstallationPriceOverride]);
  
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
  const [currentTab, setCurrentTab] = useState<'alarm' | 'camera' | 'fog' | 'visiophone'>('alarm');
  
  // Kit modal state
  const [showKitModal, setShowKitModal] = useState(false);
  
  // Engagement duration state
  const [engagementMonths, setEngagementMonths] = useState(48);
  
  // New alarm options state
  const [interventionPayante, setInterventionPayante] = useState(false);
  const [interventionPayantePrice, setInterventionPayantePrice] = useState(149);
  const [interventionPolice, setInterventionPolice] = useState(false);
  const [telesurveillanceOption, setTelesurveillanceOption] = useState(false);
  
  // Camera 4G and maintenance state
  const [cameraVisionDistance, setCameraVisionDistance] = useState(false);
  const [cameraVisionPrice, setCameraVisionPrice] = useState(0);
  const [cameraMaintenance, setCameraMaintenance] = useState(false);
  const [cameraMaintenancePrice, setCameraMaintenancePrice] = useState(0);
  
  // Fog generator state
  const [fogLines, setFogLines] = useState<ProductLineData[]>([]);
  const [fogInstallationPrice, setFogInstallationPrice] = useState(490);
  const [fogProcessingFee, setFogProcessingFee] = useState(190);
  const [fogSimCard, setFogSimCard] = useState(50);
  const [fogProcessingOffered, setFogProcessingOffered] = useState(false);
  const [fogSimCardOffered, setFogSimCardOffered] = useState(false);
  
  // Visiophone state
  const [visiophoLines, setVisiophoLines] = useState<ProductLineData[]>([]);
  const [visiophoInstallationPrice, setVisiophoInstallationPrice] = useState(690);
  
  // Auto-detect selected central from product lines
  const selectedCentral = useMemo(() => {
    return detectCentralType(alarmMaterialLines);
  }, [alarmMaterialLines]);
  
  // Apply kit function
  const applyKit = (centralType: 'titane' | 'jablotron', kitType: 'kit1' | 'kit2' | 'none') => {
    const centralProduct = CATALOG_ALARM_PRODUCTS.find(p => 
      centralType === 'jablotron' ? p.id === 5 : p.id === 6
    );
    
    // If 'none' is selected, add only the central and nothing else, not offered
    if (kitType === 'none') {
      const newLines: ProductLineData[] = [];
      if (centralProduct) {
        newLines.push({
          id: Date.now(),
          product: centralProduct,
          quantity: 1,
          offered: false  // Not offered when user chooses "Rien Offert"
        });
      }
      setAlarmMaterialLines(newLines);
      setShowKitModal(false);
      setIsCustomKit(true); // Mark as custom kit
      return;
    }
    
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
    setIsCustomKit(false); // Reset custom kit flag for normal kits
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
          isOffered: alarmInstallationOffered
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
        totalHT: alarmInstallationOffered ? 0 : roundToFiveCents(alarmInstallationPrice),
        totalTTC: alarmInstallationOffered ? 0 : roundToFiveCents(roundToFiveCents(alarmInstallationPrice) * (1 + TVA_RATE))
      };
    }
  }, [
    alarmMaterialLines,
    alarmInstallationLines,
    alarmMaterialDiscount,
    alarmInstallationDiscount,
    alarmInstallationQty,
    alarmInstallationOffered,
    alarmInstallationPrice,
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
  
  // Auto-calculate vision à distance price (4G cameras)
  useEffect(() => {
    if (!cameraVisionDistance) {
      setCameraVisionPrice(0);
      return;
    }
    
    // Count 4G cameras
    const fourGCameras = cameraMaterialLines.filter(
      (line) => line.product && line.product.name.includes('4G')
    ).reduce((sum, line) => sum + line.quantity, 0);
    
    // Count classic cameras (if modem selected)
    let classicCameras = 0;
    const hasModem = cameraMaterialLines.some(
      (line) => line.product && line.product.name.toLowerCase().includes('modem')
    );
    
    if (hasModem) {
      classicCameras = cameraMaterialLines.filter(
        (line) =>
          line.product &&
          !line.product.name.includes('4G') &&
          !line.product.name.includes('NVR') &&
          !line.product.name.toLowerCase().includes('modem') &&
          !line.product.name.toLowerCase().includes('interphone') &&
          !line.product.name.toLowerCase().includes('écran') &&
          (line.product.name.toLowerCase().includes('caméra') ||
            line.product.name.includes('Bullet') ||
            line.product.name.includes('Dôme') ||
            line.product.name.includes('Solar'))
      ).reduce((sum, line) => sum + line.quantity, 0);
    }
    
    const totalPrice = (fourGCameras + classicCameras) * 20;
    setCameraVisionPrice(totalPrice);
    
    // Auto-check vision if modem present
    if (hasModem && !cameraVisionDistance) {
      setCameraVisionDistance(true);
    }
  }, [cameraMaterialLines, cameraVisionDistance]);
  
  // Auto-calculate maintenance price
  useEffect(() => {
    if (!cameraMaintenance) {
      setCameraMaintenancePrice(0);
      return;
    }
    
    // Count cameras
    const cameraCount = cameraMaterialLines.filter(
      (line) =>
        line.product &&
        (line.product.name.toLowerCase().includes('caméra') ||
          line.product.name.includes('Bullet') ||
          line.product.name.includes('Dôme') ||
          line.product.name.includes('Solar') ||
          line.product.name.includes('PTZ'))
    ).reduce((sum, line) => sum + line.quantity, 0);
    
    // Count NVRs
    const nvrCount = cameraMaterialLines.filter(
      (line) => line.product && line.product.name.includes('NVR')
    ).reduce((sum, line) => sum + line.quantity, 0);
    
    const totalItems = cameraCount + nvrCount;
    const pricePerItem = totalItems >= 5 ? 5 : 10;
    const totalPrice = totalItems * pricePerItem;
    
    setCameraMaintenancePrice(totalPrice);
  }, [cameraMaterialLines, cameraMaintenance]);
  
  // Initialize Fog kit de base on mount
  useEffect(() => {
    if (fogLines.length === 0 && CATALOG_FOG_PRODUCTS.length > 0) {
      const fogKit = [
        { id: 200, quantity: 1, offered: true }, // Générateur
        { id: 201, quantity: 1, offered: true }, // Clavier
        { id: 202, quantity: 1, offered: true }, // Détecteur
      ];
      
      const newLines: ProductLineData[] = fogKit.map((item, index) => {
        const product = CATALOG_FOG_PRODUCTS.find(p => p.id === item.id);
        return {
          id: Date.now() + index,
          product: product || null,
          quantity: item.quantity,
          offered: item.offered
        };
      });
      
      setFogLines(newLines);
    }
  }, []);
  
  // Initialize Visiophone products on mount
  useEffect(() => {
    if (visiophoLines.length === 0 && CATALOG_VISIOPHONE_PRODUCTS.length > 0) {
      const visiophoKit = [
        { id: 300, quantity: 1, offered: false }, // Interphone
        { id: 301, quantity: 1, offered: false }, // Écran
      ];
      
      const newLines: ProductLineData[] = visiophoKit.map((item, index) => {
        const product = CATALOG_VISIOPHONE_PRODUCTS.find(p => p.id === item.id);
        return {
          id: Date.now() + index,
          product: product || null,
          quantity: item.quantity,
          offered: item.offered
        };
      });
      
      setVisiophoLines(newLines);
    }
  }, []);
  
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
        cameraInstallationDiscount,
        cameraRemoteAccess,
        cameraPaymentMonths,
        cameraRentalMode,
        CATALOG_CAMERA_MATERIAL
      );
    } catch (error) {
      console.error('Error calculating camera totals:', error);
      return {
        material: { subtotal: 0, discount: 0, total: 0, totalBeforeDiscount: 0, discountDisplay: '' },
        installation: { subtotal: 0, discount: 0, total: 0, totalBeforeDiscount: 0, discountDisplay: '' },
        remoteAccess: { enabled: false, price: 0 },
        totalHT: cameraInstallationOffered ? 0 : roundToFiveCents(cameraInstallationPrice),
        totalTTC: cameraInstallationOffered ? 0 : roundToFiveCents(roundToFiveCents(cameraInstallationPrice) * (1 + TVA_RATE))
      };
    }
  }, [
    cameraMaterialLines,
    cameraMaterialDiscount,
    cameraInstallationQty,
    cameraInstallationOffered,
    cameraInstallationPrice,
    cameraInstallationDiscount,
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
      console.log('🔍 Commercial selected:', finalCommercial);
      console.log('📋 Commercial info:', commercialInfo);
      
      if (!commercialInfo) {
        console.warn('⚠️ Commercial not found in config, using defaults');
        // Use default values if commercial not found
        const defaultCommercialInfo = {
          phone: '06 XX XX XX XX',
          email: `${finalCommercial.toLowerCase().replace(/\s+/g, '.')}@dialarme.fr`
        };
        console.log('📋 Using default commercial info:', defaultCommercialInfo);
      } else {
        // Validate commercial info has required fields
        if (!commercialInfo.phone) {
          console.warn('⚠️ Commercial phone missing, using default');
          commercialInfo.phone = '06 XX XX XX XX';
        }
        if (!commercialInfo.email) {
          console.warn('⚠️ Commercial email missing, using default');
          commercialInfo.email = `${finalCommercial.toLowerCase().replace(/\s+/g, '.')}@dialarme.fr`;
        }
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
      
      // Get validated commercial info
      const validatedCommercialInfo = commercialInfo || {
        phone: '06 XX XX XX XX',
        email: `${finalCommercial.toLowerCase().replace(/\s+/g, '.')}@dialarme.fr`
      };
      
      console.log('📝 Commercial info for PDF assembly:', {
        name: finalCommercial,
        phone: validatedCommercialInfo.phone,
        email: validatedCommercialInfo.email
      });
      
      const assembled = await assemblePdf({
        pdfBlob: generatedPdf.blob,
        quoteType: currentTab === 'alarm' ? 'alarme' : 'video',
        centralType: selectedCentral || null,
        products,
        commercial: {
          name: finalCommercial,
          phone: validatedCommercialInfo.phone,
          email: validatedCommercialInfo.email
        },
        propertyType
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
        // Step 5: Trigger automatic download
        console.log('🔄 Step 5: Triggering automatic PDF download...');
        try {
          const pdfBytes = await assembled.blob.arrayBuffer();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log('✅ PDF downloaded successfully');
        } catch (downloadError) {
          console.error('⚠️ Download failed (non-critical):', downloadError);
        }
        
        // Success - PDF downloaded automatically, no modal needed
        console.log('✅ Quote sent successfully:', result);
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
      {/* Loading Spinner Overlay */}
      <LoadingSpinner 
        show={isProcessing}
        message={currentProgress || 'Traitement en cours...'}
      />

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
        <button 
          className={`nav-tab ${currentTab === 'fog' ? 'active' : ''}`}
          onClick={() => setCurrentTab('fog')}
        >
          💨 Générateur de brouillard
        </button>
        <button 
          className={`nav-tab ${currentTab === 'visiophone' ? 'active' : ''}`}
          onClick={() => setCurrentTab('visiophone')}
        >
          📞 Visiophone
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
              <label htmlFor="propertyType">Type de bien</label>
              <select 
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                style={{ padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '14px' }}
              >
                <option value="locaux">Locaux</option>
                <option value="habitation">Habitation</option>
                <option value="villa">Villa</option>
                <option value="commerce">Commerce</option>
                <option value="entreprise">Entreprise</option>
              </select>
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
            🛡️ Choix Kit de base
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
              <div key={line.id}>
                <div className="product-line">
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
                    {line.offered ? 'OFFERT' : line.product ? `${((line.customPrice || line.product.price || line.product.priceTitane || line.product.priceJablotron || 0) * line.quantity).toFixed(2)} CHF` : '0.00 CHF'}
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
                {line.product?.isCustom && (
                  <div className="custom-product-fields" style={{ display: 'flex', gap: '10px', marginTop: '8px', paddingLeft: '10px', borderLeft: '3px solid #007bff' }}>
                    <input 
                      type="text"
                      placeholder="Nom du produit personnalisé"
                      value={line.customName || ''}
                      onChange={(e) => {
                        const newLines = [...alarmMaterialLines];
                        newLines[index] = { ...line, customName: e.target.value };
                        setAlarmMaterialLines(newLines);
                      }}
                      style={{ flex: 2, padding: '8px', border: '2px solid #007bff', borderRadius: '6px', fontSize: '13px', background: '#f0f8ff' }}
                    />
                    <input 
                      type="number"
                      placeholder="Prix (CHF)"
                      value={line.customPrice || ''}
                      onChange={(e) => {
                        const newLines = [...alarmMaterialLines];
                        newLines[index] = { ...line, customPrice: parseFloat(e.target.value) || 0 };
                        setAlarmMaterialLines(newLines);
                      }}
                      min="0"
                      step="0.01"
                      style={{ flex: 1, padding: '8px', border: '2px solid #007bff', borderRadius: '6px', fontSize: '13px', background: '#f0f8ff' }}
                    />
                  </div>
                )}
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

        {/* Custom Kit Surveillance Choice */}
        {isCustomKit && (
          <div className="quote-section" style={{ background: '#fffef0', border: '2px solid #f4e600' }}>
            <h3 style={{ marginBottom: '15px' }}>🔍 Type de surveillance (Kit personnalisé)</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="customSurveillance"
                  checked={customSurveillanceType === 'autosurveillance'}
                  onChange={() => setCustomSurveillanceType('autosurveillance')}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontWeight: 500 }}>Autosurveillance</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="customSurveillance"
                  checked={customSurveillanceType === 'telesurveillance'}
                  onChange={() => setCustomSurveillanceType('telesurveillance')}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontWeight: 500 }}>Télésurveillance</span>
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: 500 }}>Prix mensuel:</label>
              <input 
                type="number"
                value={customSurveillancePrice}
                onChange={(e) => setCustomSurveillancePrice(parseFloat(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #f4e600',
                  borderRadius: '4px',
                  width: '120px',
                  fontSize: '14px'
                }}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <span style={{ fontWeight: 500 }}>CHF/mois</span>
            </div>
          </div>
        )}

        {/* Installation Section */}
        <div className="quote-section">
          <h3>
            🔧 Installation et matériel divers
            <button 
              className="add-product-btn" 
              onClick={() => {
                setAlarmInstallationLines([...alarmInstallationLines, {
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
          <div className="product-line" style={{ background: '#f0f8ff' }}>
            <div>Installation, paramétrages, tests, mise en service & formation</div>
                  <div>
              <label style={{ marginRight: '5px', fontSize: '12px' }}>Demi-journées:</label>
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
              value={alarmInstallationPrice}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAlarmInstallationPriceOverride(isNaN(val) ? null : val);
              }}
              className="discount-input" 
              placeholder="Prix" 
              style={{ background: alarmInstallationPriceOverride !== null ? '#fff3cd' : '#f0f0f0' }}
              title={alarmInstallationPriceOverride !== null ? 'Prix personnalisé' : 'Prix automatique'}
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
              {alarmInstallationOffered ? 'OFFERT' : `${alarmInstallationPrice.toFixed(2)} CHF`}
            </div>
          </div>
          
          {/* Extra material lines */}
          <div id="alarm-installation-products">
            {alarmInstallationLines.map((line, index) => (
              <div key={line.id} className="product-line">
                <select 
                  className="product-select"
                  value={line.product?.name || ''}
                  onChange={(e) => {
                    const productName = e.target.value;
                    const product = CATALOG_ALARM_PRODUCTS.find(p => p.name === productName);
                    const newLines = [...alarmInstallationLines];
                    newLines[index] = { ...line, product: product || null };
                    setAlarmInstallationLines(newLines);
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
                    const newLines = [...alarmInstallationLines];
                    newLines[index] = { ...line, quantity: parseInt(e.target.value) || 1 };
                    setAlarmInstallationLines(newLines);
                  }}
                  min="1"
                />
                <div className="checkbox-option" style={{ margin: 0 }}>
                  <input 
                    type="checkbox" 
                    className="offered-checkbox"
                    checked={line.offered}
                    onChange={(e) => {
                      const newLines = [...alarmInstallationLines];
                      newLines[index] = { ...line, offered: e.target.checked };
                      setAlarmInstallationLines(newLines);
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
                    setAlarmInstallationLines(alarmInstallationLines.filter((_, i) => i !== index));
                  }}
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {/* Discount section */}
          <div className="discount-section">
            <label>Réduction:</label>
            <select 
              value={alarmInstallationDiscount.type}
              onChange={(e) => setAlarmInstallationDiscount({ ...alarmInstallationDiscount, type: e.target.value as 'percent' | 'fixed' })}
            >
              <option value="percent">%</option>
              <option value="fixed">CHF</option>
            </select>
            <input 
              type="number" 
              value={alarmInstallationDiscount.value}
              onChange={(e) => setAlarmInstallationDiscount({ ...alarmInstallationDiscount, value: parseFloat(e.target.value) || 0 })}
              placeholder="0" 
              min="0" 
              className="discount-input" 
            />
          </div>
          
          {/* Include installation in monthly checkbox - NEW */}
          {!alarmRentalMode && (
            <div style={{ 
              marginTop: '15px',
              padding: '12px',
              background: '#f0f8ff',
              borderRadius: '6px',
              border: '1px solid #007bff'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={alarmInstallationInMonthly}
                  onChange={(e) => setAlarmInstallationInMonthly(e.target.checked)}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  Inclure le prix de l&apos;installation dans les mensualités
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Admin Fees */}
        <div className="quote-section">
          <h3>📄 Frais de dossier</h3>
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
          interventionPayante={interventionPayante}
          onInterventionPayanteChange={setInterventionPayante}
          interventionPayantePrice={interventionPayantePrice}
          onInterventionPayantePriceChange={setInterventionPayantePrice}
          interventionPolice={interventionPolice}
          onInterventionPoliceChange={setInterventionPolice}
          telesurveillanceOption={telesurveillanceOption}
          onTelesurveillanceOptionChange={setTelesurveillanceOption}
        />

        {/* Payment Mode */}
        {!alarmRentalMode && (
          <>
            <PaymentSelector
              selectedMonths={alarmPaymentMonths}
              onSelect={setAlarmPaymentMonths}
              label="Mode de paiement"
            />
            
            {/* Engagement Duration */}
            <div className="quote-section">
              <h3>⏱️ Durée d'engagement</h3>
              <select 
                value={engagementMonths}
                onChange={(e) => setEngagementMonths(parseInt(e.target.value))}
                style={{
                  padding: '10px',
                  fontSize: '14px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  width: '200px',
                  cursor: 'pointer'
                }}
              >
                <option value={12}>12 mois</option>
                <option value={24}>24 mois</option>
                <option value={36}>36 mois</option>
                <option value={48}>48 mois</option>
                <option value={60}>60 mois</option>
              </select>
            </div>
          </>
        )}

        {/* Uninstall Note (Rental Mode Only) - Display only, not included in totals */}
        {alarmRentalMode && (
          <div className="quote-section">
            <h3>💰 Désinstallation</h3>
            <div style={{ 
              background: '#fff3cd', 
              padding: '15px', 
              borderRadius: '8px', 
              border: '2px solid #ffc107',
              fontSize: '14px',
              fontWeight: 500
            }}>
              📝 Désinstallation : {UNINSTALL_PRICE.toFixed(2)} CHF si durée inférieure à 12 mois
              <div style={{ fontSize: '12px', marginTop: '8px', fontStyle: 'italic', color: '#666' }}>
                * Ce montant n'est pas inclus dans le total mais apparaîtra sur le devis
              </div>
            </div>
          </div>
                )}

        {/* Summary */}
        <div className="quote-summary">
          <h3>📊 Récapitulatif du devis</h3>
          <div className="summary-item">
            <span>Matériel</span>
            <span>{roundToFiveCents(roundToFiveCents(alarmTotals?.material?.total || 0) * (1 + TVA_RATE)).toFixed(2)} CHF TTC</span>
          </div>
          <div className="summary-item">
            <span>Installation</span>
            <span>{roundToFiveCents(roundToFiveCents(alarmTotals?.installation?.total || 0) * (1 + TVA_RATE)).toFixed(2)} CHF TTC</span>
          </div>
          <div className="summary-item">
            <span>Frais de dossier</span>
            <span>{roundToFiveCents(roundToFiveCents(alarmTotals?.adminFees?.total || 0) * (1 + TVA_RATE)).toFixed(2)} CHF TTC</span>
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
              marginTop: '15px',
              color: '#000'
            }}>
              <strong style={{ fontSize: '16px', color: '#000' }}>
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
              <label htmlFor="propertyTypeCamera">Type de bien</label>
              <select 
                id="propertyTypeCamera"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                style={{ padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '14px' }}
              >
                <option value="locaux">Locaux</option>
                <option value="habitation">Habitation</option>
                <option value="villa">Villa</option>
                <option value="commerce">Commerce</option>
                <option value="entreprise">Entreprise</option>
              </select>
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
            📹 Matériel
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
              <div key={line.id}>
                <div className="product-line">
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
                    {line.offered ? 'OFFERT' : line.product ? `${((line.customPrice || line.product.price || 0) * line.quantity).toFixed(2)} CHF` : '0.00 CHF'}
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
                {line.product?.isCustom && (
                  <div className="custom-product-fields" style={{ display: 'flex', gap: '10px', marginTop: '8px', paddingLeft: '10px', borderLeft: '3px solid #007bff' }}>
                    <input 
                      type="text"
                      placeholder="Nom du produit personnalisé"
                      value={line.customName || ''}
                      onChange={(e) => {
                        const newLines = [...cameraMaterialLines];
                        newLines[index] = { ...line, customName: e.target.value };
                        setCameraMaterialLines(newLines);
                      }}
                      style={{ flex: 2, padding: '8px', border: '2px solid #007bff', borderRadius: '6px', fontSize: '13px', background: '#f0f8ff' }}
                    />
                    <input 
                      type="number"
                      placeholder="Prix (CHF)"
                      value={line.customPrice || ''}
                      onChange={(e) => {
                        const newLines = [...cameraMaterialLines];
                        newLines[index] = { ...line, customPrice: parseFloat(e.target.value) || 0 };
                        setCameraMaterialLines(newLines);
                      }}
                      min="0"
                      step="0.01"
                      style={{ flex: 1, padding: '8px', border: '2px solid #007bff', borderRadius: '6px', fontSize: '13px', background: '#f0f8ff' }}
                    />
                  </div>
                )}
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
          <h3>🔧 Installation</h3>
          <div className="product-line" style={{ background: '#f0f8ff' }}>
            <div>Installation caméra</div>
            <div>
              <label style={{ marginRight: '5px', fontSize: '12px' }}>Demi-journées:</label>
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
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCameraInstallationPriceOverride(isNaN(val) ? null : val);
              }}
              className="discount-input" 
              placeholder="Prix" 
              style={{ background: cameraInstallationPriceOverride !== null ? '#fff3cd' : '#f0f0f0' }}
              title={cameraInstallationPriceOverride !== null ? 'Prix personnalisé' : 'Prix automatique (1 cam=350, 1/2j=690, 1j=1290)'}
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
              {cameraInstallationOffered ? 'OFFERT' : `${cameraInstallationPrice.toFixed(2)} CHF`}
            </div>
          </div>
          
          {/* Discount section */}
          <div className="discount-section">
            <label>Réduction:</label>
            <select 
              value={cameraInstallationDiscount.type}
              onChange={(e) => setCameraInstallationDiscount({ ...cameraInstallationDiscount, type: e.target.value as 'percent' | 'fixed' })}
            >
              <option value="percent">%</option>
              <option value="fixed">CHF</option>
            </select>
            <input 
              type="number" 
              value={cameraInstallationDiscount.value}
              onChange={(e) => setCameraInstallationDiscount({ ...cameraInstallationDiscount, value: parseFloat(e.target.value) || 0 })}
              placeholder="0" 
              min="0" 
              className="discount-input" 
            />
          </div>
        </div>

        {/* Vision à distance (only in sale mode) */}
        {!cameraRentalMode && (
          <div className="quote-section">
            <h3>📡 Vision à distance</h3>
            <div className="product-line">
              <div>
                Vision à distance (4G cameras + classic with modem)
                {cameraVisionDistance && cameraVisionPrice > 0 && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', background: '#f0f8ff', padding: '8px', borderRadius: '4px' }}>
                    <strong>Prix calculé: {cameraVisionPrice} CHF/mois</strong>
                    <div style={{ fontSize: '11px', marginTop: '3px' }}>
                      (20 CHF par caméra avec vision à distance)
                    </div>
                  </div>
                )}
              </div>
              <div></div>
              <div></div>
              <div className="checkbox-option" style={{ margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={cameraVisionDistance}
                  onChange={(e) => setCameraVisionDistance(e.target.checked)}
                />
                <label style={{ margin: 0, fontSize: '12px', marginLeft: '4px' }}>Activer</label>
              </div>
              <div className="price-display">
                {cameraVisionDistance && cameraVisionPrice > 0 ? `${cameraVisionPrice.toFixed(2)} CHF/mois` : '0.00 CHF/mois'}
              </div>
            </div>
            
            {/* Maintenance option */}
            <div className="product-line" style={{ marginTop: '15px' }}>
              <div>
                Contrat de maintenance
                {cameraMaintenance && cameraMaintenancePrice > 0 && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', background: '#f0f8ff', padding: '8px', borderRadius: '4px' }}>
                    <strong>Prix calculé: {cameraMaintenancePrice} CHF/mois</strong>
                    <div style={{ fontSize: '11px', marginTop: '3px' }}>
                      (10 CHF/item si &lt; 5, 5 CHF/item si ≥ 5 caméras + NVR)
                    </div>
                  </div>
                )}
              </div>
              <div></div>
              <div></div>
              <div className="checkbox-option" style={{ margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={cameraMaintenance}
                  onChange={(e) => setCameraMaintenance(e.target.checked)}
                />
                <label style={{ margin: 0, fontSize: '12px', marginLeft: '4px' }}>Activer</label>
              </div>
              <div className="price-display">
                {cameraMaintenance && cameraMaintenancePrice > 0 ? `${cameraMaintenancePrice.toFixed(2)} CHF/mois` : '0.00 CHF/mois'}
              </div>
            </div>
            
            {/* Warning if no modem/vision */}
            {!cameraVisionDistance && !cameraMaterialLines.some(line => line.product && line.product.name.toLowerCase().includes('modem')) && (
              <div style={{ 
                marginTop: '15px',
                padding: '12px',
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '6px',
                fontSize: '13px'
              }}>
                ⚠️ <strong>Attention:</strong> Sans MODEM ou vision à distance, les caméras ne pourront pas être consultées à distance.
              </div>
            )}
                  </div>
                )}

        {/* Payment Mode */}
        {!cameraRentalMode && (
          <PaymentSelector
            selectedMonths={cameraPaymentMonths}
            onSelect={setCameraPaymentMonths}
            label="Mode de paiement"
          />
        )}

        {/* Uninstall Note (Rental Mode Only) - Display only, not included in totals */}
        {cameraRentalMode && (
          <div className="quote-section">
            <h3>💰 Désinstallation</h3>
            <div style={{ 
              background: '#fff3cd', 
              padding: '15px', 
              borderRadius: '8px', 
              border: '2px solid #ffc107',
              fontSize: '14px',
              fontWeight: 500
            }}>
              📝 Désinstallation : {UNINSTALL_PRICE.toFixed(2)} CHF si durée inférieure à 12 mois
              <div style={{ fontSize: '12px', marginTop: '8px', fontStyle: 'italic', color: '#666' }}>
                * Ce montant n'est pas inclus dans le total mais apparaîtra sur le devis
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="quote-summary">
          <h3>📊 Récapitulatif du devis</h3>
          <div className="summary-item">
            <span>Matériel</span>
            <span>{roundToFiveCents(roundToFiveCents(cameraTotals?.material?.total || 0) * (1 + TVA_RATE)).toFixed(2)} CHF TTC</span>
                  </div>
          <div className="summary-item">
                    <span>Installation</span>
            <span>{roundToFiveCents(roundToFiveCents(cameraTotals?.installation?.total || 0) * (1 + TVA_RATE)).toFixed(2)} CHF TTC</span>
                  </div>
          {cameraRemoteAccess && !cameraRentalMode && (
            <div className="summary-item">
              <span>Vision à distance</span>
              <span>{calculateRemoteAccessPrice(cameraMaterialLines).toFixed(2)} CHF/mois</span>
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
              marginTop: '15px',
              color: '#000'
            }}>
              <strong style={{ fontSize: '16px', color: '#000' }}>
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

      {/* TAB FOG GENERATOR */}
      <div 
        id="fog-tab" 
        className="tab-content"
        style={{ display: currentTab === 'fog' ? 'block' : 'none' }}
      >
        <div className="form-section">
          <h3>📋 Informations Client</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="clientName-fog">Nom du client</label>
              <input 
                type="text" 
                id="clientName-fog"
                placeholder="Nom complet du client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="propertyType-fog">Type de bien</label>
              <select 
                id="propertyType-fog"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
              >
                <option value="locaux">Locaux</option>
                <option value="habitation">Habitation</option>
                <option value="villa">Villa</option>
                <option value="commerce">Commerce</option>
                <option value="entreprise">Entreprise</option>
              </select>
            </div>
          </div>

          <CommercialSelector
            value={commercial}
            customValue={customCommercial}
            showCustom={showCustomCommercial}
            onValueChange={setCommercial}
            onCustomValueChange={setCustomCommercial}
            onShowCustomChange={setShowCustomCommercial}
            commercialsList={COMMERCIALS_LIST}
          />
        </div>

        {/* Kit de base */}
        <div className="quote-section">
          <h3>💨 Kit de base</h3>
          <ProductSection
            title=""
            lines={fogLines}
            productCatalog={CATALOG_FOG_PRODUCTS}
            centralType={null}
            onLinesChange={setFogLines}
            emoji="💨"
          />
        </div>

        {/* Installation */}
        <div className="quote-section">
          <h3>🔧 Installation et paramétrage</h3>
          <div className="product-line">
            <div>Installation et paramétrage</div>
            <input type="number" defaultValue="1" className="quantity-input" readOnly />
            <input 
              type="number" 
              value={fogInstallationPrice}
              onChange={(e) => setFogInstallationPrice(parseFloat(e.target.value) || 490)}
              className="price-input"
              onFocus={(e) => e.target.select()}
            />
            <div className="price-display">
              {fogInstallationPrice.toFixed(2)} CHF
            </div>
          </div>
        </div>

        {/* Frais de dossier */}
        <div className="quote-section">
          <h3>📄 Frais de dossier</h3>
          <div className="product-line">
            <div>Frais de dossier</div>
            <input type="number" defaultValue="1" className="quantity-input" readOnly />
            <input 
              type="number" 
              value={fogProcessingFee}
              onChange={(e) => setFogProcessingFee(parseFloat(e.target.value) || 190)}
              className="price-input"
              onFocus={(e) => e.target.select()}
            />
            <div className="checkbox-option" style={{ margin: 0 }}>
              <input 
                type="checkbox" 
                checked={fogProcessingOffered}
                onChange={(e) => setFogProcessingOffered(e.target.checked)}
                className="offered-checkbox" 
              />
              <label style={{ margin: 0, fontSize: '12px' }}>OFFERT</label>
            </div>
            <div className="price-display">
              {fogProcessingOffered ? 'OFFERT' : `${fogProcessingFee.toFixed(2)} CHF`}
            </div>
          </div>

          <div className="product-line">
            <div>Carte SIM</div>
            <input type="number" defaultValue="1" className="quantity-input" readOnly />
            <input 
              type="number" 
              value={fogSimCard}
              onChange={(e) => setFogSimCard(parseFloat(e.target.value) || 50)}
              className="price-input"
              onFocus={(e) => e.target.select()}
            />
            <div className="checkbox-option" style={{ margin: 0 }}>
              <input 
                type="checkbox" 
                checked={fogSimCardOffered}
                onChange={(e) => setFogSimCardOffered(e.target.checked)}
                className="offered-checkbox" 
              />
              <label style={{ margin: 0, fontSize: '12px' }}>OFFERT</label>
            </div>
            <div className="price-display">
              {fogSimCardOffered ? 'OFFERT' : `${fogSimCard.toFixed(2)} CHF`}
            </div>
          </div>
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

      {/* TAB VISIOPHONE */}
      <div 
        id="visiophone-tab" 
        className="tab-content"
        style={{ display: currentTab === 'visiophone' ? 'block' : 'none' }}
      >
        <div className="form-section">
          <h3>📋 Informations Client</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="clientName-visio">Nom du client</label>
              <input 
                type="text" 
                id="clientName-visio"
                placeholder="Nom complet du client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="propertyType-visio">Type de bien</label>
              <select 
                id="propertyType-visio"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
              >
                <option value="locaux">Locaux</option>
                <option value="habitation">Habitation</option>
                <option value="villa">Villa</option>
                <option value="commerce">Commerce</option>
                <option value="entreprise">Entreprise</option>
              </select>
            </div>
          </div>

          <CommercialSelector
            value={commercial}
            customValue={customCommercial}
            showCustom={showCustomCommercial}
            onValueChange={setCommercial}
            onCustomValueChange={setCustomCommercial}
            onShowCustomChange={setShowCustomCommercial}
            commercialsList={COMMERCIALS_LIST}
          />
        </div>

        {/* Matériel */}
        <div className="quote-section">
          <h3>📞 Matériel</h3>
          <ProductSection
            title=""
            lines={visiophoLines}
            productCatalog={CATALOG_VISIOPHONE_PRODUCTS}
            centralType={null}
            onLinesChange={setVisiophoLines}
            emoji="📞"
          />
        </div>

        {/* Installation */}
        <div className="quote-section">
          <h3>🔧 Installation et paramétrage</h3>
          <div className="product-line">
            <div>Installation et paramétrage</div>
            <input type="number" defaultValue="1" className="quantity-input" readOnly />
            <input 
              type="number" 
              value={visiophoInstallationPrice}
              onChange={(e) => setVisiophoInstallationPrice(parseFloat(e.target.value) || 690)}
              className="price-input"
              onFocus={(e) => e.target.select()}
            />
            <div className="price-display">
              {visiophoInstallationPrice.toFixed(2)} CHF
            </div>
          </div>
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

            {/* Titane Kits - MUST BE FIRST */}
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
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
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
              <button
                onClick={() => applyKit('titane', 'none')}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'white',
                  border: '2px dashed #f4e600',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#666',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fffef0'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                ➕ Kit de base à partir de rien (Titane)
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
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
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
              <button
                onClick={() => applyKit('jablotron', 'none')}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'white',
                  border: '2px dashed #6c757d',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#666',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                ➕ Kit de base à partir de rien (Jablotron)
              </button>
            </div>

            {/* XTO Kit - NEW */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                color: '#666',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Kit XTO (Location mensuelle)
              </h3>
              <button
                onClick={() => {
                  // Add XTO centrale to alarm lines
                  const xtoProducts = CATALOG_XTO_PRODUCTS.map((prod, index) => ({
                    id: Date.now() + index,
                    product: { id: prod.id, name: prod.name, price: prod.monthlyPrice } as any,
                    quantity: prod.id === 402 ? 4 : 1, // 4 cameras by default
                    offered: false
                  }));
                  setAlarmMaterialLines(xtoProducts);
                  setShowKitModal(false);
                }}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: 'white',
                  border: '2px solid #28a745',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f0fff4';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(40,167,69,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '8px', color: '#333' }}>Kit Complet XTO</div>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                  1 Centrale XTO<br />
                  1 Sirène extérieure avec gyrophare (50 CHF/mois)<br />
                  4 Caméras à détection infrarouge (100 CHF/mois)<br />
                  1 Lecteur de badge + 8 badges (30 CHF/mois)<br />
                  + Centre d&apos;intervention GS inclus
                </div>
              </button>
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

