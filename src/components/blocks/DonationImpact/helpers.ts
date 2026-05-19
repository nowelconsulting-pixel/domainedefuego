import type { DonationImpactBlock } from '../../../types/admin';

export const DEFAULT_DONATION_IMPACT_BLOCK: DonationImpactBlock = {
  type: 'donation-impact',
  id: 'donation-impact-default',
  variant: 'default',
  anchor: 'impact-don',
  eyebrow: 'Je donne pour les animaux',
  frequencies: [
    { key: 'once', label: 'Une fois', isDefault: true },
    { key: 'monthly', label: 'Tous les mois' },
  ],
  impacts: [
    {
      value: 90,
      description: 'Je permets à un refuge de soigner un chien pendant 3 mois',
      taxReductionRate: 0.66,
      highlight: false,
    },
    {
      value: 120,
      description: 'Je permets à un refuge de nourrir un chat pendant 1 an',
      taxReductionRate: 0.66,
      highlight: true,
    },
    {
      value: 200,
      description: 'Je permets à un refuge de nourrir et soigner un chien ou un chat pendant 6 mois',
      taxReductionRate: 0.66,
      highlight: false,
    },
  ],
  freeAmount: {
    enabled: true,
    label: 'Ou un montant à ma convenance',
    placeholder: 'Montant en €',
    minAmount: 1,
    maxAmount: 10000,
  },
  cta: {
    labelTemplate: 'Je donne {amount} €',
    labelTemplateMonthly: 'Je donne {amount} € / mois',
    labelFallback: 'Je donne',
  },
  helloasso: {
    oneTimeUrl: 'https://www.helloasso.com/associations/domaine-de-fuego/formulaires/REMPLACER_PAR_ID_FORM_PONCTUEL',
    monthlyUrl: 'https://www.helloasso.com/associations/domaine-de-fuego/formulaires/REMPLACER_PAR_ID_FORM_MENSUEL',
    amountQueryParam: 'montant',
  },
};

export function computeAfterTax(amount: number, taxReductionRate: number): number {
  return Math.round(amount * (1 - taxReductionRate) * 10) / 10;
}

export function resolveImpactAmount(
  selectedValue: number | null,
  customAmount: string,
  isCustomActive: boolean,
  freeAmount: { minAmount: number; maxAmount: number }
): number | null {
  if (isCustomActive) {
    const parsed = parseFloat(String(customAmount).replace(',', '.'));
    if (Number.isFinite(parsed) && parsed >= freeAmount.minAmount && parsed <= freeAmount.maxAmount) {
      return Math.round(parsed);
    }
    return null;
  }
  return selectedValue;
}

export function buildImpactUrl(
  block: { helloasso: { oneTimeUrl: string; monthlyUrl: string; amountQueryParam?: string | null } },
  frequency: 'once' | 'monthly',
  amount: number | null
): string {
  const baseUrl = frequency === 'monthly' ? block.helloasso.monthlyUrl : block.helloasso.oneTimeUrl;
  if (!amount || !block.helloasso.amountQueryParam) return baseUrl;
  try {
    const url = new URL(baseUrl);
    url.searchParams.set(block.helloasso.amountQueryParam, String(amount));
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function buildImpactCtaLabel(
  cta: { labelTemplate: string; labelTemplateMonthly: string; labelFallback: string },
  frequency: 'once' | 'monthly',
  amount: number | null
): string {
  if (!amount) return cta.labelFallback;
  const template = frequency === 'monthly' ? cta.labelTemplateMonthly : cta.labelTemplate;
  return template.replace('{amount}', String(amount));
}
