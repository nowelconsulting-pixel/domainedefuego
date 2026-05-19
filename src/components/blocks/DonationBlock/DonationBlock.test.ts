import { describe, it, expect } from 'vitest';
import { resolveAmount, buildHelloAssoUrl, buildCtaLabel } from './helpers';

const FREE = { minAmount: 1, maxAmount: 10000 };

const BLOCK = {
  helloasso: {
    oneTimeUrl: 'https://www.helloasso.com/associations/domaine-de-fuego/formulaires/PONCTUEL',
    monthlyUrl: 'https://www.helloasso.com/associations/domaine-de-fuego/formulaires/MENSUEL',
    amountQueryParam: 'montant',
  },
};

const CTA = {
  labelTemplate: 'Faire un don de {amount}€',
  labelTemplateMonthly: 'Soutenir avec {amount}€ par mois',
  labelFallback: 'Faire un don',
};

// ── resolveAmount ────────────────────────────────────────────────────────────

describe('resolveAmount', () => {
  it('returns selected preset amount when custom is inactive', () => {
    expect(resolveAmount(25, '', false, FREE)).toBe(25);
  });

  it('returns parsed integer for valid custom amount string', () => {
    expect(resolveAmount(25, '37', true, FREE)).toBe(37);
  });

  it('rounds decimal custom amounts', () => {
    expect(resolveAmount(25, '12.6', true, FREE)).toBe(13);
  });

  it('accepts comma as decimal separator', () => {
    expect(resolveAmount(25, '19,99', true, FREE)).toBe(20);
  });

  it('returns null for zero', () => {
    expect(resolveAmount(25, '0', true, FREE)).toBeNull();
  });

  it('returns null for negative value', () => {
    expect(resolveAmount(25, '-5', true, FREE)).toBeNull();
  });

  it('returns null for amount above max', () => {
    expect(resolveAmount(25, '99999', true, FREE)).toBeNull();
  });

  it('returns null for non-numeric string', () => {
    expect(resolveAmount(25, 'abc', true, FREE)).toBeNull();
  });

  it('returns null for empty custom string when active', () => {
    expect(resolveAmount(25, '', true, FREE)).toBeNull();
  });
});

// ── buildHelloAssoUrl ────────────────────────────────────────────────────────

describe('buildHelloAssoUrl', () => {
  it('uses oneTimeUrl for frequency "once"', () => {
    const url = buildHelloAssoUrl(BLOCK, 'once', 25);
    expect(url).toContain('PONCTUEL');
  });

  it('uses monthlyUrl for frequency "monthly"', () => {
    const url = buildHelloAssoUrl(BLOCK, 'monthly', 25);
    expect(url).toContain('MENSUEL');
  });

  it('appends amount as query param', () => {
    const url = buildHelloAssoUrl(BLOCK, 'once', 25);
    expect(url).toContain('?montant=25');
  });

  it('returns base URL when amountQueryParam is null', () => {
    const block = { helloasso: { ...BLOCK.helloasso, amountQueryParam: null } };
    const url = buildHelloAssoUrl(block, 'once', 25);
    expect(url).toBe(BLOCK.helloasso.oneTimeUrl);
    expect(url).not.toContain('montant');
  });

  it('returns base URL when amount is null', () => {
    const url = buildHelloAssoUrl(BLOCK, 'once', null);
    expect(url).toBe(BLOCK.helloasso.oneTimeUrl);
  });

  it('returns base URL gracefully when URL is a placeholder (invalid URL)', () => {
    const block = {
      helloasso: {
        oneTimeUrl: 'REMPLACER_PAR_ID_FORM_PONCTUEL',
        monthlyUrl: 'REMPLACER_PAR_ID_FORM_MENSUEL',
        amountQueryParam: 'montant',
      },
    };
    expect(buildHelloAssoUrl(block, 'once', 25)).toBe('REMPLACER_PAR_ID_FORM_PONCTUEL');
  });
});

// ── buildCtaLabel ────────────────────────────────────────────────────────────

describe('buildCtaLabel', () => {
  it('returns labelFallback when amount is null', () => {
    expect(buildCtaLabel(CTA, 'once', null)).toBe('Faire un don');
  });

  it('substitutes {amount} in labelTemplate for once', () => {
    expect(buildCtaLabel(CTA, 'once', 25)).toBe('Faire un don de 25€');
  });

  it('uses labelTemplateMonthly for monthly frequency', () => {
    expect(buildCtaLabel(CTA, 'monthly', 25)).toBe('Soutenir avec 25€ par mois');
  });

  it('substitutes amount 10 correctly', () => {
    expect(buildCtaLabel(CTA, 'once', 10)).toBe('Faire un don de 10€');
  });
});
