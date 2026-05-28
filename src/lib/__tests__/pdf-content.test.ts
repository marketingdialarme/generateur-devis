import { describe, it, expect, beforeAll } from 'vitest';
import { jsPDF } from 'jspdf';
import { generateQuotePDF } from '@/lib/pdf-generator';
import { alarmFixture, cameraFixture, fogFixture, visioFixture } from './fixtures';

/**
 * jsPDF (uncompressed, standard Helvetica → no embedded font binary) writes every
 * doc.text(str) as a literal `(str)Tj` in the content stream. So decoding the PDF
 * bytes as latin1 lets us assert on rendered text without a PDF parser. Accented
 * chars are octal-escaped, so we assert on ASCII-safe prefixes.
 */
async function renderText(options: Parameters<typeof generateQuotePDF>[0]): Promise<string> {
  const blob = await generateQuotePDF(options, jsPDF);
  return Buffer.from(await blob.arrayBuffer()).toString('latin1');
}

describe('Alarm PDF content (new design)', () => {
  let pdf = '';
  beforeAll(async () => {
    pdf = await renderText(alarmFixture().options);
  });

  it('uses DIA-TELES quote number', () => expect(pdf).toContain('DIA-TELES-'));
  it('lists Application + Alimentation de secours in the kit', () => {
    expect(pdf).toContain('KIT DE BASE - Application');
    expect(pdf).toContain('KIT DE BASE - Alimentation de secours');
  });
  it('shows the partnership-discount summary', () => {
    expect(pdf).toContain('Rabais partenariat');
    expect(pdf).toContain('Total apr'); // "Total après rabais"
  });
  it('includes the main installation line (regression: was dropped when negative)', () => {
    expect(pdf).toContain('Installation et param'); // "Installation et paramétrage"
  });
  it('mensualité uses the surveillance Total HT (129), not the facility figure', () => {
    expect(pdf).toContain('mensualit'); // "La mensualité de CHF 129.- HT..."
    expect(pdf).toContain('129');
  });
  it('shows the facilité-de-paiement block', () => {
    expect(pdf).toContain('Possibilit'); // "Possibilité de facilité de paiement..."
  });
  it('NEVER prints the word OFFERT', () => {
    expect(pdf).not.toContain('OFFERT');
  });
});

describe('Alarm PDF — Carte SIM row only when selected', () => {
  it('omits the Carte SIM line when SIM not selected', async () => {
    const pdf = await renderText(alarmFixture({ simCardSelected: false }).options);
    expect(pdf).not.toContain('Carte SIM');
  });
  it('includes the Carte SIM line when selected', async () => {
    const pdf = await renderText(alarmFixture({ simCardSelected: true }).options);
    expect(pdf).toContain('Carte SIM');
  });
});

describe('Camera PDF content', () => {
  it('uses DIA-VID + vision à distance block, no OFFERT', async () => {
    const pdf = await renderText(cameraFixture().options);
    expect(pdf).toContain('DIA-VID-');
    expect(pdf).toContain('VISION'); // "VISION À DISTANCE"
    expect(pdf).not.toContain('OFFERT');
  });
});

describe('Brouillard PDF content', () => {
  it('uses DIA-GB + lists the fog generator, no OFFERT', async () => {
    const pdf = await renderText(fogFixture().options);
    expect(pdf).toContain('DIA-GB-');
    expect(pdf).toContain('rateur de brouillard'); // "Générateur de brouillard"
    expect(pdf).not.toContain('OFFERT');
  });
});

describe('Visiophone PDF content', () => {
  it('uses DIA-VISIO + lists the interphone, no OFFERT', async () => {
    const pdf = await renderText(visioFixture().options);
    expect(pdf).toContain('DIA-VISIO-');
    expect(pdf).toContain('Interphone');
    expect(pdf).not.toContain('OFFERT');
  });
});
