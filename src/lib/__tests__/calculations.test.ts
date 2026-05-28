import { describe, it, expect } from 'vitest';
import {
  calculateFacilityPayment,
  calculateMonthlyFromCashPrice,
  roundToFiveCents,
} from '@/lib/quote-generator';
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
