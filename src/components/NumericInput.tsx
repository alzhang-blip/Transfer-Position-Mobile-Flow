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
  const [touched, setTouched] = useState(false);
  const [pasteHint, setPasteHint] = useState<string | null>(null);

  const hasError = touched && value > 0 && value > max;

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

  const handleBlur = useCallback(() => setTouched(true), []);

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
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="0"
          aria-label={ariaLabel}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${ariaLabel}-error` : undefined}
          maxLength={10}
          className={`w-14 rounded-md border px-2 py-1.5 text-right text-[13px] transition-colors
            ${errorMessage ? 'border-red-400 bg-red-50 text-red-700' : 'border-questrade-grey-300 bg-white text-questrade-grey-900'}
            ${disabled ? 'bg-questrade-grey-100 opacity-60 cursor-not-allowed' : 'focus:border-questrade-green focus:ring-1 focus:ring-questrade-green'}
            focus:outline-none
          `}
        />
        <span className="text-[11px] text-questrade-grey-400">units</span>
      </div>
      {errorMessage && (
        <p className="text-[9px] text-red-600 mt-0.5 text-right" role="alert" id={`${ariaLabel}-error`}>
          {errorMessage}
        </p>
      )}
      {pasteHint && !errorMessage && (
        <p className="text-[9px] text-yellow-700 mt-0.5 text-right">{pasteHint}</p>
      )}
      {disabled && disabledReason && !errorMessage && (
        <p className="text-[9px] text-questrade-grey-400 mt-0.5 text-right max-w-[100px]">
          {disabledReason}
        </p>
      )}
    </div>
  );
}
