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
