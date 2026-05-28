/**
 * Shared test fixtures: build realistic ProductLineData + PDFGenerationOptions
 * for each product type. Used by calculations + pdf-content tests.
 */
import { calculateAlarmTotals, calculateCameraTotals } from '@/lib/calculations';
import {
  CATALOG_ALARM_PRODUCTS,
  CATALOG_CAMERA_MATERIAL,
  CATALOG_FOG_PRODUCTS,
  CATALOG_VISIOPHONE_PRODUCTS,
} from '@/lib/quote-generator';
import type { ProductLineData, Product } from '@/components/ProductLine';
import type { PDFGenerationOptions } from '@/lib/pdf-generator';

let _id = 1;
const nextId = () => _id++;
const find = (cat: Array<{ id: number }>, id: number) => cat.find((x) => x.id === id) as unknown as Product;

export function alarmFixture(opts: { simCardSelected?: boolean } = {}) {
  const simCardSelected = opts.simCardSelected ?? true;
  const material: ProductLineData[] = [
    { id: nextId(), product: find(CATALOG_ALARM_PRODUCTS, 6), quantity: 1, offered: true }, // Centrale Titane 690
    { id: nextId(), product: find(CATALOG_ALARM_PRODUCTS, 8), quantity: 2, offered: true }, // Vol 240
    { id: nextId(), product: find(CATALOG_ALARM_PRODUCTS, 10), quantity: 1, offered: true }, // Ouverture 190
    { id: nextId(), product: find(CATALOG_ALARM_PRODUCTS, 7), quantity: 1, offered: true }, // Clavier 390
    { id: nextId(), product: find(CATALOG_ALARM_PRODUCTS, 110), quantity: 1, offered: true }, // Application
    { id: nextId(), product: find(CATALOG_ALARM_PRODUCTS, 111), quantity: 1, offered: true }, // Alimentation de secours
  ];
  const install: ProductLineData[] = [
    { id: nextId(), product: find(CATALOG_ALARM_PRODUCTS, 11), quantity: 1, offered: false }, // choc Titane 290
    { id: nextId(), product: find(CATALOG_ALARM_PRODUCTS, 13), quantity: 3, offered: false }, // fumée Titane 190
  ];
  const services = {
    testCyclique: { selected: true, price: 0, offered: true },
    surveillance: { type: 'telesurveillance', price: 129, offered: false },
  };
  const totals = calculateAlarmTotals(
    material,
    install,
    undefined,
    undefined,
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
  const material: ProductLineData[] = [
    { id: nextId(), product: find(CATALOG_CAMERA_MATERIAL, 23), quantity: 2, offered: false }, // Bullet Mini 390
    { id: nextId(), product: find(CATALOG_CAMERA_MATERIAL, 50), quantity: 1, offered: false }, // NVR 990
    { id: nextId(), product: find(CATALOG_CAMERA_MATERIAL, 38), quantity: 1, offered: false }, // Modem 290
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
    CATALOG_CAMERA_MATERIAL,
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
    { id: nextId(), product: find(CATALOG_FOG_PRODUCTS, 200), quantity: 1, offered: false }, // Générateur 2990
    { id: nextId(), product: find(CATALOG_FOG_PRODUCTS, 201), quantity: 1, offered: false }, // Clavier 390
  ];
  const additional: ProductLineData[] = [
    { id: nextId(), product: find(CATALOG_FOG_PRODUCTS, 205), quantity: 1, offered: false }, // Support 290
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
    { id: nextId(), product: find(CATALOG_VISIOPHONE_PRODUCTS, 300), quantity: 1, offered: false }, // Interphone 990
    { id: nextId(), product: find(CATALOG_VISIOPHONE_PRODUCTS, 301), quantity: 1, offered: false }, // Écran 490
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
