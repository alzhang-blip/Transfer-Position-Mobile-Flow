import type { TransferStep } from '../types';

const STEP_ORDER: Record<TransferStep, number> = {
  'account-selection': 0,
  'position-selection': 1,
  'review-confirm': 2,
};

/** Segments match transfer steps; each forward step turns one more segment Questrade green. */
export function TransferProgressBar({ step }: { step: TransferStep }) {
  const total = 3;
  const filled = STEP_ORDER[step] + 1;

  return (
    <div
      className="flex gap-0.5 px-3.5 pb-2.5 pt-0"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={filled}
      aria-label={`Step ${filled} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-[2px] min-w-0 flex-1 rounded-sm transition-colors duration-200 ${
            i < filled ? 'bg-questrade-green' : 'bg-[#E8ECF0]'
          }`}
        />
      ))}
    </div>
  );
}
