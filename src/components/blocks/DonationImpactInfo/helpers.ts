import type { DonationImpactInfoBlock } from '../../../types/admin';

export const DEFAULT_DONATION_IMPACT_INFO_BLOCK: DonationImpactInfoBlock = {
  type: 'donation-impact-info',
  id: 'donation-impact-info-default',
  anchor: 'impact-info',
  eyebrow: 'Votre soutien a un impact concret',
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
};
