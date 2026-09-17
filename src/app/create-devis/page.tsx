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
import { getCommercialInfo, setCommercials } from '@/lib/config';
import { calculateAlarmTotals, calculateCameraTotals } from '@/lib/calculations';
import { CATALOG_ALARM_PRODUCTS, CATALOG_CAMERA_MATERIAL, CATALOG_XTO_PRODUCTS, XTO_KIT_LINES, UNINSTALL_PRICE, TVA_RATE, roundToFiveCents, setTvaRate, setAdminFees, type AlarmProduct, type VisiophoProduct, type FogProduct, type CameraProduct } from '@/lib/quote-generator';
import { ProductLineData } from '@/components/ProductLine';
import { CommercialSelector } from '@/components/CommercialSelector';
import { ServicesSection } from '@/components/ServicesSection';
import { AppSidebar } from '@/components/AppSidebar';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { OptionsSection } from '@/components/OptionsSection';
import { PaymentSelector } from '@/components/PaymentSelector';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { detectCentralType, calculateRemoteAccessPrice } from '@/lib/product-line-adapter';

export default function CreateDevisPage() {
  const [mounted, setMounted] = useState(false);

  // Commercials directory — fetched live from the "Conseiller" Google Sheet
  // via /api/commercials (see useEffect below). No static fallback: an
  // empty list / commercialsError means the sheet fetch failed.
  const [commercialsList, setCommercialsList] = useState<string[]>([]);
  const [commercialsError, setCommercialsError] = useState<string | null>(null);

  // Client info state
  const [clientName, setClientName] = useState('');
  // Nouveaux champs (n'existaient pas avant cette refonte) — pas encore
  // branches au PDF ni a l'enregistrement du devis, juste capturables dans
  // le formulaire pour l'instant.
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [commercial, setCommercial] = useState('');
  const [customCommercial, setCustomCommercial] = useState('');
  const [showCustomCommercial, setShowCustomCommercial] = useState(false);
  const [propertyType, setPropertyType] = useState<'locaux' | 'habitation' | 'villa' | 'commerce' | 'entreprise'>('locaux');
  
  // Product lines state - now using ProductLineData type
  const [alarmMaterialLines, setAlarmMaterialLines] = useState<ProductLineData[]>([]);
  // Master toggle for the kit's "offert" state — client feedback: kits are
  // usually offered (the client only pays frais de dossier/matériel
  // supplémentaire/installation/etc.), so it defaults on and flips every
  // current kit line at once instead of toggling each line individually.
  const [kitOffert, setKitOffert] = useState(true);
  const [alarmInstallationLines, setAlarmInstallationLines] = useState<ProductLineData[]>([]);
  const [cameraMaterialLines, setCameraMaterialLines] = useState<ProductLineData[]>([]);
  
  // Discounts state
  const [alarmMaterialDiscount, setAlarmMaterialDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  const [alarmInstallationDiscount, setAlarmInstallationDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  const [cameraMaterialDiscount, setCameraMaterialDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  const [cameraInstallationDiscount, setCameraInstallationDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  
  // Installation state
  const [alarmInstallationPrice, setAlarmInstallationPrice] = useState(300); // 300 CHF editable (client feedback)
  const [alarmInstallationOffered, setAlarmInstallationOffered] = useState(false);
  const [isCustomKit, setIsCustomKit] = useState(false); // Track if "à partir de rien" was selected
  const [customSurveillanceType, setCustomSurveillanceType] = useState<'autosurveillance' | 'telesurveillance'>('autosurveillance');
  const [customSurveillancePrice, setCustomSurveillancePrice] = useState(0);
  
  // Camera installation: demi-journée / journée lines (like alarm was - client feedback)
  const [cameraInstallationLines, setCameraInstallationLines] = useState<ProductLineData[]>([]);
  const [cameraInstallationOffered, setCameraInstallationOffered] = useState(false);
  const [cameraInstallationPayCash, setCameraInstallationPayCash] = useState(false); // Pay installation cash, exclude from payment facilities

  // Compute camera installation total and half-days from lines (for totals)
  const { cameraInstallationTotalFromLines, cameraInstallationHalfDays } = useMemo(() => {
    let total = 0;
    let halfDays = 0;
    for (const line of cameraInstallationLines) {
      if (line.offered || !line.product) continue;
      const price = (line.product as { price?: number }).price ?? 0;
      total += price * line.quantity;
      const name = line.product.name || '';
      halfDays += name.includes('1 journée') ? line.quantity * 2 : line.quantity;
    }
    return { cameraInstallationTotalFromLines: total, cameraInstallationHalfDays: halfDays };
  }, [cameraInstallationLines]);
  
  // Admin fees state
  const [simcardSelected, setSimcardSelected] = useState(false); // Whether SIM card is selected at all
  const [simcardOffered, setSimcardOffered] = useState(false);
  const [processingSelected, setProcessingSelected] = useState(true); // Frais de dossier included by default
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
  // Which central is highlighted in the inline Kit de base cards before any
  // kit has actually been applied yet (alarmMaterialLines is still empty).
  const [preCentral, setPreCentral] = useState<'titane' | 'jablotron'>('titane');
  // Which kit number (1 or 2) is currently applied, so the kit cards stay
  // visible and highlighted after selection instead of disappearing —
  // client feedback: don't replace the cards with the product-line list,
  // keep both visible at once.
  const [selectedKitNumber, setSelectedKitNumber] = useState<1 | 2 | null>(null);
  
  // Engagement duration state
  const [engagementMonths, setEngagementMonths] = useState(48);
  
  // New alarm options state
  // (interventionPayante/interventionPolice/telesurveillanceOption removed
  // -- client feedback, no longer needed)
  
  // Camera 4G and maintenance state
  const [cameraVisionDistance, setCameraVisionDistance] = useState(false);
  const [cameraVisionPrice, setCameraVisionPrice] = useState(0);
  const [cameraMaintenance, setCameraMaintenance] = useState(false);
  const [cameraMaintenancePrice, setCameraMaintenancePrice] = useState(0);
  
  // Fog generator state
  const [fogLines, setFogLines] = useState<ProductLineData[]>([]);
  // No hardcoded fallback (same decision as Visiophone): starts empty,
  // filled once /api/products/fog resolves. fogCatalogError drives a
  // visible banner if the Sheet can't be reached.
  const [fogCatalog, setFogCatalog] = useState<FogProduct[]>([]);
  const [fogCatalogError, setFogCatalogError] = useState<string | null>(null);
  // Titane/Jablotron only — XTO stays on its own hardcoded catalog for now.
  const [alarmCatalog, setAlarmCatalog] = useState<AlarmProduct[]>([]);
  const [alarmKits, setAlarmKits] = useState<Record<string, { ref: string; quantity: number }[]>>({});
  const [alarmInstallationPrices, setAlarmInstallationPrices] = useState<{ titane: number | null; jablotron: number | null }>({ titane: null, jablotron: null });
  const [cameraCatalog, setCameraCatalog] = useState<CameraProduct[]>([]);
  const [cameraInstallationProducts, setCameraInstallationProducts] = useState<CameraProduct[]>([]);
  const [cameraCatalogError, setCameraCatalogError] = useState<string | null>(null);
  // Flat REF -> value map from the Config sheet (TVA, SIM, FD, surveillance
  // service prices, camera vision-à-distance/maintenance prices).
  const [configValues, setConfigValues] = useState<Record<string, number>>({});
  const [configError, setConfigError] = useState<string | null>(null);
  const [alarmCatalogError, setAlarmCatalogError] = useState<string | null>(null);
  const [fogAdditionalLines, setFogAdditionalLines] = useState<ProductLineData[]>([]);
  const [fogInstallationPrice, setFogInstallationPrice] = useState(490);
  const [fogProcessingFee, setFogProcessingFee] = useState(190);
  const [fogSimCard, setFogSimCard] = useState(50);
  const [fogProcessingSelected, setFogProcessingSelected] = useState(true);
  const [fogProcessingOffered, setFogProcessingOffered] = useState(false);
  const [fogSimCardOffered, setFogSimCardOffered] = useState(false);
  const [fogSimCardSelected, setFogSimCardSelected] = useState(false); // Whether SIM card is selected
  const [fogPaymentMonths, setFogPaymentMonths] = useState(48);
  
  // Visiophone state
  const [visiophoLines, setVisiophoLines] = useState<ProductLineData[]>([]);
  // No hardcoded fallback (client decision): starts empty, filled once
  // /api/products/visiophone resolves. visiophoneCatalogError drives a
  // visible message in the UI if the Sheet can't be reached, instead of
  // silently showing stale data. See fetchVisiophoneProductsFromSheet for
  // why Visiophone was the first category moved off the hardcoded catalog.
  const [visiophoneCatalog, setVisiophoneCatalog] = useState<VisiophoProduct[]>([]);
  const [visiophoneCatalogError, setVisiophoneCatalogError] = useState<string | null>(null);
  const [visiophoInstallationPrice, setVisiophoInstallationPrice] = useState(690);
  const [visiophoPaymentMonths, setVisiophoPaymentMonths] = useState(48);
  
  // Auto-detect selected central from product lines
  const selectedCentral = useMemo(() => {
    return detectCentralType(alarmMaterialLines);
  }, [alarmMaterialLines]);
  
  // Apply kit function
  const applyKit = (centralType: 'titane' | 'jablotron', kitType: 'kit1' | 'kit2' | 'none') => {
    const centralRef = centralType === 'jablotron' ? 'JAB-CEN' : 'TIT-CEN';
    const centralProduct = alarmCatalog.find(p => (p as any).ref === centralRef);
    setPreCentral(centralType);

    // Installation (TIT-INS/JAB-INS) is not a material line — it feeds the
    // separate "🔧 Installation" section's price instead (client request).
    // Set whenever a kit or centrale is applied, same trigger as resetting
    // the material lines, so it always matches the chosen central.
    const installationPrice = alarmInstallationPrices[centralType];
    if (installationPrice !== null) {
      setAlarmInstallationPrice(installationPrice);
    }
    
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
      setSelectedKitNumber(null);
      setIsCustomKit(true); // Mark as custom kit
      return;
    }
    
    // Kit contents (which refs, at what quantity — including the centrale
    // itself and the auto-included Application line) come straight from the
    // Sheet's "Inclu"/"QTE" columns for the matching kit, instead of a
    // hardcoded per-product list. Installation is excluded upstream (see
    // fetchAlarmProductsFromSheet) even if flagged included in the sheet.
    const kitKey = `KIT-${centralType === 'jablotron' ? 'JAB' : 'TIT'}-${kitType === 'kit1' ? '1' : '2'}`;
    const kitItems = alarmKits[kitKey] || [];

    const newLines: ProductLineData[] = kitItems.map((item, index) => {
      const product = alarmCatalog.find(p => (p as any).ref === item.ref);
      return {
        id: Date.now() + index,
        product: product || null,
        quantity: item.quantity,
        offered: kitOffert
      };
    }).filter(line => line.product);

    setAlarmMaterialLines(newLines);
    setSelectedKitNumber(kitType === 'kit1' ? 1 : 2);
    setIsCustomKit(false); // Reset custom kit flag for normal kits
  };

  // Builds "2 Détecteur volumétrique (radio)" style lines for the kit
  // preview cards in the "Sélectionner un kit de base" modal, straight from
  // the Sheet's kit contents — replaces hardcoded descriptions that used to
  // drift from reality (client feedback: kit contents must match the sheet
  // exactly). Centrale and Application are omitted, matching the wording
  // convention the old hardcoded text already used.
  const kitSummaryLines = (kitKey: string): string[] =>
    (alarmKits[kitKey] || [])
      .filter(item => !item.ref.endsWith('-APP'))
      .map(item => {
        const product = alarmCatalog.find(p => (p as any).ref === item.ref);
        return `${item.quantity} ${product?.name || item.ref}`;
      });
  const titaneCentralProduct = alarmCatalog.find(p => (p as any).ref === 'TIT-CEN');
  const jablotronCentralProduct = alarmCatalog.find(p => (p as any).ref === 'JAB-CEN');

  // Calculate alarm totals with default values
  const alarmTotals = useMemo(() => {
    try {
      return calculateAlarmTotals(
        alarmMaterialLines,
        alarmInstallationLines.filter(l => l.product && l.product.id !== 101 && l.product.id !== 102), // Matériel divers only (no half-day lines)
        alarmMaterialDiscount,
        alarmInstallationDiscount,
        {
          quantity: 0,
          isOffered: alarmInstallationOffered,
          price: alarmInstallationPrice
        },
        {
          simCardSelected: simcardSelected,
          simCardOffered: simcardOffered,
          processingSelected: processingSelected,
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
        alarmCatalog
      );
    } catch (error) {
      console.error('Error calculating alarm totals:', error);
      return {
        material: { subtotal: 0, discount: 0, total: 0, totalBeforeDiscount: 0, discountDisplay: '' },
        installation: { subtotal: 0, discount: 0, total: 0, totalBeforeDiscount: 0, discountDisplay: '' },
        installationFeeOnly: 0,
        adminFees: { simCard: 0, processing: 0, total: 0 },
        services: { testCyclique: 0, surveillance: 0 },
        totalHT: 0,
        totalTTC: 0
      };
    }
  }, [
    alarmMaterialLines,
    alarmInstallationLines,
    alarmInstallationPrice,
    alarmInstallationOffered,
    alarmMaterialDiscount,
    alarmInstallationDiscount,
    simcardSelected,
    simcardOffered,
    processingSelected,
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
  
  // Auto-calculate vision à distance price using correct logic
  useEffect(() => {
    if (!cameraVisionDistance) {
      setCameraVisionPrice(0);
      return;
    }
    
    // Use the correct calculation function — price per camera comes from
    // Config (CAM-VIS-DIS), falls back to 20 if not loaded yet.
    const totalPrice = calculateRemoteAccessPrice(cameraMaterialLines, configValues['CAM-VIS-DIS'] ?? 20);
    setCameraVisionPrice(totalPrice);
  }, [cameraMaterialLines, cameraVisionDistance, configValues]);
  
  // Auto-check vision à distance when modem or 4G camera is selected
  useEffect(() => {
    const hasModem = cameraMaterialLines.some(
      (line) => line.product && (line.product as any).type === 'Modem'
    );
    
    const has4GCamera = cameraMaterialLines.some(
      (line) => line.product && (line.product as any).is4G
    );
    
    if ((hasModem || has4GCamera) && !cameraVisionDistance) {
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
      (line) => line.product && (line.product as any).type === 'Caméra'
    ).reduce((sum, line) => sum + line.quantity, 0);
    
    // Count NVRs
    const nvrCount = cameraMaterialLines.filter(
      (line) => line.product && (line.product as any).type === 'NVR'
    ).reduce((sum, line) => sum + line.quantity, 0);
    
    const totalItems = cameraCount + nvrCount;
    // Tier prices from Config (CAM-CM-5 = up to 5 items, CAM-CM+5 = more
    // than 5), falls back to the old hardcoded 10/5 if not loaded yet.
    const pricePerItem = totalItems >= 5
      ? (configValues['CAM-CM+5'] ?? 5)
      : (configValues['CAM-CM-5'] ?? 10);
    const totalPrice = totalItems * pricePerItem;
    
    setCameraMaintenancePrice(totalPrice);
  }, [cameraMaterialLines, cameraMaintenance, configValues]);
  
  // Initialize Fog kit de base on mount. Matches by REF (GEN-BRO/GEN-CLA/
  // GEN-VOL) rather than a hardcoded id, since ids for sheet-sourced rows
  // are assigned by row order — the REF is the stable key.
  useEffect(() => {
    if (fogLines.length === 0 && fogCatalog.length > 0) {
      const fogKit = [
        { ref: 'GEN-BRO', quantity: 1, offered: true }, // Générateur
        { ref: 'GEN-CLA', quantity: 1, offered: true }, // Clavier
        { ref: 'GEN-VOL', quantity: 1, offered: true }, // Détecteur
      ];
      
      const newLines: ProductLineData[] = fogKit.map((item, index) => {
        const product = fogCatalog.find(p => p.ref === item.ref);
        return {
          id: Date.now() + index,
          product: product || null,
          quantity: item.quantity,
          offered: item.offered
        };
      });
      
      setFogLines(newLines);
    }
  }, [fogCatalog]);
  
  // Initialize Visiophone products on mount. Matches by name rather than a
  // hardcoded id since ids for sheet-sourced products are assigned by row
  // order, not fixed — see fetchVisiophoneProductsFromSheet. Depends on
  // visiophoneCatalog so this still finds the right products once the live
  // fetch replaces the static fallback the state started from.
  useEffect(() => {
    if (visiophoLines.length === 0 && visiophoneCatalog.length > 0) {
      const visiophoKit = [
        { match: 'Interphone', quantity: 1, offered: false },
        { match: 'Ecran', quantity: 1, offered: false }, // matches "Écran"/"Ecran complémentaire" either way
      ];
      
      const newLines: ProductLineData[] = visiophoKit.map((item, index) => {
        const product = visiophoneCatalog.find(p => p.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(item.match));
        return {
          id: Date.now() + index,
          product: product || null,
          quantity: item.quantity,
          offered: item.offered
        };
      });
      
      setVisiophoLines(newLines);
    }
  }, [visiophoneCatalog]);
  
  // Calculate camera totals with default values
  const cameraTotals = useMemo(() => {
    try {
      return calculateCameraTotals(
        cameraMaterialLines,
        cameraMaterialDiscount,
        {
          quantity: cameraInstallationHalfDays,
          isOffered: cameraInstallationOffered,
          price: cameraInstallationTotalFromLines
        },
        cameraInstallationDiscount,
        cameraInstallationPayCash,
        cameraRemoteAccess,
        cameraPaymentMonths,
        cameraRentalMode,
        cameraCatalog
      );
    } catch (error) {
      console.error('Error calculating camera totals:', error);
      return {
        material: { subtotal: 0, discount: 0, total: 0, totalBeforeDiscount: 0, discountDisplay: '' },
        installation: { subtotal: 0, discount: 0, total: 0, totalBeforeDiscount: 0, discountDisplay: '' },
        remoteAccess: { enabled: false, price: 0 },
        totalHT: cameraInstallationOffered ? 0 : roundToFiveCents(cameraInstallationTotalFromLines),
        totalTTC: cameraInstallationOffered ? 0 : roundToFiveCents(roundToFiveCents(cameraInstallationTotalFromLines) * (1 + TVA_RATE))
      };
    }
  }, [
    cameraMaterialLines,
    cameraMaterialDiscount,
    cameraInstallationLines,
    cameraInstallationTotalFromLines,
    cameraInstallationHalfDays,
    cameraInstallationOffered,
    cameraInstallationDiscount,
    cameraInstallationPayCash,
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

  useEffect(() => {
    fetch('/api/commercials')
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) {
          throw new Error(result.error || 'Échec du chargement des commerciaux');
        }
        setCommercials(result.data.commercials);
        setCommercialsList(Object.keys(result.data.commercials));
      })
      .catch((error) => {
        console.error('❌ Failed to load commercials from Google Sheet:', error);
        setCommercialsError(
          error instanceof Error ? error.message : 'Échec du chargement des commerciaux'
        );
      });
  }, []);

  // Soft pre-fill only — /create-devis stays fully usable without ever
  // logging in. If the browser happens to already have an active session
  // (the conseiller used the magic link at least once, e.g. to check
  // /mes-devis), and it resolves to a known commercial_name, use it as the
  // starting value here so they don't have to pick their own name from the
  // list every time. Never overrides a value they've already set by hand.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('commercial_name')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          const name = (data as { commercial_name?: string } | null)?.commercial_name;
          if (name) {
            setCommercial((current) => current || name);
          }
        });
    }).catch(() => {
      // No session, or Supabase not configured on this environment — fine,
      // the field just stays manually selectable as before.
    });
  }, []);

  useEffect(() => {
    fetch('/api/products/visiophone')
      .then((res) => res.json())
      .then((result) => {
        if (!result.success || !Array.isArray(result.data?.products) || result.data.products.length === 0) {
          throw new Error(result.error || 'Catalogue Visiophone vide ou invalide');
        }
        // "Autre" (custom product) is a code-level UI feature, not a sheet
        // product — always appended so the existing id===99 lookups keep working.
        setVisiophoneCatalog([
          ...result.data.products,
          { id: 99, name: 'Autre', price: 0, isCustom: true },
        ]);
        setVisiophoneCatalogError(null);
        // Seeds the price shown in "🔧 Installation et paramétrage" from the
        // sheet's "Installation et paramétrage" row (client request) — the
        // field stays editable, this only sets its starting value.
        if (typeof result.data.installationPrice === 'number') {
          setVisiophoInstallationPrice(result.data.installationPrice);
        }
      })
      .catch((error) => {
        console.error('❌ Failed to load Visiophone catalog from Google Sheet:', error);
        setVisiophoneCatalogError(
          error instanceof Error ? error.message : 'Échec du chargement des produits Visiophone'
        );
      });
  }, []);

  useEffect(() => {
    fetch('/api/products/fog')
      .then((res) => res.json())
      .then((result) => {
        if (!result.success || !Array.isArray(result.data?.products) || result.data.products.length === 0) {
          throw new Error(result.error || 'Catalogue Fog vide ou invalide');
        }
        // "Autre" (custom product) is a code-level UI feature, not a sheet
        // product — always appended so the existing id===99 lookups keep working.
        setFogCatalog([
          ...result.data.products,
          { id: 99, name: 'Autre', price: 0, isCustom: true },
        ]);
        setFogCatalogError(null);
      })
      .catch((error) => {
        console.error('❌ Failed to load Fog catalog from Google Sheet:', error);
        setFogCatalogError(
          error instanceof Error ? error.message : 'Échec du chargement des produits Générateur de brouillard'
        );
      });
  }, []);

  useEffect(() => {
    fetch('/api/products/alarm')
      .then((res) => res.json())
      .then((result) => {
        if (!result.success || !Array.isArray(result.data?.products) || result.data.products.length === 0) {
          throw new Error(result.error || 'Catalogue Alarme vide ou invalide');
        }
        // "Autre" (custom product) is a code-level UI feature, not a sheet
        // product — always appended so the existing id===99 lookups keep working.
        setAlarmCatalog([
          ...result.data.products,
          { id: 99, name: 'Autre', price: 0, isCustom: true },
        ]);
        setAlarmKits(result.data.kits || {});
        setAlarmInstallationPrices(result.data.installationPrices || { titane: null, jablotron: null });
        setAlarmCatalogError(null);
      })
      .catch((error) => {
        console.error('❌ Failed to load Alarm catalog from Google Sheet:', error);
        setAlarmCatalogError(
          error instanceof Error ? error.message : 'Échec du chargement des produits Alarme'
        );
      });
  }, []);

  useEffect(() => {
    fetch('/api/products/camera')
      .then((res) => res.json())
      .then((result) => {
        if (!result.success || !Array.isArray(result.data?.products) || result.data.products.length === 0) {
          throw new Error(result.error || 'Catalogue Caméras vide ou invalide');
        }
        // "Autre" (custom product) is a code-level UI feature, not a sheet
        // product — always appended so the existing id===99 lookups keep working.
        setCameraCatalog([
          ...result.data.products,
          { id: 99, name: 'Autre', price: 0, isCustom: true },
        ]);
        setCameraInstallationProducts(result.data.installationProducts || []);
        setCameraCatalogError(null);
      })
      .catch((error) => {
        console.error('❌ Failed to load Camera catalog from Google Sheet:', error);
        setCameraCatalogError(
          error instanceof Error ? error.message : 'Échec du chargement des produits Caméras'
        );
      });
  }, []);

  useEffect(() => {
    fetch('/api/config-values')
      .then((res) => res.json())
      .then((result) => {
        if (!result.success || !result.data?.config) {
          throw new Error(result.error || 'Configuration vide ou invalide');
        }
        const config: Record<string, number> = result.data.config;
        setConfigValues(config);
        setConfigError(null);

        // TVA and admin fees (Carte SIM + Activation, Frais de dossier) are
        // now single global rows in Config (client consolidated what used
        // to be separate per-category duplicates — they were all identical
        // anyway). Applying them here updates every category at once.
        if (typeof config['TVA'] === 'number') setTvaRate(config['TVA']);
        if (typeof config['SIM'] === 'number' && typeof config['FD'] === 'number') {
          setAdminFees(config['SIM'], config['FD']);
        }
        // Fog keeps its own editable state for these two fields (unlike
        // Alarm, which reads ADMIN_FEES directly) — seed their starting
        // value from Config too, field stays editable afterwards.
        if (typeof config['SIM'] === 'number') setFogSimCard(config['SIM']);
        if (typeof config['FD'] === 'number') setFogProcessingFee(config['FD']);
      })
      .catch((error) => {
        console.error('❌ Failed to load Config values from Google Sheet:', error);
        setConfigError(
          error instanceof Error ? error.message : 'Échec du chargement de la configuration'
        );
      });
  }, []);

  
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
      const finalClientName = clientName;
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
      const isAlarm = currentTab === 'alarm';
      const isCamera = currentTab === 'camera';
      const isFog = currentTab === 'fog';
      const isVisio = currentTab === 'visiophone';
      const isXto = isAlarm && alarmMaterialLines.some(l => l.product && l.product.isXTO);
      const totals = isAlarm ? alarmTotals : isCamera ? cameraTotals : undefined;

      const generatedPdf = await generatePDF({
        type: currentTab,
        clientName: finalClientName,
        commercial: finalCommercial,
        isRental: isAlarm ? alarmRentalMode : isCamera ? cameraRentalMode : false,
        materialLines: isAlarm ? alarmMaterialLines : isCamera ? cameraMaterialLines : isFog ? fogLines : visiophoLines,
        installationLines: isAlarm ? alarmInstallationLines : isCamera ? cameraInstallationLines : isFog ? fogAdditionalLines : [],
        installationQty: isCamera ? cameraInstallationHalfDays : undefined,
        remoteAccess: isCamera ? cameraVisionDistance : undefined,
        totals,
        simCardSelected: isAlarm ? simcardSelected : undefined,
        processingSelected: isAlarm ? processingSelected : undefined,
        paymentMonths: isAlarm ? alarmPaymentMonths : isCamera ? cameraPaymentMonths : isFog ? fogPaymentMonths : visiophoPaymentMonths,
        quoteNumberPrefixOverride: isFog ? 'GB' : isVisio ? 'VISIO' : undefined,
        feesConfig: isFog ? {
          installationPrice: fogInstallationPrice,
          processingFee: fogProcessingFee,
          processingSelected: fogProcessingSelected,
          processingOffered: fogProcessingOffered,
          simCard: fogSimCard,
          simCardSelected: fogSimCardSelected,
          simCardOffered: fogSimCardOffered,
        } : isVisio ? {
          installationPrice: visiophoInstallationPrice,
        } : undefined,
        services: isAlarm ? {
          testCyclique: { selected: testCycliqueSelected, price: testCycliquePrice, offered: testCycliqueOffered },
          surveillance: { type: surveillanceType || null, price: surveillancePrice, offered: surveillanceOffered }
        } : undefined,
        options: isAlarm ? {
          interventionsGratuites,
          interventionsAnnee,
          interventionsQty,
          serviceCles
        } : undefined
      });

      const filename = `devis-${finalClientName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      let finalBlob = generatedPdf.blob;
      let products: string[] = [];
      let assemblyInfo: { baseDossier: string; productsFound: number; totalPages: number } | undefined;

      // Steps 2-3: Assemble with the Drive base template. Fog + visiophone
      // assemble too IF GOOGLE_DRIVE_FILE_FOG / GOOGLE_DRIVE_FILE_VISIOPHONE
      // are set; otherwise assemblePdf falls back to the standalone PDF.
      if (isAlarm || isCamera || isFog || isVisio) {
        console.log('🔄 Step 2: Collecting products...');
        const allProductLines = isAlarm
          ? { material: alarmMaterialLines, installation: alarmInstallationLines }
          : isCamera
          ? { material: cameraMaterialLines, installation: cameraInstallationLines }
          : { material: [], installation: [] }; // fog/visio: no product sheets
        products = isAlarm || isCamera ? collectAllProducts(allProductLines) : [];

        console.log('🔄 Step 3: Assembling PDF...');
        const validatedCommercialInfo = commercialInfo || {
          phone: '06 XX XX XX XX',
          email: `${finalCommercial.toLowerCase().replace(/\s+/g, '.')}@dialarme.fr`
        };
        const assembled = await assemblePdf({
          pdfBlob: generatedPdf.blob,
          quoteType: isAlarm ? 'alarme' : isCamera ? 'video' : isFog ? 'fog' : 'visiophone',
          centralType: selectedCentral || null,
          products,
          commercial: {
            name: finalCommercial,
            phone: validatedCommercialInfo.phone,
            email: validatedCommercialInfo.email
          },
          propertyType,
          addPoliceDoc: false // Option retiree de l'UI (client feedback) -- toujours false desormais
        });
        finalBlob = assembled.blob;
        assemblyInfo = assembled.info;
      }

      // Step 4: Send quote (upload to Drive, send email, log to DB)
      console.log('🔄 Step 4: Sending quote...');
      const result = await sendQuote({
        pdfBlob: finalBlob,
        filename,
        commercial: finalCommercial,
        clientName: finalClientName,
        type: isCamera ? 'video' : 'alarme',
        centralType: selectedCentral || undefined,
        isXtoAlarm: isXto || undefined,
        products,
        assemblyInfo
      });
      
      if (result.success) {
        // Step 5: Trigger automatic download
        console.log('🔄 Step 5: Triggering automatic PDF download...');
        try {
          const pdfBytes = await finalBlob.arrayBuffer();
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
    <div style={{ display: 'flex', background: '#0a0a0a' }}>
      <AppSidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span id="currentDate" style={{ fontSize: 12, color: '#8a8a8a' }}>{getCurrentDate()}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: '#2a2a2a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#fffd01', flex: 'none'
            }}>
              {commercial ? commercial.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#fff', lineHeight: 1.2 }}>{commercial || 'Aucun conseiller sélectionné'}</div>
              <div style={{ fontSize: 10, color: '#6a6a6a', lineHeight: 1.2 }}>Conseiller</div>
            </div>
          </div>
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

      {commercialsError && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          margin: '20px 0',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ Impossible de charger la liste des commerciaux depuis Google Sheets : {commercialsError}
        </div>
      )}

      {configError && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          margin: '20px 0',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ Impossible de charger la configuration (TVA, frais de dossier, carte SIM, services) depuis Google Sheets : {configError}. Les montants affichés utilisent les valeurs par défaut du code, pas forcément à jour.
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
        {alarmCatalogError && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            margin: '20px 0',
            borderRadius: '8px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ Impossible de charger les produits Alarme (Titane/Jablotron) depuis Google Sheets : {alarmCatalogError}. Réessayez ou contactez le support avant de continuer ce devis.
          </div>
        )}
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
              <label htmlFor="clientPhone-alarm">N° de natel</label>
              <input
                type="tel"
                id="clientPhone-alarm"
                placeholder="079 123 45 67"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="clientEmail-alarm">Email</label>
              <input
                type="email"
                id="clientEmail-alarm"
                placeholder="client@exemple.ch"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="clientAddress-alarm">Adresse</label>
              <input
                type="text"
                id="clientAddress-alarm"
                placeholder="Rue, NPA, Ville"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="propertyType">Type de bien</label>
              <select 
                id="propertyType"
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
            <div className="form-group">
              <label htmlFor="commercial">Commercial</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <select 
                  id="commercial" 
                  value={showCustomCommercial ? 'autre' : commercial}
                  onChange={(e) => handleCommercialSelection(e.target.value)}
                >
                  <option value="">Sélectionner un commercial</option>
                  {commercialsList.map(name => (
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
            <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 400, color: '#9a9a9a' }}>
                Kit offert
                <label className="toggle-switch" title="Le kit est-il offert au client ?">
                  <input
                    type="checkbox"
                    checked={kitOffert}
                    onChange={() => {
                      const value = !kitOffert;
                      setKitOffert(value);
                      // Also flip every kit line already on screen, not just future applyKit calls.
                      setAlarmMaterialLines(lines => lines.map(l => ({ ...l, offered: value })));
                    }}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </span>
            <button 
              className="add-product-btn" 
              onClick={() => {
                // Add a blank product line
                setAlarmMaterialLines([...alarmMaterialLines, {
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
            </span>
          </h3>
          
          {/* Kit de base — cartes en ligne, toujours visibles (ne disparaissent
              pas une fois un kit choisi, pour qu'on puisse voir/changer le
              choix sans que la liste de matériel ne les remplace). */}
          <div style={{ marginBottom: 15 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                {(['titane', 'jablotron'] as const).map((central) => {
                  const centralProduct = central === 'titane' ? titaneCentralProduct : jablotronCentralProduct;
                  // Once a central is actually applied, reflect that; before
                  // anything's chosen, reflect only what's being previewed.
                  // Bug fix: previously "(selectedCentral || preCentral)" made
                  // a fresh click get drowned out by the still-applied
                  // central until a new kit was actually chosen (the yellow
                  // border didn't follow the click). preCentral alone is
                  // always accurate -- applyKit() also calls setPreCentral.
                  const active = preCentral === central;
                  return (
                    <div
                      key={central}
                      onClick={() => setPreCentral(central)}
                      style={{
                        textAlign: 'center',
                        padding: '12px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: 14,
                        border: `1px solid ${active ? '#fffd01' : '#333333'}`,
                        background: active ? 'rgba(255,253,1,0.08)' : '#151515',
                        color: active ? '#fff' : '#9a9a9a',
                      }}
                    >
                      {centralProduct ? centralProduct.name : (central === 'titane' ? 'Titane' : 'Jablotron')}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['kit1', 'kit2'] as const).map((kitType, i) => {
                  const kitKey = `KIT-${preCentral === 'jablotron' ? 'JAB' : 'TIT'}-${i + 1}`;
                  // Only shows as selected when the previewed central is the
                  // one actually applied AND this is the kit number applied.
                  const active = selectedCentral === preCentral && selectedKitNumber === i + 1;
                  return (
                    <div
                      key={kitType}
                      onClick={() => applyKit(preCentral, kitType)}
                      style={{
                        borderRadius: 10,
                        padding: 12,
                        cursor: 'pointer',
                        border: `1px solid ${active ? '#fffd01' : '#333333'}`,
                        background: active ? 'rgba(255,253,1,0.08)' : '#151515',
                      }}
                    >
                      <div style={{ fontWeight: 500, fontSize: 13, color: '#fff', marginBottom: 4 }}>Kit {i + 1}</div>
                      {kitSummaryLines(kitKey).map((line, j) => (
                        <div key={j} style={{ fontSize: 12, color: '#9a9a9a', lineHeight: 1.6 }}>{line}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => applyKit(preCentral, 'none')}
                style={{
                  marginTop: 8,
                  background: 'transparent',
                  border: 'none',
                  color: '#6a6a6a',
                  fontSize: 12,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Partir de la centrale seule, sans kit prédéfini
              </button>
            </div>
          {/* Les lignes de détail du kit restent masquées une fois une carte
              choisie — client feedback : le matériel supplémentaire au-delà
              du kit se gère dans la section "Matériel divers" séparée, pas
              ici. Ne s'affiche que pour la centrale seule (sans kit). */}
          {selectedKitNumber === null && (
          <>
          <div id="alarm-material-products">
            {alarmMaterialLines.map((line, index) => (
              <div key={line.id}>
                <div className="product-line">
                  <select 
                    className="product-select"
                    value={line.product?.isCustom ? '__create_custom__' : ((line.product as any)?.ref || line.product?.name || '')}
                    onChange={(e) => {
                      const productKey = e.target.value;
                      
                      // Custom product creation sentinel
                      if (productKey === '__create_custom__') {
                        const template = alarmCatalog.find(p => p.id === 99); // Autre
                        const newLines = [...alarmMaterialLines];
                        newLines[index] = { 
                          ...line, 
                          product: template || ({ id: 99, name: 'Autre', isCustom: true } as any), 
                          offered: false, 
                          customName: '', 
                          customPrice: 0 
                        };
                        setAlarmMaterialLines(newLines);
                        return;
                      }
                      
                      // Try to find in alarm catalog first (by ref)
                      let product = alarmCatalog.find(p => ((p as any).ref || p.name) === productKey);
                      
                      // Then try XTO catalog (untouched, own migration pass later)
                      if (!product) {
                        const xtoProduct = CATALOG_XTO_PRODUCTS.find(p => p.name === productKey);
                        if (xtoProduct) {
                          product = {
                            id: xtoProduct.id,
                            name: xtoProduct.name,
                            price: xtoProduct.monthlyPrice,
                            isXTO: true
                          } as any;
                        }
                      }
                      
                      const newLines = [...alarmMaterialLines];
                      newLines[index] = { ...line, product: product || null };
                      setAlarmMaterialLines(newLines);
                    }}
                  >
                    <option value="">Sélectionner un produit</option>
                    <option value="__create_custom__">➕ Créer un produit (nom & prix libres)</option>
                    {alarmCatalog
                      .filter(product => {
                        const ref = (product as any).ref as string | undefined;
                        // Hide "Autre" from regular list
                        if (product.isCustom) return false;
                        // Application is an auto-added base-kit item: show it only on
                        // the line that already holds it, never as a manual option
                        // (avoids duplicate 0 CHF rows).
                        if (ref === 'TIT-APP' || ref === 'JAB-APP') return (line.product as any)?.ref === ref;
                        // If a central is selected, filter to that central's refs only
                        if (selectedCentral === 'titane') return ref?.startsWith('TIT-') ?? true;
                        if (selectedCentral === 'jablotron') return ref?.startsWith('JAB-') ?? true;
                        return true;
                      })
                      .map(product => (
                        <option key={(product as any).ref || product.name} value={(product as any).ref || product.name}>
                          {product.name}
                        </option>
                      ))}
                    {/* Add XTO products only if at least one XTO product is in the lines */}
                    {alarmMaterialLines.some(l => l.product && (l.product as any).isXTO) && CATALOG_XTO_PRODUCTS.map(product => (
                      <option key={`xto-${product.name}`} value={product.name}>
                        {product.name} - {product.monthlyPrice.toFixed(2)} CHF/mois
                      </option>
                    ))}
                    {/* XTO kit lines carry richer names than the supplementary XTO
                        catalog (e.g. "Caméras à détection infrarouge"); render the
                        held name so the select does not display blank. */}
                    {line.product && (line.product as any).isXTO &&
                      !CATALOG_XTO_PRODUCTS.some(p => p.name === line.product!.name) && (
                      <option value={line.product.name}>
                        {line.product.name}
                        {(line.product.price || 0) > 0 ? ` - ${(line.product.price || 0).toFixed(2)} CHF/mois` : ''}
                      </option>
                    )}
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
                    onFocus={(e) => e.target.select()}
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
                    {line.offered ? 'OFFERT' : line.product ? `${((line.customPrice || line.product.price || 0) * line.quantity).toFixed(2)} CHF` : '0.00 CHF'}
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
                      onFocus={(e) => e.target.select()}
                      min="0"
                      step="0.01"
                      style={{ flex: 1, padding: '8px', border: '2px solid #007bff', borderRadius: '6px', fontSize: '13px', background: '#f0f8ff' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Add Product Button - Visible when kit is selected */}
          {alarmMaterialLines.length > 0 && (
            <button 
              onClick={() => {
                setAlarmMaterialLines([...alarmMaterialLines, {
                  id: Date.now(),
                  product: null,
                  quantity: 1,
                  offered: false
                }]);
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: '2px dashed #333333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: '#9a9a9a',
                marginTop: '10px',
                marginBottom: '15px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#fffd01';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#333333';
                e.currentTarget.style.color = '#9a9a9a';
              }}
            >
              <span style={{ fontSize: '16px' }}>+</span>
              <span>Ajouter un produit supplémentaire</span>
            </button>
          )}
          </>
          )}
          
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
              onFocus={(e) => e.target.select()}
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

        {/* Installation - 300 CHF editable (client feedback) */}
        <div className="quote-section">
          <h3>🔧 Installation</h3>
          <div className="product-line" style={{ background: '#0a0a0a' }}>
            <div>Installation et paramétrage</div>
            <input 
              type="number" 
              value={1}
              className="quantity-input"
              readOnly
            />
            <input 
              type="number" 
              value={alarmInstallationPrice}
              onChange={(e) => setAlarmInstallationPrice(parseFloat(e.target.value) || 300)}
              onFocus={(e) => e.target.select()}
              className="discount-input"
              placeholder="300"
              min="0"
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
        </div>

        {/* Material Divers Section */}
        <div className="quote-section">
          <h3>
            🔧 Matériel divers
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
          
          {/* Material lines */}
          <div id="alarm-installation-products">
            {alarmInstallationLines.map((line, index) => (
              <div key={line.id}>
                <div className="product-line">
                  <select 
                    className="product-select"
                    value={line.product?.isCustom ? '__create_custom__' : ((line.product as any)?.ref || line.product?.name || '')}
                    onChange={(e) => {
                      const productKey = e.target.value;
                      
                      // Custom product creation sentinel
                      if (productKey === '__create_custom__') {
                        const template = alarmCatalog.find(p => p.id === 99); // Autre
                        const newLines = [...alarmInstallationLines];
                        newLines[index] = { 
                          ...line, 
                          product: template || ({ id: 99, name: 'Autre', isCustom: true } as any), 
                          offered: false, 
                          customName: '', 
                          customPrice: 0 
                        };
                        setAlarmInstallationLines(newLines);
                        return;
                      }
                      
                      const product = alarmCatalog.find(p => ((p as any).ref || p.name) === productKey);
                      const newLines = [...alarmInstallationLines];
                      newLines[index] = { ...line, product: product || null };
                      setAlarmInstallationLines(newLines);
                    }}
                  >
                    <option value="">Sélectionner un produit</option>
                    <option value="__create_custom__">➕ Créer un produit (nom & prix libres)</option>
                    {alarmCatalog
                      .filter(product => {
                        const ref = (product as any).ref as string | undefined;
                        if (product.isCustom) return false;
                        if (ref === 'TIT-APP' || ref === 'JAB-APP') return false; // Auto-kit item, not a manual option here
                        if (selectedCentral === 'titane') return ref?.startsWith('TIT-') ?? true;
                        if (selectedCentral === 'jablotron') return ref?.startsWith('JAB-') ?? true;
                        return true;
                      })
                      .map(product => (
                        <option key={(product as any).ref || product.name} value={(product as any).ref || product.name}>
                          {product.name}
                        </option>
                      ))}
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
                    onFocus={(e) => e.target.select()}
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
                    {line.offered ? 'OFFERT' : line.product ? `${((line.customPrice ?? line.product.price ?? 0) * line.quantity).toFixed(2)} CHF` : '0.00 CHF'}
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
                {line.product?.isCustom && (
                  <div className="custom-product-fields" style={{ display: 'flex', gap: '10px', marginTop: '8px', paddingLeft: '10px', borderLeft: '3px solid #007bff' }}>
                    <input 
                      type="text"
                      placeholder="Nom du produit personnalisé"
                      value={line.customName || ''}
                      onChange={(e) => {
                        const newLines = [...alarmInstallationLines];
                        newLines[index] = { ...line, customName: e.target.value };
                        setAlarmInstallationLines(newLines);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '2px solid #007bff',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <input 
                      type="number"
                      placeholder="Prix (CHF)"
                      value={line.customPrice || ''}
                      onChange={(e) => {
                        const newLines = [...alarmInstallationLines];
                        newLines[index] = { ...line, customPrice: parseFloat(e.target.value) || 0 };
                        setAlarmInstallationLines(newLines);
                      }}
                      onFocus={(e) => e.target.select()}
                      min="0"
                      step="0.01"
                      style={{
                        width: '150px',
                        padding: '8px 12px',
                        border: '2px solid #007bff',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                )}
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
              onFocus={(e) => e.target.select()}
              placeholder="0" 
              min="0" 
              className="discount-input" 
            />
          </div>
          
        </div>

        {/* Admin Fees */}
        <div className="quote-section">
          <h3>📄 Frais de dossier</h3>
          <div className="product-line">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={simcardSelected}
                onChange={(e) => {
                  setSimcardSelected(e.target.checked);
                  if (!e.target.checked) setSimcardOffered(false); // Reset offered if deselected
                }}
                className="include-checkbox"
                title="Sélectionner la carte SIM"
              />
              <span>Carte SIM + Activation</span>
            </div>
            <div className="checkbox-option" style={{ margin: 0, gridColumn: 3 }}>
              <input 
                type="checkbox" 
                checked={simcardOffered}
                onChange={(e) => setSimcardOffered(e.target.checked)}
                disabled={!simcardSelected}
                className="offered-checkbox" 
              />
              <label style={{ margin: 0, fontSize: '12px', color: !simcardSelected ? '#999' : 'inherit' }}>OFFERT</label>
            </div>
            <div className="price-display" style={{ gridColumn: 4 }}>
              {!simcardSelected ? '-' : simcardOffered ? 'OFFERT' : '50.00 CHF HT'}
            </div>
          </div>
          <div className="product-line">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={processingSelected}
                onChange={(e) => {
                  setProcessingSelected(e.target.checked);
                  if (!e.target.checked) setProcessingOffered(false);
                }}
                className="include-checkbox"
                title="Inclure les frais de dossier"
              />
              <span>Frais de dossier</span>
            </div>
            <div className="checkbox-option" style={{ margin: 0, gridColumn: 3 }}>
              <input
                type="checkbox"
                checked={processingOffered}
                onChange={(e) => setProcessingOffered(e.target.checked)}
                disabled={!processingSelected}
                className="offered-checkbox"
              />
              <label style={{ margin: 0, fontSize: '12px', color: !processingSelected ? '#999' : 'inherit' }}>OFFERT</label>
            </div>
            <div className="price-display" style={{ gridColumn: 4 }}>
              {!processingSelected ? '-' : processingOffered ? 'OFFERT' : '190.00 CHF HT'}
            </div>
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
          simCardSelected={simcardSelected}
          configValues={configValues}
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

        {/* Durée d'engagement — pilote aussi le mode de paiement (client
            feedback : un seul choix, plus de sélecteur séparé). Le prix
            comptant reste toujours visible dans le récapitulatif, quelle
            que soit la durée choisie ici. */}
        {!alarmRentalMode && (
          <PaymentSelector
            selectedMonths={engagementMonths}
            onSelect={(months) => {
              setEngagementMonths(months);
              setAlarmPaymentMonths(months);
            }}
            label="Durée d'engagement"
            excludeComptant
          />
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
            <span>{roundToFiveCents(roundToFiveCents((alarmTotals?.material?.total || 0) + ((alarmTotals?.installation?.total || 0) - (alarmTotals?.installationFeeOnly || 0))) * (1 + TVA_RATE)).toFixed(2)} CHF TTC</span>
          </div>
          <div className="summary-item">
            <span>Installation</span>
            <span>{roundToFiveCents(roundToFiveCents(alarmTotals?.installationFeeOnly || 0) * (1 + TVA_RATE)).toFixed(2)} CHF TTC</span>
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
            <div className="monthly-payment">
              <strong style={{ fontSize: '16px' }}>
                💳 Mensualités: {(alarmTotals.monthly.totalTTC || 0).toFixed(2)} CHF/mois pendant {alarmPaymentMonths} mois
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
        {cameraCatalogError && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            margin: '20px 0',
            borderRadius: '8px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ Impossible de charger les produits Caméras depuis Google Sheets : {cameraCatalogError}. Réessayez ou contactez le support avant de continuer ce devis.
          </div>
        )}
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
                  {commercialsList.map(name => (
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
                    value={line.product?.isCustom ? '__create_custom__' : ((line.product as any)?.ref || line.product?.name || '')}
                    onChange={(e) => {
                      const productKey = e.target.value;
                      
                      // Custom product creation sentinel
                      if (productKey === '__create_custom__') {
                        const template = cameraCatalog.find(p => p.id === 99); // Autre
                        const newLines = [...cameraMaterialLines];
                        newLines[index] = { 
                          ...line, 
                          product: template || ({ id: 99, name: 'Autre', isCustom: true } as any), 
                          offered: false, 
                          customName: '', 
                          customPrice: 0 
                        };
                        setCameraMaterialLines(newLines);
                        return;
                      }
                      
                      const product = cameraCatalog.find(p => ((p as any).ref || p.name) === productKey);
                      const newLines = [...cameraMaterialLines];
                      newLines[index] = { ...line, product: product || null };
                      setCameraMaterialLines(newLines);
                    }}
                  >
                    <option value="">Sélectionner un produit</option>
                    <option value="__create_custom__">➕ Créer un produit (nom & prix libres)</option>
                    {cameraCatalog
                      .filter(product => !product.isCustom) // Hide "Autre" from regular list
                      .map(product => (
                        <option key={(product as any).ref || product.name} value={(product as any).ref || product.name}>
                          {product.name}
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
                    onFocus={(e) => e.target.select()}
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
                      onFocus={(e) => e.target.select()}
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
              onFocus={(e) => e.target.select()}
              placeholder="0" 
              min="0" 
              className="discount-input" 
            />
          </div>
        </div>

        {/* Installation — now sourced from Produits_Cameras (INS-1/INS-DEMI-J/
            INS-J/INS-4G) instead of reaching into the Alarm catalog's ids
            101/102. INS-4G only shown when Mini Solar (CAM-MINI-SOLAR) is
            in the material lines, per the Sheet's note on that row. */}
        <div className="quote-section">
          <h3>
            🔧 Installation
            <button 
              className="add-product-btn" 
              onClick={() => {
                const defaultProduct = cameraInstallationProducts.find(p => p.ref === 'INS-DEMI-J') || cameraInstallationProducts[0];
                if (defaultProduct) {
                  setCameraInstallationLines([...cameraInstallationLines, {
                    id: Date.now(),
                    product: defaultProduct,
                    quantity: 1,
                    offered: false
                  }]);
                }
              }}
              title="Ajouter une ligne d'installation"
            >
              +
            </button>
          </h3>
          <div id="camera-installation-lines">
            {(() => {
              const hasMiniSolar = cameraMaterialLines.some(l => l.product && (l.product as any).ref === 'CAM-MINI-SOLAR');
              const cameraQty = cameraMaterialLines
                .filter(l => l.product && (l.product as any).type === 'Caméra')
                .reduce((sum, l) => sum + l.quantity, 0);
              const availableInstallProducts = cameraInstallationProducts.filter(p => {
                if (p.ref === 'INS-4G') return hasMiniSolar;
                if (p.ref === 'INS-1') return cameraQty === 1;
                return true;
              });
              return cameraInstallationLines.map((line, index) => (
              <div key={line.id} className="product-line">
                <select 
                  className="product-select"
                  value={(line.product as any)?.ref || ''}
                  onChange={(e) => {
                    const ref = e.target.value;
                    const product = cameraInstallationProducts.find(p => p.ref === ref);
                    const newLines = [...cameraInstallationLines];
                    newLines[index] = { ...line, product: product || null };
                    setCameraInstallationLines(newLines);
                  }}
                >
                  <option value="">Sélectionner un type d&apos;installation</option>
                  {availableInstallProducts
                    .map(p => (
                      <option key={p.ref} value={p.ref}>{p.name}</option>
                    ))}
                </select>
                <input 
                  type="number" 
                  className="quantity-input"
                  value={line.quantity}
                  onChange={(e) => {
                    const newLines = [...cameraInstallationLines];
                    newLines[index] = { ...line, quantity: parseInt(e.target.value) || 1 };
                    setCameraInstallationLines(newLines);
                  }}
                  onFocus={(e) => e.target.select()}
                  min="1"
                  max="10"
                />
                <div className="checkbox-option" style={{ margin: 0 }}>
                  <input 
                    type="checkbox"
                    checked={line.offered}
                    onChange={(e) => {
                      const newLines = [...cameraInstallationLines];
                      newLines[index] = { ...line, offered: e.target.checked };
                      setCameraInstallationLines(newLines);
                    }}
                  />
                  <label style={{ margin: 0, fontSize: '12px' }}>OFFERT</label>
                </div>
                <div className="price-display">
                  {line.offered ? 'OFFERT' : line.product ? `${((line.product.price || 0) * line.quantity).toFixed(2)} CHF` : '0.00 CHF'}
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => setCameraInstallationLines(cameraInstallationLines.filter((_, i) => i !== index))}
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
              ));
            })()}
          </div>
          {cameraInstallationLines.length === 0 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              {(() => {
                const hasMiniSolar = cameraMaterialLines.some(l => l.product && (l.product as any).ref === 'CAM-MINI-SOLAR');
                const cameraQty = cameraMaterialLines
                  .filter(l => l.product && (l.product as any).type === 'Caméra')
                  .reduce((sum, l) => sum + l.quantity, 0);
                return cameraInstallationProducts
                  .filter(p => {
                    if (p.ref === 'INS-4G') return hasMiniSolar;
                    if (p.ref === 'INS-1') return cameraQty === 1;
                    return true;
                  })
                  .map((product, i) => (
                <button 
                  key={product.ref}
                  onClick={() => {
                    setCameraInstallationLines([{ id: Date.now(), product, quantity: 1, offered: false }]);
                  }}
                  style={{ flex: 1, minWidth: '140px', padding: '12px', background: 'white', border: `2px dashed ${['#28a745', '#007bff', '#f4b400', '#6c757d'][i % 4]}`, borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: ['#28a745', '#007bff', '#f4b400', '#6c757d'][i % 4] }}
                >
                  + {product.name} ({product.price.toFixed(0)} CHF)
                </button>
                ));
              })()}
            </div>
          )}
          
          {/* Discount section */}
          <div className="discount-section" style={{ marginTop: '15px' }}>
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
              onFocus={(e) => e.target.select()}
              placeholder="0" 
              min="0" 
              className="discount-input" 
            />
          </div>

          {/* Paiement comptant - inside same frame (client feedback) */}
          {!cameraRentalMode && cameraPaymentMonths > 0 && !cameraInstallationOffered && (
            <div style={{ marginTop: '15px', padding: '12px', background: '#fffef0', border: '1px solid #f4e600', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={cameraInstallationPayCash}
                  onChange={(e) => setCameraInstallationPayCash(e.target.checked)}
                  style={{ marginRight: '10px', width: '16px', height: '16px' }}
                />
                <span style={{ fontWeight: 500, fontSize: '14px' }}>
                  Paiement comptant de l&apos;installation
                </span>
              </label>
              {cameraInstallationPayCash && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                  Installation à régler comptant: {roundToFiveCents(roundToFiveCents(cameraInstallationTotalFromLines) * (1 + TVA_RATE)).toFixed(2)} CHF TTC
                </div>
              )}
            </div>
          )}
        </div>


        {/* Vision à distance (only in sale mode) */}
        {!cameraRentalMode && (
          <div className="quote-section">
            <h3>📡 Vision à distance</h3>
            <div className="product-line">
              <div>Vision à distance</div>
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
          </div>
        )}

        {/* Engagement Duration */}
        {!cameraRentalMode && (
          <div className="quote-section">
            <h3>⏱️ Durée d'engagement</h3>
            <select
              value={cameraPaymentMonths || 48}
              onChange={(e) => setCameraPaymentMonths(parseInt(e.target.value))}
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
        )}

        {/* Payment Mode */}
        {!cameraRentalMode && (
          <PaymentSelector
            selectedMonths={cameraPaymentMonths}
            onSelect={setCameraPaymentMonths}
            label="Mode de paiement"
            excludeComptant={true}
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
          {cameraVisionDistance && !cameraRentalMode && (
            <div className="summary-item">
              <span>Vision à distance</span>
              <span>{calculateRemoteAccessPrice(cameraMaterialLines, configValues['CAM-VIS-DIS'] ?? 20).toFixed(2)} CHF/mois</span>
                  </div>
          )}
          {cameraMaintenance && !cameraRentalMode && cameraMaintenancePrice > 0 && (
            <div className="summary-item">
              <span>Contrat de maintenance</span>
              <span>{cameraMaintenancePrice.toFixed(2)} CHF/mois</span>
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
        {fogCatalogError && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            margin: '20px 0',
            borderRadius: '8px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ Impossible de charger les produits Générateur de brouillard depuis Google Sheets : {fogCatalogError}. Réessayez ou contactez le support avant de continuer ce devis.
          </div>
        )}
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
            commercialsList={commercialsList}
          />
        </div>

        {/* Matériel (like alarm section) */}
        <div className="quote-section">
          <h3>
            Matériel
            <button 
              className="add-product-btn" 
              onClick={() => {
                setFogLines([...fogLines, {
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
          <div id="fog-material-products">
            {fogLines.map((line, index) => (
              <div key={line.id}>
                <div className="product-line">
                  <select 
                    className="product-select"
                    value={line.product?.isCustom ? '__create_custom__' : ((line.product as any)?.ref || line.product?.name || '')}
                    onChange={(e) => {
                      const productKey = e.target.value;
                      
                      // Custom product creation sentinel
                      if (productKey === '__create_custom__') {
                        const template = fogCatalog.find(p => p.id === 99); // Autre
                        const newLines = [...fogLines];
                        newLines[index] = { 
                          ...line, 
                          product: template || ({ id: 99, name: 'Autre', isCustom: true } as any), 
                          offered: false, 
                          customName: '', 
                          customPrice: 0 
                        };
                        setFogLines(newLines);
                        return;
                      }
                      
                      const product = fogCatalog.find(p => (p.ref || p.name) === productKey);
                      const newLines = [...fogLines];
                      newLines[index] = { ...line, product: product || null };
                      setFogLines(newLines);
                    }}
                  >
                    <option value="">Sélectionner un produit</option>
                    <option value="__create_custom__">➕ Créer un produit (nom & prix libres)</option>
                    {fogCatalog
                      .filter(product => !product.isCustom) // Hide "Autre" from regular list
                      .map(product => (
                        <option key={product.ref || product.name} value={product.ref || product.name}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                <input 
                  type="number" 
                  className="quantity-input"
                  value={line.quantity}
                  onChange={(e) => {
                    const newLines = [...fogLines];
                    newLines[index] = { ...line, quantity: parseInt(e.target.value) || 1 };
                    setFogLines(newLines);
                  }}
                  onFocus={(e) => e.target.select()}
                  min="1"
                />
                <div className="checkbox-option" style={{ margin: 0 }}>
                  <input 
                    type="checkbox" 
                    className="offered-checkbox"
                    checked={line.offered}
                    onChange={(e) => {
                      const newLines = [...fogLines];
                      newLines[index] = { ...line, offered: e.target.checked };
                      setFogLines(newLines);
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
                    setFogLines(fogLines.filter((_, i) => i !== index));
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
                      const newLines = [...fogLines];
                      newLines[index] = { ...line, customName: e.target.value };
                      setFogLines(newLines);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '2px solid #007bff',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                  <input 
                    type="number"
                    placeholder="Prix (CHF)"
                    value={line.customPrice || ''}
                    onChange={(e) => {
                      const newLines = [...fogLines];
                      newLines[index] = { ...line, customPrice: parseFloat(e.target.value) || 0 };
                      setFogLines(newLines);
                    }}
                    onFocus={(e) => e.target.select()}
                    min="0"
                    step="0.01"
                    style={{
                      width: '150px',
                      padding: '8px 12px',
                      border: '2px solid #007bff',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}
            </div>
            ))}
          </div>
        </div>

        {/* Installation */}
        <div className="quote-section">
          <h3>🔧 Installation</h3>
          <div className="product-line">
            <div>Installation et paramétrage</div>
            <input 
              type="number" 
              value={1}
              className="quantity-input"
              readOnly
            />
            <input 
              type="number" 
              value={fogInstallationPrice}
              onChange={(e) => setFogInstallationPrice(parseFloat(e.target.value) || 490)}
              className="price-input"
              onFocus={(e) => e.target.select()}
              style={{
                padding: '8px 12px',
                border: '2px solid #007bff',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                width: '120px'
              }}
            />
            <div></div>
            <div className="price-display">
              {fogInstallationPrice.toFixed(2)} CHF
            </div>
          </div>
        </div>

        {/* Additional Materials */}
        <div className="quote-section">
          <h3>
            Matériel supplémentaire
            <button 
              className="add-product-btn" 
              onClick={() => {
                setFogAdditionalLines([...fogAdditionalLines, {
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
          <div id="fog-additional-products">
            {fogAdditionalLines.map((line, index) => (
              <div key={line.id}>
                <div className="product-line">
                  <select 
                    className="product-select"
                    value={line.product?.isCustom ? '__create_custom__' : ((line.product as any)?.ref || line.product?.name || '')}
                    onChange={(e) => {
                      const productKey = e.target.value;
                      
                      // Custom product creation sentinel
                      if (productKey === '__create_custom__') {
                        const template = fogCatalog.find(p => p.id === 99); // Autre
                        const newLines = [...fogAdditionalLines];
                        newLines[index] = { 
                          ...line, 
                          product: template || ({ id: 99, name: 'Autre', isCustom: true } as any), 
                          offered: false, 
                          customName: '', 
                          customPrice: 0 
                        };
                        setFogAdditionalLines(newLines);
                        return;
                      }
                      
                      const product = fogCatalog.find(p => (p.ref || p.name) === productKey && p.ref !== 'GEN-BRO');
                      const newLines = [...fogAdditionalLines];
                      newLines[index] = { ...line, product: product || null };
                      setFogAdditionalLines(newLines);
                    }}
                  >
                    <option value="">Sélectionner un produit</option>
                    <option value="__create_custom__">➕ Créer un produit (nom & prix libres)</option>
                    {fogCatalog
                      .filter(p => p.ref !== 'GEN-BRO' && !p.isCustom) // Exclude main fog generator and "Autre"
                      .map(product => (
                        <option key={product.ref || product.name} value={product.ref || product.name}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                  <input 
                    type="number" 
                    className="quantity-input"
                    value={line.quantity}
                    onChange={(e) => {
                      const newLines = [...fogAdditionalLines];
                      newLines[index] = { ...line, quantity: parseInt(e.target.value) || 1 };
                      setFogAdditionalLines(newLines);
                    }}
                    onFocus={(e) => e.target.select()}
                    min="1"
                  />
                  <div className="checkbox-option" style={{ margin: 0 }}>
                    <input 
                      type="checkbox" 
                      className="offered-checkbox"
                      checked={line.offered}
                      onChange={(e) => {
                        const newLines = [...fogAdditionalLines];
                        newLines[index] = { ...line, offered: e.target.checked };
                        setFogAdditionalLines(newLines);
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
                      setFogAdditionalLines(fogAdditionalLines.filter((_, i) => i !== index));
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
                        const newLines = [...fogAdditionalLines];
                        newLines[index] = { ...line, customName: e.target.value };
                        setFogAdditionalLines(newLines);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '2px solid #007bff',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <input 
                      type="number"
                      placeholder="Prix (CHF)"
                      value={line.customPrice || ''}
                      onChange={(e) => {
                        const newLines = [...fogAdditionalLines];
                        newLines[index] = { ...line, customPrice: parseFloat(e.target.value) || 0 };
                        setFogAdditionalLines(newLines);
                      }}
                      onFocus={(e) => e.target.select()}
                      min="0"
                      step="0.01"
                      style={{
                        width: '150px',
                        padding: '8px 12px',
                        border: '2px solid #007bff',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Frais de dossier */}
        <div className="quote-section">
          <h3>📄 Frais de dossier</h3>
          <div className="product-line">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={fogProcessingSelected}
                onChange={(e) => {
                  setFogProcessingSelected(e.target.checked);
                  if (!e.target.checked) setFogProcessingOffered(false);
                }}
                className="include-checkbox"
                title="Inclure les frais de dossier"
              />
              <span>Frais de dossier</span>
            </div>
            <input
              type="number"
              value={fogProcessingFee}
              onChange={(e) => setFogProcessingFee(parseFloat(e.target.value) || 190)}
              disabled={!fogProcessingSelected}
              className="discount-input"
              onFocus={(e) => e.target.select()}
              style={{ width: '100px', opacity: fogProcessingSelected ? 1 : 0.5 }}
            />
            <div className="checkbox-option" style={{ margin: 0 }}>
              <input
                type="checkbox"
                checked={fogProcessingOffered}
                onChange={(e) => setFogProcessingOffered(e.target.checked)}
                disabled={!fogProcessingSelected}
                className="offered-checkbox"
              />
              <label style={{ margin: 0, fontSize: '12px', color: !fogProcessingSelected ? '#999' : 'inherit' }}>OFFERT</label>
            </div>
            <div className="price-display">
              {!fogProcessingSelected ? '-' : fogProcessingOffered ? 'OFFERT' : `${fogProcessingFee.toFixed(2)} CHF`}
            </div>
          </div>

          <div className="product-line">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={fogSimCardSelected}
                onChange={(e) => {
                  setFogSimCardSelected(e.target.checked);
                  if (!e.target.checked) setFogSimCardOffered(false);
                }}
                className="include-checkbox"
                title="Sélectionner la carte SIM"
              />
              <span>Carte SIM</span>
            </div>
            <input 
              type="number" 
              value={fogSimCard}
              onChange={(e) => setFogSimCard(parseFloat(e.target.value) || 50)}
              className="discount-input"
              onFocus={(e) => e.target.select()}
              style={{ width: '100px', opacity: fogSimCardSelected ? 1 : 0.5 }}
              disabled={!fogSimCardSelected}
            />
            <div className="checkbox-option" style={{ margin: 0 }}>
              <input 
                type="checkbox" 
                checked={fogSimCardOffered}
                onChange={(e) => setFogSimCardOffered(e.target.checked)}
                disabled={!fogSimCardSelected}
                className="offered-checkbox" 
              />
              <label style={{ margin: 0, fontSize: '12px', color: !fogSimCardSelected ? '#999' : 'inherit' }}>OFFERT</label>
            </div>
            <div className="price-display">
              {!fogSimCardSelected ? '-' : fogSimCardOffered ? 'OFFERT' : `${fogSimCard.toFixed(2)} CHF`}
            </div>
          </div>
        </div>

        {/* Engagement Duration */}
        <div className="quote-section">
          <h3>⏱️ Durée d'engagement</h3>
          <select
            value={fogPaymentMonths || 48}
            onChange={(e) => setFogPaymentMonths(parseInt(e.target.value))}
            style={{ padding: '10px', fontSize: '14px', border: '2px solid #e9ecef', borderRadius: '8px', width: '200px', cursor: 'pointer' }}
          >
            <option value={12}>12 mois</option>
            <option value={24}>24 mois</option>
            <option value={36}>36 mois</option>
            <option value={48}>48 mois</option>
            <option value={60}>60 mois</option>
          </select>
        </div>

        {/* Payment Mode */}
        <PaymentSelector
          selectedMonths={fogPaymentMonths}
          onSelect={setFogPaymentMonths}
          label="Mode de paiement"
          excludeComptant={true}
        />

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
        {visiophoneCatalogError && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            margin: '20px 0',
            borderRadius: '8px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ Impossible de charger les produits Visiophone depuis Google Sheets : {visiophoneCatalogError}. Réessayez ou contactez le support avant de continuer ce devis.
          </div>
        )}
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
            commercialsList={commercialsList}
          />
        </div>

        {/* Matériel (like alarm section) */}
        <div className="quote-section">
          <h3>
            Matériel
            <button 
              className="add-product-btn" 
              onClick={() => {
                setVisiophoLines([...visiophoLines, {
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
          <div id="visiophone-material-products">
            {visiophoLines.map((line, index) => (
              <div key={line.id}>
                <div className="product-line">
                  <select 
                    className="product-select"
                    value={line.product?.isCustom ? '__create_custom__' : (line.product?.name || '')}
                    onChange={(e) => {
                      const productName = e.target.value;
                      
                      // Custom product creation sentinel
                      if (productName === '__create_custom__') {
                        const template = visiophoneCatalog.find(p => p.id === 99); // Autre
                        const newLines = [...visiophoLines];
                        newLines[index] = { 
                          ...line, 
                          product: template || ({ id: 99, name: 'Autre', isCustom: true } as any), 
                          offered: false, 
                          customName: '', 
                          customPrice: 0 
                        };
                        setVisiophoLines(newLines);
                        return;
                      }
                      
                      const product = visiophoneCatalog.find(p => p.name === productName);
                      const newLines = [...visiophoLines];
                      newLines[index] = { ...line, product: product || null };
                      setVisiophoLines(newLines);
                    }}
                  >
                    <option value="">Sélectionner un produit</option>
                    <option value="__create_custom__">➕ Créer un produit (nom & prix libres)</option>
                    {visiophoneCatalog
                      .filter(product => !product.isCustom) // Hide "Autre" from regular list
                      .map(product => (
                        <option key={product.name} value={product.name}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                  <input 
                    type="number" 
                    className="quantity-input"
                    value={line.quantity}
                    onChange={(e) => {
                      const newLines = [...visiophoLines];
                      newLines[index] = { ...line, quantity: parseInt(e.target.value) || 1 };
                      setVisiophoLines(newLines);
                    }}
                    onFocus={(e) => e.target.select()}
                    min="1"
                  />
                  <div className="checkbox-option" style={{ margin: 0 }}>
                    <input 
                      type="checkbox" 
                      className="offered-checkbox"
                      checked={line.offered}
                      onChange={(e) => {
                        const newLines = [...visiophoLines];
                        newLines[index] = { ...line, offered: e.target.checked };
                        setVisiophoLines(newLines);
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
                      setVisiophoLines(visiophoLines.filter((_, i) => i !== index));
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
                        const newLines = [...visiophoLines];
                        newLines[index] = { ...line, customName: e.target.value };
                        setVisiophoLines(newLines);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '2px solid #007bff',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <input 
                      type="number"
                      placeholder="Prix (CHF)"
                      value={line.customPrice || ''}
                      onChange={(e) => {
                        const newLines = [...visiophoLines];
                        newLines[index] = { ...line, customPrice: parseFloat(e.target.value) || 0 };
                        setVisiophoLines(newLines);
                      }}
                      onFocus={(e) => e.target.select()}
                      min="0"
                      step="0.01"
                      style={{
                        width: '150px',
                        padding: '8px 12px',
                        border: '2px solid #007bff',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Installation */}
        <div className="quote-section">
          <h3>🔧 Installation et paramétrage</h3>
          <div className="product-line">
            <div>Installation et paramétrage</div>
            <input 
              type="number" 
              value={1}
              className="quantity-input"
              readOnly
            />
            <input 
              type="number" 
              value={visiophoInstallationPrice}
              onChange={(e) => setVisiophoInstallationPrice(parseFloat(e.target.value) || 690)}
              className="price-input"
              onFocus={(e) => e.target.select()}
              style={{
                padding: '8px 12px',
                border: '2px solid #007bff',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                width: '120px'
              }}
            />
            <div></div>
            <div className="price-display">
              {visiophoInstallationPrice.toFixed(2)} CHF
            </div>
          </div>
        </div>

        {/* Engagement Duration */}
        <div className="quote-section">
          <h3>⏱️ Durée d'engagement</h3>
          <select
            value={visiophoPaymentMonths || 48}
            onChange={(e) => setVisiophoPaymentMonths(parseInt(e.target.value))}
            style={{ padding: '10px', fontSize: '14px', border: '2px solid #e9ecef', borderRadius: '8px', width: '200px', cursor: 'pointer' }}
          >
            <option value={12}>12 mois</option>
            <option value={24}>24 mois</option>
            <option value={36}>36 mois</option>
            <option value={48}>48 mois</option>
            <option value={60}>60 mois</option>
          </select>
        </div>

        {/* Payment Mode */}
        <PaymentSelector
          selectedMonths={visiophoPaymentMonths}
          onSelect={setVisiophoPaymentMonths}
          label="Mode de paiement"
          excludeComptant={true}
        />

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

    </div>
      </div>
    </div>
  );
}

