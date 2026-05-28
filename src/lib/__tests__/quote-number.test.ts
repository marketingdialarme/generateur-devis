import { describe, it, expect } from 'vitest';
import {
  generateQuoteNumber,
  getAlarmQuoteNumberPrefix,
  getCameraQuoteNumberPrefix,
} from '@/lib/pdf-generator';

const D = new Date(2026, 4, 20, 15, 19); // 2026-05-20 15:19 (month is 0-indexed)

describe('generateQuoteNumber', () => {
  it('formats DIA-{PREFIX}-YYYY-MM-DD-HHMM for each product', () => {
    expect(generateQuoteNumber('TELES', D)).toBe('DIA-TELES-2026-05-20-1519');
    expect(generateQuoteNumber('AUTO', D)).toBe('DIA-AUTO-2026-05-20-1519');
    expect(generateQuoteNumber('VID', D)).toBe('DIA-VID-2026-05-20-1519');
    expect(generateQuoteNumber('GB', D)).toBe('DIA-GB-2026-05-20-1519');
    expect(generateQuoteNumber('VISIO', D)).toBe('DIA-VISIO-2026-05-20-1519');
  });

  it('falls back to DIA-YYYY-MM-DD-HHMM with no prefix', () => {
    expect(generateQuoteNumber(null, D)).toBe('DIA-2026-05-20-1519');
    expect(generateQuoteNumber(undefined, D)).toBe('DIA-2026-05-20-1519');
  });

  it('zero-pads month/day/hour/minute', () => {
    const d = new Date(2026, 0, 3, 8, 5); // 2026-01-03 08:05
    expect(generateQuoteNumber('GB', d)).toBe('DIA-GB-2026-01-03-0805');
  });
});

describe('getAlarmQuoteNumberPrefix', () => {
  it('maps surveillance type to TELES / AUTO', () => {
    expect(getAlarmQuoteNumberPrefix('telesurveillance')).toBe('TELES');
    expect(getAlarmQuoteNumberPrefix('telesurveillance-pro')).toBe('TELES');
    expect(getAlarmQuoteNumberPrefix('autosurveillance')).toBe('AUTO');
    expect(getAlarmQuoteNumberPrefix('autosurveillance-pro')).toBe('AUTO');
    expect(getAlarmQuoteNumberPrefix(null)).toBeNull();
    expect(getAlarmQuoteNumberPrefix('')).toBeNull();
  });
});

describe('getCameraQuoteNumberPrefix', () => {
  it('is VID', () => {
    expect(getCameraQuoteNumberPrefix()).toBe('VID');
  });
});
