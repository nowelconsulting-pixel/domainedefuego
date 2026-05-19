import type { DonationCTABlock } from '../../../types/admin';

export const DEFAULT_DONATION_BLOCK: DonationCTABlock = {
  type: 'donation-cta',
  id: 'donation-cta-default',
  variant: 'default',
  anchor: 'soutenir',
  eyebrow: 'Soutenir le refuge',
  title: 'Vous ne pouvez pas adopter ? Vous pouvez quand même changer une vie.',
  subtitle: 'Chaque don aide à nourrir, soigner et protéger les animaux du Domaine. Avec vous, ils trouvent un foyer en attendant le leur.',
  frequencies: [
    { key: 'once', label: 'Un don', isDefault: true },
    { key: 'monthly', label: 'Soutien mensuel' },
  ],
  amounts: [
    { value: 10,  label: '10 €',  impact: 'Un repas chaud pour cinq pensionnaires', highlight: false },
    { value: 25,  label: '25 €',  impact: 'Les vaccins de base d\'un chiot ou chaton', highlight: true },
    { value: 50,  label: '50 €',  impact: 'Une semaine de soins courants', highlight: false },
    { value: 100, label: '100 €', impact: 'Un sauvetage : prise en charge complète', highlight: false },
  ],
  freeAmount: { enabled: true, label: 'Autre montant', placeholder: 'Votre montant en €', minAmount: 1, maxAmount: 10000 },
  cta: {
    labelTemplate: 'Faire un don de {amount} €',
    labelTemplateMonthly: 'Soutenir avec {amount} € par mois',
    labelFallback: 'Faire un don',
  },
  helloasso: {
    oneTimeUrl: 'https://www.helloasso.com/associations/domaine-de-fuego/formulaires/REMPLACER_PAR_ID_FORM_PONCTUEL',
    monthlyUrl:  'https://www.helloasso.com/associations/domaine-de-fuego/formulaires/REMPLACER_PAR_ID_FORM_MENSUEL',
    amountQueryParam: 'montant',
  },
  trust: {
    fiscalReceiptNote: 'Reçu fiscal envoyé automatiquement — 66 % de votre don déductible de vos impôts.',
    securityNote: 'Paiement 100 % sécurisé via HelloAsso. 100 % de votre don est reversé à l\'association.',
  },
  visual: { background: 'surface-warm', decorativeImage: null, showSecurityBadge: true },
};

export function resolveAmount(
  selectedAmount: number,
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
  return selectedAmount;
}

export function buildHelloAssoUrl(
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

export function buildCtaLabel(
  cta: { labelTemplate: string; labelTemplateMonthly: string; labelFallback: string },
  frequency: 'once' | 'monthly',
  amount: number | null
): string {
  if (!amount) return cta.labelFallback;
  const template = frequency === 'monthly' ? cta.labelTemplateMonthly : cta.labelTemplate;
  return template.replace('{amount}', String(amount));
}
