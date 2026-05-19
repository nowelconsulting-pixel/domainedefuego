import { describe, it, expect } from 'vitest';
import { computeAfterTax, resolveImpactAmount, buildImpactUrl, buildImpactCtaLabel } from './helpers';

const FREE = { minAmount: 1, maxAmount: 10000 };

const BLOCK = {
  helloasso: {
    oneTimeUrl: 'https://www.helloasso.com/associations/domaine-de-fuego/formulaires/PONCTUEL',
    monthlyUrl: 'https://www.helloasso.com/associations/domaine-de-fuego/formulaires/MENSUEL',
    amountQueryParam: 'montant',
  },
};

const CTA = {
  labelTemplate: 'Je donne {amount} €',
  labelTemplateMonthly: 'Je donne {amount} € / mois',
  labelFallback: 'Je donne',
};

// ── computeAfterTax ──────────────────────────────────────────────────────────

describe('computeAfterTax', () => {
  it('returns 30.6 for 90€ at 66% reduction', () => {
    expect(computeAfterTax(90, 0.66)).toBe(30.6);
  });

  it('returns 40.8 for 120€ at 66% reduction', () => {
    expect(computeAfterTax(120, 0.66)).toBe(40.8);
  });

  it('returns 68 for 200€ at 66% reduction', () => {
    expect(computeAfterTax(200, 0.66)).toBe(68);
  });

  it('returns full amount for 0% reduction rate', () => {
    expect(computeAfterTax(100, 0)).toBe(100);
  });
});

// ── resolveImpactAmount ──────────────────────────────────────────────────────

describe('resolveImpactAmount', () => {
  it('returns preset value when custom is inactive', () => {
    expect(resolveImpactAmount(90, '', false, FREE)).toBe(90);
  });

  it('returns null when selectedValue is null and custom is inactive', () => {
    expect(resolveImpactAmount(null, '', false, FREE)).toBeNull();
  });

  it('parses valid custom amount', () => {
    expect(resolveImpactAmount(90, '75', true, FREE)).toBe(75);
  });

  it('accepts comma as decimal separator', () => {
    expect(resolveImpactAmount(90, '37,5', true, FREE)).toBe(38);
  });

  it('returns null for zero', () => {
    expect(resolveImpactAmount(90, '0', true, FREE)).toBeNull();
  });

  it('returns null for amount above max', () => {
    expect(resolveImpactAmount(90, '99999', true, FREE)).toBeNull();
  });

  it('returns null for empty string when custom active', () => {
    expect(resolveImpactAmount(90, '', true, FREE)).toBeNull();
  });
});

// ── buildImpactUrl ───────────────────────────────────────────────────────────

describe('buildImpactUrl', () => {
  it('uses oneTimeUrl for "once"', () => {
    expect(buildImpactUrl(BLOCK, 'once', 90)).toContain('PONCTUEL');
  });

  it('uses monthlyUrl for "monthly"', () => {
    expect(buildImpactUrl(BLOCK, 'monthly', 90)).toContain('MENSUEL');
  });

  it('appends montant query param', () => {
    expect(buildImpactUrl(BLOCK, 'once', 90)).toContain('?montant=90');
  });

  it('returns base URL when amount is null', () => {
    expect(buildImpactUrl(BLOCK, 'once', null)).toBe(BLOCK.helloasso.oneTimeUrl);
  });

  it('returns base URL when amountQueryParam is null', () => {
    const block = { helloasso: { ...BLOCK.helloasso, amountQueryParam: null } };
    expect(buildImpactUrl(block, 'once', 90)).toBe(BLOCK.helloasso.oneTimeUrl);
  });
});

// ── buildImpactCtaLabel ──────────────────────────────────────────────────────

describe('buildImpactCtaLabel', () => {
  it('returns labelFallback when amount is null', () => {
    expect(buildImpactCtaLabel(CTA, 'once', null)).toBe('Je donne');
  });

  it('substitutes amount for once', () => {
    expect(buildImpactCtaLabel(CTA, 'once', 90)).toBe('Je donne 90 €');
  });

  it('uses monthly template', () => {
    expect(buildImpactCtaLabel(CTA, 'monthly', 120)).toBe('Je donne 120 € / mois');
  });
});
