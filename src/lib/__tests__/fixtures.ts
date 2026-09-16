/**
 * Shared test fixtures: build realistic ProductLineData + PDFGenerationOptions
 * for each product type. Used by calculations + pdf-content tests.
 */
import { calculateAlarmTotals, calculateCameraTotals, type DiscountConfig } from '@/lib/calculations';
import {
  CATALOG_ALARM_PRODUCTS,
} from '@/lib/quote-generator';
import type { ProductLineData, Product } from '@/components/ProductLine';
import type { PDFGenerationOptions } from '@/lib/pdf-generator';

let _id = 1;
const nextId = () => _id++;

export function alarmFixture(opts: {
  simCardSelected?: boolean;
  /** Adds two non-offered material lines so a material réduction has a base. */
  extraMaterial?: boolean;
  materialDiscount?: DiscountConfig;
  installationDiscount?: DiscountConfig;
  surveillanceType?: string;
  surveillancePrice?: number;
} = {}) {
  const simCardSelected = opts.simCardSelected ?? true;
  const p = (ref: string, name: string, price: number): Product => ({ id: nextId(), ref, name, price } as unknown as Product);
  const material: ProductLineData[] = [
    { id: nextId(), product: p('TIT-CEN', 'Centrale Titane', 690), quantity: 1, offered: true },
    { id: nextId(), product: p('TIT-VOL-RADIO', 'Détecteur volumétrique (radio)', 240), quantity: 2, offered: true },
    { id: nextId(), product: p('TIT-OUV', "Détecteur d'ouverture (radio)", 190), quantity: 1, offered: true },
    { id: nextId(), product: p('TIT-CLA', 'Clavier', 390), quantity: 1, offered: true },
    { id: nextId(), product: p('TIT-APP', 'Application', 0), quantity: 1, offered: true },
  ];
  if (opts.extraMaterial) {
    material.push({ id: nextId(), product: p('TIT-MOU-EXT', 'Détecteur de mouvement extérieur', 690), quantity: 1, offered: false });
    material.push({ id: nextId(), product: p('TIT-FUM', 'Détecteur de fumée', 190), quantity: 2, offered: false });
  }
  const install: ProductLineData[] = [
    { id: nextId(), product: p('TIT-CHO', 'Détecteur de choc', 290), quantity: 1, offered: false },
    { id: nextId(), product: p('TIT-FUM', 'Détecteur de fumée', 190), quantity: 3, offered: false },
  ];
  const services = {
    testCyclique: { selected: true, price: 0, offered: true },
    surveillance: {
      type: opts.surveillanceType ?? 'telesurveillance',
      price: opts.surveillancePrice ?? 129,
      offered: false,
    },
  };
  const totals = calculateAlarmTotals(
    material,
    install,
    opts.materialDiscount,
    opts.installationDiscount,
    { quantity: 0, isOffered: false, price: 300 },
    { simCardSelected, simCardOffered: false, processingOffered: false },
    services,
    48,
    false,
    'titane',
    CATALOG_ALARM_PRODUCTS,
  );
  const options: PDFGenerationOptions = {
    type: 'alarm',
    clientName: 'NOM Prénom',
    commercial: 'Arnaud Bloch',
    isRental: false,
    materialLines: material,
    installationLines: install,
    totals,
    simCardSelected,
    services,
    options: { interventionsGratuites: true, interventionsAnnee: false, serviceCles: true },
    paymentMonths: 48,
  };
  return { material, install, totals, options };
}

export function cameraFixture() {
  const c = (ref: string, name: string, price: number, type: string, is4G = false): Product =>
    ({ id: nextId(), ref, name, price, type, is4G } as unknown as Product);
  const material: ProductLineData[] = [
    { id: nextId(), product: c('CAM-B-MINI', 'Bullet mini', 390, 'Caméra'), quantity: 2, offered: false },
    { id: nextId(), product: c('NVR-14', 'NVR 1 à 4 caméras', 990, 'NVR'), quantity: 1, offered: false },
    { id: nextId(), product: c('MODEM', 'Modem 4G', 290, 'Modem', true), quantity: 1, offered: false },
  ];
  const totals = calculateCameraTotals(
    material,
    undefined,
    { quantity: 2, isOffered: false },
    undefined,
    false,
    true,
    48,
    false,
    [],
  );
  const options: PDFGenerationOptions = {
    type: 'camera',
    clientName: 'NOM Prénom',
    commercial: 'Arnaud Bloch',
    isRental: false,
    materialLines: material,
    totals,
    installationQty: 2,
    remoteAccess: true,
    paymentMonths: 48,
  };
  return { material, totals, options };
}

export function fogFixture() {
  const material: ProductLineData[] = [
    { id: nextId(), product: { id: 200, name: 'Générateur de brouillard', price: 2990, ref: 'GEN-BRO' } as Product, quantity: 1, offered: false },
    { id: nextId(), product: { id: 201, name: 'Clavier de porte', price: 390, ref: 'GEN-CLA' } as Product, quantity: 1, offered: false },
  ];
  const additional: ProductLineData[] = [
    { id: nextId(), product: { id: 205, name: 'Support mural fixe', price: 290, ref: 'GEN-SUP-FIX' } as Product, quantity: 1, offered: false },
  ];
  const options: PDFGenerationOptions = {
    type: 'fog',
    clientName: 'NOM Prénom',
    commercial: 'Arnaud Bloch',
    isRental: false,
    materialLines: material,
    installationLines: additional,
    quoteNumberPrefixOverride: 'GB',
    feesConfig: { installationPrice: 490, processingFee: 190, processingOffered: false, simCard: 50, simCardSelected: true, simCardOffered: false },
  };
  return { material, additional, options };
}

export function visioFixture() {
  const material: ProductLineData[] = [
    { id: nextId(), product: { id: 300, name: 'Interphone', price: 990 } as Product, quantity: 1, offered: false },
    { id: nextId(), product: { id: 301, name: 'Ecran complémentaire', price: 490 } as Product, quantity: 1, offered: false },
  ];
  const options: PDFGenerationOptions = {
    type: 'visiophone',
    clientName: 'NOM Prénom',
    commercial: 'Arnaud Bloch',
    isRental: false,
    materialLines: material,
    quoteNumberPrefixOverride: 'VISIO',
    feesConfig: { installationPrice: 690 },
  };
  return { material, options };
}
