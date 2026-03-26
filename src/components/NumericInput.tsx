import { useCallback, useState } from 'react';

interface NumericInputProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  disabledReason?: string;
  ariaLabel: string;
}

export function NumericInput({
  value,
  max,
  onChange,
  disabled = false,
  disabledReason,
  ariaLabel,
}: NumericInputProps) {
  const [pasteHint, setPasteHint] = useState<string | null>(null);

  const hasError = value > 0 && value > max;

  const sanitize = useCallback((raw: string): number => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits === '') return 0;
    return parseInt(digits, 10);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasteHint(null);
      onChange(sanitize(e.target.value));
    },
    [onChange, sanitize],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData('text');
      if (pasted.includes('.') || pasted.includes(',')) {
        setPasteHint('Whole units only');
        setTimeout(() => setPasteHint(null), 3000);
      }
      e.preventDefault();
      onChange(sanitize(pasted.replace(/-/g, '')));
    },
    [onChange, sanitize],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '.', ',', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
  }, []);

  const errorMessage = hasError
    ? max === 0
      ? 'Contact support'
      : `Max ${max}`
    : null;

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value || ''}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="0"
          aria-label={ariaLabel}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${ariaLabel}-error` : undefined}
          maxLength={10}
          className={`w-16 rounded-lg border px-2 py-1.5 text-right type-input transition-colors
            ${errorMessage ? 'border-red-400 bg-red-50 text-red-700' : 'border-design-border bg-white text-design-ink'}
            ${disabled ? 'bg-[#F0F2F5] opacity-80 cursor-not-allowed' : 'focus:border-design-link focus:ring-1 focus:ring-design-link'}
            focus:outline-none
          `}
        />
      </div>
      {errorMessage && (
        <p className="type-error text-red-600 mt-0.5 text-right" role="alert" id={`${ariaLabel}-error`}>
          {errorMessage}
        </p>
      )}
      {pasteHint && !errorMessage && (
        <p className="type-error text-yellow-700 mt-0.5 text-right">{pasteHint}</p>
      )}
    </div>
  );
}
