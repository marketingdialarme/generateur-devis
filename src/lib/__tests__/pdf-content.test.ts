import { describe, it, expect, beforeAll } from 'vitest';
import { jsPDF } from 'jspdf';
import { generateQuotePDF } from '@/lib/pdf-generator';
import { calculateAlarmTotals } from '@/lib/calculations';
import { CATALOG_ALARM_PRODUCTS, XTO_KIT_LINES, calculateFacilityPayment } from '@/lib/quote-generator';
import type { ProductLineData } from '@/components/ProductLine';
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
  it('lists Application in the kit (Alimentation de secours no longer exists for Titane/Jablotron)', () => {
    expect(pdf).toContain('KIT DE BASE - Application');
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
  it('prints OFFERT in the total column for offered rows, while still showing the unit price', () => {
    expect(pdf).toContain('OFFERT');
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

describe('Alarm PDF — percent/fixed réductions reach the summary (Aug 2026 regression)', () => {
  let pdf = '';
  let totals: ReturnType<typeof alarmFixture>['totals'];
  beforeAll(async () => {
    const fx = alarmFixture({
      extraMaterial: true,
      materialDiscount: { type: 'percent', value: 10 },
      installationDiscount: { type: 'fixed', value: 100 },
    });
    totals = fx.totals;
    pdf = await renderText(fx.options);
  });

  it('prints a single merged "Remise" summary line for the combined material + installation discount', () => {
    expect(totals.material.discount).toBeGreaterThan(0);
    expect(totals.installation.discount).toBe(100);
    expect(pdf).toContain('Remise');
    const combined = totals.material.discount + totals.installation.discount;
    expect(pdf).toContain(`- ${combined.toFixed(2)} CHF`);
  });

  it('no longer prints a per-line discount note (superseded by orange row coloring)', () => {
    expect(pdf).not.toContain('duction appliqu');
  });

  it('Total après rabais equals the on-screen net (réductions deducted)', () => {
    const net =
      totals.material.total +
      totals.installation.total +
      totals.adminFees.processing +
      totals.adminFees.simCard;
    expect(pdf).toContain(`${net.toFixed(2)} CHF`);
  });

  it('facilité de paiement is computed on the discounted base', () => {
    const net =
      totals.material.total +
      totals.installation.total +
      totals.adminFees.processing +
      totals.adminFees.simCard;
    const facility = calculateFacilityPayment(
      net,
      totals.adminFees.processing,
      totals.adminFees.simCard,
      48,
    );
    expect(pdf).toContain(`${facility.toFixed(2)} CHF`);
  });
});

describe('Alarm PDF — an offered supplementary-material item counts toward Remise, not Rabais partenariat', () => {
  it('excludes the offered item from Rabais partenariat and adds it to the Remise display, net total unchanged', async () => {
    const fx = alarmFixture({
      offeredSupplementary: true,
      installationDiscount: { type: 'fixed', value: 20 },
    });
    const pdf = await renderText(fx.options);
    const totals = fx.totals;

    // Net total (what's actually billed) must be unaffected by which
    // summary line the offered item's value is displayed under -- it was
    // already excluded from the billed subtotal by being offered.
    const net =
      totals.material.total +
      totals.installation.total +
      totals.adminFees.processing +
      totals.adminFees.simCard;
    expect(pdf).toContain(`${net.toFixed(2)} CHF`);

    // Rabais partenariat shows only the kit de base's offered value (690+480+190+390+0=1750),
    // not the offered Badge x 4 (100 CHF) from matériel supplémentaire.
    expect(pdf).toContain('- 1750.00 CHF');
    expect(pdf).not.toContain('- 1850.00 CHF');

    // Remise shows the installation discount (20) PLUS the offered
    // supplementary item's value (100) = 120, for display purposes only.
    expect(pdf).toContain('Remise');
    expect(pdf).toContain('- 120.00 CHF');
  });
});

describe('Alarm PDF — surveillance block title follows the mode', () => {
  it('titles AUTOSURVEILLANCE on autosurveillance quotes', async () => {
    const pdf = await renderText(
      alarmFixture({ surveillanceType: 'autosurveillance', surveillancePrice: 59 }).options,
    );
    expect(pdf).toContain('DIA-AUTO-');
    expect(pdf).toContain('AUTOSURVEILLANCE + TEST CYCLIQUE');
  });

  it('keeps the télésurveillance title on télésurveillance quotes', async () => {
    const pdf = await renderText(alarmFixture().options);
    expect(pdf).toContain('DIA-TELES-');
    expect(pdf).not.toContain('AUTOSURVEILLANCE + TEST CYCLIQUE');
  });
});

describe('XTO kit lines (client sheet, Alarme tab)', () => {
  it('kit config lists the five promised lines with 4 caméras', () => {
    expect(XTO_KIT_LINES).toHaveLength(5);
    const byName = Object.fromEntries(XTO_KIT_LINES.map((l) => [l.name, l]));
    expect(byName['Centrale XTO'].quantity).toBe(1);
    expect(byName['Caméras à détection infrarouge'].quantity).toBe(4);
    expect(byName['Caméras à détection infrarouge'].monthlyPrice).toBe(100);
    expect(byName['Lecteur de badge + 8 badges'].monthlyPrice).toBe(30);
    expect(byName['Sirène extérieure avec gyrophare'].monthlyPrice).toBe(50);
    expect(byName["Centre d'intervention GS"].monthlyPrice).toBe(0);
  });

  it('renders all five kit lines on the quote PDF', async () => {
    const lines: ProductLineData[] = XTO_KIT_LINES.map((kitLine, i) => ({
      id: i + 1,
      product: {
        id: kitLine.xtoId,
        name: kitLine.name,
        price: kitLine.monthlyPrice,
        isXTO: true,
      } as unknown as ProductLineData['product'],
      quantity: kitLine.quantity,
      offered: false,
    }));
    const totals = calculateAlarmTotals(
      lines,
      [],
      undefined,
      undefined,
      { quantity: 0, isOffered: false },
      { simCardSelected: false, simCardOffered: false, processingOffered: false },
      { testCyclique: { selected: false, price: 0, offered: false }, surveillance: { type: null, price: 0, offered: false } },
      0,
      true,
      null,
      CATALOG_ALARM_PRODUCTS,
    );
    const pdf = await renderText({
      type: 'alarm',
      clientName: 'XTO Client',
      commercial: 'Arnaud Bloch',
      isRental: true,
      materialLines: lines,
      installationLines: [],
      totals,
    });
    expect(pdf).toContain('Centrale XTO');
    expect(pdf).toContain('tection infrarouge'); // "Caméras à détection infrarouge"
    expect(pdf).toContain('Lecteur de badge + 8 badges');
    expect(pdf).toContain("Centre d'intervention GS");
    expect(pdf).toContain('rieure avec gyrophare'); // "Sirène extérieure avec gyrophare"
  });
});

describe('Camera PDF content', () => {
  it('uses DIA-VID + vision à distance block, no OFFERT', async () => {
    const pdf = await renderText(cameraFixture().options);
    expect(pdf).toContain('DIA-VID-');
    expect(pdf).toContain('VISION'); // "VISION À DISTANCE"
    expect(pdf).not.toContain('OFFERT');
  });
  it('now shows the facilité-de-paiement block too (previously missing on Caméras) — short label, Caméras only', async () => {
    const pdf = await renderText(cameraFixture().options);
    expect(pdf).toContain('Facilit'); // "Facilité de paiement sur 48 mois"
    expect(pdf).not.toContain('Possibilit'); // long default label stays off Caméras
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

describe('Alarm PDF — comment block (director feedback)', () => {
  it('shows the Commentaire block with its text when filled in', async () => {
    const pdf = await renderText(alarmFixture({ comment: 'Client très pressé, prévoir un RDV rapide' }).options);
    expect(pdf).toContain('Commentaire');
    expect(pdf).toContain('pressé'); // exact word present, confirms the free text made it through
  });

  it('omits the Commentaire block entirely when left empty', async () => {
    const pdf = await renderText(alarmFixture({ comment: '' }).options);
    expect(pdf).not.toContain('Commentaire');
  });
});

describe('Alarm PDF — facilité de paiement sentence and block order (director feedback)', () => {
  it('uses the updated sentence mentioning installation and carte SIM', async () => {
    const pdf = await renderText(alarmFixture().options);
    expect(pdf).toContain('et installation hors frais de dossier et carte SIM');
  });

  it('places the facilité de paiement block before the surveillance block', async () => {
    const pdf = await renderText(alarmFixture().options);
    const facilityIndex = pdf.indexOf('et installation hors frais de dossier et carte SIM');
    const surveillanceIndex = pdf.indexOf('SURVEILLANCE');
    expect(facilityIndex).toBeGreaterThan(-1);
    expect(surveillanceIndex).toBeGreaterThan(-1);
    expect(facilityIndex).toBeLessThan(surveillanceIndex);
  });

  it('hides the facilité de paiement block when payment months is 0', async () => {
    const pdf = await renderText(alarmFixture({ paymentMonths: 0 }).options);
    expect(pdf).not.toContain('hors frais de dossier et carte SIM');
  });
});

describe('Alarm PDF — durée d\'engagement vs facilité de paiement, decoupled (director feedback)', () => {
  it('uses engagementMonths for the surveillance contract duration and paymentMonths for the facility duration, independently', async () => {
    const pdf = await renderText(alarmFixture({ engagementMonths: 36, paymentMonths: 48 }).options);
    expect(pdf).toContain('contractuelle de 36 mois'); // surveillance block
    expect(pdf).toContain('sur 48 mois'); // facilité de paiement block
  });

  it('falls back to paymentMonths for the surveillance duration when engagementMonths is not provided', async () => {
    const pdf = await renderText(alarmFixture({ paymentMonths: 24, engagementMonths: undefined }).options);
    expect(pdf).toContain('contractuelle de 24 mois');
  });
});

describe('Alarm PDF — italic note under Interventions gratuites (director feedback)', () => {
  it('prints the clarifying note when Interventions gratuites is selected (fixture default)', async () => {
    const pdf = await renderText(alarmFixture().options);
    expect(pdf).toContain('Interventions gratuites');
    expect(pdf).toContain('175.- HT');
    expect(pdf).toContain('livraison de cl');
  });
});
