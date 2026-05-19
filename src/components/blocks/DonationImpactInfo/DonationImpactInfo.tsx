import { Heart, Leaf } from 'lucide-react';
import type { DonationImpactInfoBlock } from '../../../types/admin';
import { computeAfterTax } from '../DonationImpact/helpers';

interface DonationImpactInfoProps {
  block: DonationImpactInfoBlock;
}

const IMPACT_ICONS = [Leaf, Heart, Leaf];

export default function DonationImpactInfo({ block }: DonationImpactInfoProps) {
  return (
    <section
      id={block.anchor ?? block.id}
      className="rounded-[20px] border-2 border-site-border bg-surface p-8 md:p-12"
    >
      {block.eyebrow && (
        <p className="text-nv-green font-bold text-sm uppercase tracking-widest text-center mb-6">
          {block.eyebrow}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {block.impacts.map((impact, idx) => {
          const afterTax = computeAfterTax(impact.value, impact.taxReductionRate);
          const Icon = IMPACT_ICONS[idx % IMPACT_ICONS.length];
          return (
            <div
              key={impact.value}
              className={`rounded-[20px] p-6 text-left border-2 flex flex-col gap-4 bg-white ${
                impact.highlight ? 'border-nv-green shadow-lg' : 'border-site-border'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 shrink-0 ${impact.highlight ? 'text-nv-green' : 'text-muted'}`}>
                  <Icon size={16} />
                </div>
                <p className="text-sm text-forest leading-snug">{impact.description}</p>
              </div>

              <div>
                <div className={`text-4xl font-extrabold leading-none mb-1 ${impact.highlight ? 'text-nv-green' : 'text-forest'}`}>
                  {impact.value} €
                </div>
                <div className="text-xs leading-tight">
                  <span className="font-bold text-nv-amber">Soit {afterTax} €</span>
                  <span className="text-muted"> après déduction fiscale</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
