import { describe, it, expect } from 'vitest';
import {
  calculateFacilityPayment,
  calculateMonthlyFromCashPrice,
  roundToFiveCents,
  CATALOG_ALARM_PRODUCTS,
  CATALOG_CAMERA_MATERIAL,
} from '@/lib/quote-generator';
import { calculateSectionMonthlyPrice } from '@/lib/calculations';
import type { ProductLineData, Product } from '@/components/ProductLine';
import { alarmFixture } from './fixtures';

describe('roundToFiveCents (round UP to 0.05)', () => {
  it('rounds correctly', () => {
    expect(roundToFiveCents(10)).toBe(10);
    expect(roundToFiveCents(10.01)).toBe(10.05);
    expect(roundToFiveCents(10.05)).toBe(10.05);
    expect(roundToFiveCents(10.06)).toBe(10.1);
    expect(roundToFiveCents(0)).toBe(0);
  });
});

describe('calculateFacilityPayment (Milestone formulas, round UP to integer)', () => {
  it('applies the per-duration interest factor on (afterDiscount - processing - sim)', () => {
    expect(calculateFacilityPayment(1000, 0, 0, 60)).toBe(21); // 1000*1.25/60 = 20.83
    expect(calculateFacilityPayment(1000, 0, 0, 48)).toBe(25); // 1000*1.2/48 = 25
    expect(calculateFacilityPayment(1000, 0, 0, 36)).toBe(32); // 1000*1.15/36 = 31.94
    expect(calculateFacilityPayment(1000, 0, 0, 24)).toBe(46); // 1000*1.10/24 = 45.83
    expect(calculateFacilityPayment(1000, 0, 0, 12)).toBe(88); // 1000*1.05/12 = 87.5
  });
  it('subtracts processing + sim before computing (reference case)', () => {
    expect(calculateFacilityPayment(1100, 190, 50, 48)).toBe(22); // base 860 -> 860*1.2/48 = 21.5
  });
  it('returns 0 for unsupported durations', () => {
    expect(calculateFacilityPayment(1000, 0, 0, 0)).toBe(0);
    expect(calculateFacilityPayment(1000, 0, 0, 18)).toBe(0);
  });
});

describe('calculateMonthlyFromCashPrice', () => {
  it('applies the per-duration factor and rounds up', () => {
    expect(calculateMonthlyFromCashPrice(1200, 48)).toBe(30); // 1200*1.2/48
    expect(calculateMonthlyFromCashPrice(1200, 60)).toBe(25); // 1200*1.25/60
    expect(calculateMonthlyFromCashPrice(1200, 12)).toBe(105); // 1200*1.05/12
  });
});

describe('calculateAlarmTotals — central-priced (Titane) supplementary items must count', () => {
  const { totals } = alarmFixture();
  it('counts non-offered Titane divers (choc 290 + fumée 3x190) + main install 300', () => {
    // REGRESSION GUARD: calculateSectionTotal must honor priceTitane, not just product.price.
    expect(totals.installation.totalBeforeDiscount).toBe(1160); // 860 divers + 300 install
    expect(totals.installation.total).toBe(1160);
  });
  it('offered kit contributes 0 to material total', () => {
    expect(totals.material.total).toBe(0);
  });
  it('totalHT = divers+install (1160) + admin (240)', () => {
    expect(totals.adminFees.total).toBe(240);
    expect(totals.totalHT).toBe(1400);
  });
});

describe('calculateSectionMonthlyPrice — now uses the Milestone-1 formula for every category', () => {
  it('Alarme: a 12-month line uses (price * 1.05) / 12, not the old flat monthlyTitane', () => {
    // Same price point as the old "Détecteur de choc" (290) — old stored
    // monthlyTitane was a flat 7 regardless of duration. Formula at 12
    // months: ceil(290*1.05/12) = 26.
    const line: ProductLineData = {
      id: 1,
      product: { id: 11, ref: 'TIT-CHO', name: 'Détecteur de choc', price: 290 } as unknown as Product,
      quantity: 1,
      offered: false,
    };
    const monthly = calculateSectionMonthlyPrice([line], 12, 'titane', CATALOG_ALARM_PRODUCTS, 'alarm-installation');
    expect(monthly).toBe(26);
  });

  it('Alarme: the same line at 48 months uses the 1.2 coefficient, not the same flat value', () => {
    const line: ProductLineData = {
      id: 1,
      product: { id: 11, ref: 'TIT-CHO', name: 'Détecteur de choc', price: 290 } as unknown as Product,
      quantity: 1,
      offered: false,
    };
    const monthly = calculateSectionMonthlyPrice([line], 48, 'titane', CATALOG_ALARM_PRODUCTS, 'alarm-installation');
    expect(monthly).toBe(8); // ceil(290*1.2/48) = 8, vs 26 at 12 months above — duration now actually matters
  });

  it('Caméras: the previously-unhandled 12-month case now applies the formula instead of a plain unmarked-up price/12', () => {
    // Same price point as the old "Bullet Mini" (390). Old code had no
    // `months === 12` branch, so it fell back to price / 12 = 32.5
    // (rounded to 5 cents, not to the franc). Formula: ceil(390*1.05/12) = 35.
    const line: ProductLineData = {
      id: 1,
      product: { id: 23, ref: 'CAM-B-MINI', name: 'Bullet mini', price: 390, type: 'Caméra' } as unknown as Product,
      quantity: 1,
      offered: false,
    };
    const monthly = calculateSectionMonthlyPrice([line], 12, null, CATALOG_CAMERA_MATERIAL, 'camera-material');
    expect(monthly).toBe(35);
  });
});
