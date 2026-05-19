import { useState } from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import type { DonationCTABlock } from '../../../types/admin';
import { resolveAmount, buildHelloAssoUrl, buildCtaLabel } from './helpers';

interface DonationBlockProps {
  block: DonationCTABlock;
}

export default function DonationBlock({ block }: DonationBlockProps) {
  const defaultFrequency = block.frequencies.find(f => f.isDefault)?.key ?? block.frequencies[0].key;
  const defaultAmount = block.amounts.find(a => a.highlight)?.value ?? block.amounts[0].value;

  const [selectedFrequency, setSelectedFrequency] = useState<'once' | 'monthly'>(defaultFrequency);
  const [selectedAmount, setSelectedAmount] = useState<number>(defaultAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustomActive, setIsCustomActive] = useState(false);

  const freeAmountConfig = block.freeAmount ?? { minAmount: 1, maxAmount: 10000 };
  const resolvedAmount = resolveAmount(selectedAmount, customAmount, isCustomActive, freeAmountConfig);
  const ctaUrl = buildHelloAssoUrl(block, selectedFrequency, resolvedAmount);
  const ctaLabel = buildCtaLabel(block.cta, selectedFrequency, resolvedAmount);
  const isDisabled = resolvedAmount === null;

  const frequencyKeys = block.frequencies.map(f => f.key);

  const handleAmountSelect = (value: number) => {
    setSelectedAmount(value);
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
      className="bg-nv-green-light rounded-[20px] p-8 md:p-12 border-2 border-site-border"
    >
      {block.eyebrow && block.variant !== 'compact' && (
        <p className="text-nv-green font-bold text-sm uppercase tracking-widest text-center mb-4">
          {block.eyebrow}
        </p>
      )}

      <h2 className="text-2xl md:text-3xl font-extrabold text-forest text-center mb-4 max-w-2xl mx-auto leading-snug">
        {block.title}
      </h2>

      {block.subtitle && (
        <p className="text-muted text-base md:text-lg text-center mb-8 max-w-xl mx-auto leading-relaxed">
          {block.subtitle}
        </p>
      )}

      {/* Frequency toggle */}
      <div
        role="radiogroup"
        aria-label="Fréquence du don"
        className="flex rounded-full border-2 border-nv-green overflow-hidden w-full sm:w-auto sm:mx-auto sm:max-w-xs mb-8"
      >
        {block.frequencies.map((freq) => (
          <button
            key={freq.key}
            type="button"
            role="radio"
            aria-checked={selectedFrequency === freq.key}
            tabIndex={selectedFrequency === freq.key ? 0 : -1}
            onClick={() => setSelectedFrequency(freq.key)}
            onKeyDown={(e) => handleFrequencyKey(e, freq.key)}
            className={`flex-1 py-2.5 px-4 text-sm font-bold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-nv-green focus-visible:ring-inset ${
              selectedFrequency === freq.key
                ? 'bg-nv-green text-white'
                : 'bg-transparent text-nv-green hover:bg-white/60'
            }`}
          >
            {freq.label}
          </button>
        ))}
      </div>

      {/* Amount cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 max-w-2xl mx-auto">
        {block.amounts.map((amount) => {
          const isSelected = !isCustomActive && selectedAmount === amount.value;
          return (
            <button
              key={amount.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleAmountSelect(amount.value)}
              className={`rounded-[16px] p-4 text-center border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-nv-green focus-visible:ring-offset-2 min-h-[72px] ${
                isSelected
                  ? 'border-nv-green bg-white shadow-md'
                  : 'border-site-border bg-white hover:border-nv-green hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className={`font-extrabold text-lg ${isSelected ? 'text-nv-green' : 'text-forest'}`}>
                  {amount.label}
                </span>
                {isSelected && <CheckCircle size={14} className="text-nv-green shrink-0" />}
              </div>
              <p className="text-xs text-muted leading-tight">{amount.impact}</p>
            </button>
          );
        })}
      </div>

      {/* Free amount input */}
      {block.freeAmount?.enabled && (
        <div className="max-w-2xl mx-auto mb-8">
          <label htmlFor={`${block.id}-custom`} className="block text-sm font-bold text-muted mb-2 text-center">
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
            className={`w-full rounded-[16px] border-2 px-4 py-3 text-center font-bold text-forest placeholder:text-hint placeholder:font-normal focus:outline-none transition-colors duration-150 bg-white ${
              isCustomActive && !showCustomError
                ? 'border-nv-green shadow-md'
                : showCustomError
                ? 'border-coral-500'
                : 'border-site-border hover:border-nv-green'
            }`}
          />
          <p
            id={`${block.id}-custom-hint`}
            className="text-xs text-center mt-1.5 min-h-[1rem]"
            aria-live="polite"
            role="status"
          >
            {showCustomError && (
              <span className="text-coral-500">
                Montant invalide — entrez un montant entre {freeAmountConfig.minAmount} et {freeAmountConfig.maxAmount} €.
              </span>
            )}
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-center mb-8">
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
          {ctaLabel}
        </a>
      </div>

      {/* Trust signals */}
      <div
        className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-muted text-center"
        role="note"
      >
        {block.visual?.showSecurityBadge !== false && (
          <>
            <div className="flex items-center gap-1.5">
              <Shield size={13} className="text-nv-green shrink-0" />
              <span>{block.trust.securityNote}</span>
            </div>
            <span className="hidden sm:inline text-site-border" aria-hidden="true">·</span>
          </>
        )}
        <span>{block.trust.fiscalReceiptNote}</span>
      </div>
    </section>
  );
}
