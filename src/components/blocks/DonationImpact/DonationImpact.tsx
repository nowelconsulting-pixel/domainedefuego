import { useState } from 'react';
import { Heart, Leaf } from 'lucide-react';
import type { DonationImpactBlock } from '../../../types/admin';
import {
  computeAfterTax,
  resolveImpactAmount,
  buildImpactUrl,
  buildImpactCtaLabel,
} from './helpers';

interface DonationImpactProps {
  block: DonationImpactBlock;
}

const IMPACT_ICONS = [Leaf, Heart, Leaf];

export default function DonationImpact({ block }: DonationImpactProps) {
  const defaultFrequency = block.frequencies.find(f => f.isDefault)?.key ?? block.frequencies[0].key;
  const defaultImpact = block.impacts.find(i => i.highlight) ?? block.impacts[0];

  const [selectedFrequency, setSelectedFrequency] = useState<'once' | 'monthly'>(defaultFrequency);
  const [selectedValue, setSelectedValue] = useState<number | null>(defaultImpact.value);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustomActive, setIsCustomActive] = useState(false);

  const freeAmountConfig = block.freeAmount ?? { minAmount: 1, maxAmount: 10000 };
  const resolvedAmount = resolveImpactAmount(selectedValue, customAmount, isCustomActive, freeAmountConfig);
  const ctaUrl = buildImpactUrl(block, selectedFrequency, resolvedAmount);
  const ctaLabel = buildImpactCtaLabel(block.cta, selectedFrequency, resolvedAmount);
  const isDisabled = resolvedAmount === null;

  const frequencyKeys = block.frequencies.map(f => f.key);

  const handleImpactSelect = (value: number) => {
    setSelectedValue(value);
    setIsCustomActive(false);
    setCustomAmount('');
  };

  const handleFrequencyKey = (e: React.KeyboardEvent, currentKey: 'once' | 'monthly') => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const idx = frequencyKeys.indexOf(currentKey);
      const next = frequencyKeys[(idx + (e.key === 'ArrowRight' ? 1 : -1) + frequencyKeys.length) % frequencyKeys.length];
      setSelectedFrequency(next as 'once' | 'monthly');
    }
  };

  const showCustomError = isCustomActive && customAmount !== '' && resolvedAmount === null;

  return (
    <section
      id={block.anchor ?? block.id}
      className="rounded-[20px] border-2 border-site-border bg-surface p-8 md:p-12"
    >
      {/* Eyebrow */}
      {block.eyebrow && (
        <p className="text-nv-green font-bold text-sm uppercase tracking-widest text-center mb-6">
          {block.eyebrow}
        </p>
      )}

      {/* Frequency toggle — two pills with "ou" separator */}
      <div
        role="radiogroup"
        aria-label="Fréquence du don"
        className="flex items-center justify-center gap-3 mb-10"
      >
        {block.frequencies.map((freq, idx) => (
          <span key={freq.key} className="flex items-center gap-3">
            {idx > 0 && (
              <span className="text-muted text-sm font-medium select-none" aria-hidden="true">ou</span>
            )}
            <button
              type="button"
              role="radio"
              aria-checked={selectedFrequency === freq.key}
              tabIndex={selectedFrequency === freq.key ? 0 : -1}
              onClick={() => setSelectedFrequency(freq.key)}
              onKeyDown={(e) => handleFrequencyKey(e, freq.key)}
              className={`px-7 py-2.5 rounded-full font-bold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-nv-green focus-visible:ring-offset-2 ${
                selectedFrequency === freq.key
                  ? 'bg-nv-green text-white shadow-md'
                  : 'border-2 border-nv-green text-nv-green bg-transparent hover:bg-nv-green-light'
              }`}
            >
              {freq.label}
            </button>
          </span>
        ))}
      </div>

      {/* Impact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
        {block.impacts.map((impact, idx) => {
          const isSelected = !isCustomActive && selectedValue === impact.value;
          const afterTax = computeAfterTax(impact.value, impact.taxReductionRate);
          const Icon = IMPACT_ICONS[idx % IMPACT_ICONS.length];
          return (
            <button
              key={impact.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleImpactSelect(impact.value)}
              className={`rounded-[20px] p-6 text-left border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-nv-green focus-visible:ring-offset-2 flex flex-col gap-4 ${
                isSelected
                  ? 'border-nv-green bg-white shadow-lg'
                  : 'border-site-border bg-white hover:border-nv-green hover:shadow-md'
              }`}
            >
              {/* Description */}
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-nv-green' : 'text-muted'}`}>
                  <Icon size={16} />
                </div>
                <p className="text-sm text-forest leading-snug">{impact.description}</p>
              </div>

              {/* Amount + after-tax */}
              <div>
                <div className={`text-4xl font-extrabold leading-none mb-1 ${isSelected ? 'text-nv-green' : 'text-forest'}`}>
                  {impact.value} €
                </div>
                <div className="text-xs leading-tight">
                  <span className="font-bold text-nv-amber">Soit {afterTax} €</span>
                  <span className="text-muted"> après déduction fiscale</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Free amount */}
      {block.freeAmount?.enabled && (
        <div className="max-w-md mx-auto mb-8">
          <p className="text-center text-sm font-bold text-muted mb-3">{block.freeAmount.label}</p>
          <div className="flex gap-2">
            <label htmlFor={`${block.id}-custom`} className="sr-only">
              {block.freeAmount.label}
            </label>
            <input
              id={`${block.id}-custom`}
              type="text"
              inputMode="decimal"
              placeholder={block.freeAmount.placeholder}
              value={customAmount}
              onFocus={() => setIsCustomActive(true)}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setIsCustomActive(true);
              }}
              aria-describedby={`${block.id}-custom-hint`}
              aria-invalid={showCustomError}
              className={`flex-1 rounded-full border-2 px-5 py-3 font-bold text-forest placeholder:text-hint placeholder:font-normal focus:outline-none transition-colors duration-150 ${
                isCustomActive && !showCustomError
                  ? 'border-nv-green shadow-md'
                  : showCustomError
                  ? 'border-coral-500'
                  : 'border-site-border hover:border-nv-green'
              }`}
            />
            <a
              href={isCustomActive && !isDisabled ? ctaUrl : '#'}
              target={isCustomActive && !isDisabled ? '_blank' : undefined}
              rel="noopener noreferrer"
              aria-disabled={isDisabled && isCustomActive}
              onClick={isDisabled && isCustomActive ? (e) => e.preventDefault() : undefined}
              className={`btn-primary px-6 py-3 whitespace-nowrap transition-opacity ${
                isCustomActive && isDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Valider
            </a>
          </div>
          <p
            id={`${block.id}-custom-hint`}
            className="text-xs text-center mt-2 min-h-[1rem]"
            aria-live="polite"
            role="status"
          >
            {showCustomError && (
              <span className="text-coral-500">
                Montant invalide — entrez entre {freeAmountConfig.minAmount} et {freeAmountConfig.maxAmount} €.
              </span>
            )}
          </p>
        </div>
      )}

      {/* Main CTA */}
      <div className="flex justify-center">
        <a
          href={isDisabled ? '#' : ctaUrl}
          target={isDisabled ? undefined : '_blank'}
          rel="noopener noreferrer"
          aria-disabled={isDisabled}
          onClick={isDisabled ? (e) => e.preventDefault() : undefined}
          className={`btn-primary text-base px-10 py-4 w-full sm:w-auto justify-center transition-opacity ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Heart size={18} />
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
