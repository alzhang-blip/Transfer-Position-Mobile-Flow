import { useMemo } from 'react';
import { useTransfer } from '../context/TransferContext';

export function ReviewConfirmScreen() {
  const { state } = useTransfer();

  const positionsToTransfer = useMemo(
    () =>
      Object.entries(state.unitEntries)
        .filter(([, units]) => units > 0)
        .map(([symbol, units]) => {
          const pos = state.positions.find((p) => p.symbol === symbol);
          return { symbol, companyName: pos?.companyName ?? symbol, units };
        }),
    [state.unitEntries, state.positions],
  );

  return (
    <div className="rounded-xl border border-design-border bg-white px-3.5 py-4 shadow-none">
      <div className="space-y-3.5">
        <div>
          <p className="type-body-sm text-design-muted mb-1 font-medium uppercase tracking-wide">
            From Questrade account
          </p>
          <p className="type-body-lg text-design-ink">{state.fromAccount?.displayName}</p>
        </div>

        <hr className="border-design-border" />

        <div>
          <p className="type-body-sm text-design-muted mb-1 font-medium uppercase tracking-wide">
            To Questrade account
          </p>
          <p className="type-body-lg text-design-ink">{state.toAccount?.displayName}</p>
        </div>

        <hr className="border-design-border" />

        <div>
          <div className="flex items-center justify-between type-body-sm text-design-muted mb-2 uppercase tracking-wide font-medium">
            <span>Position</span>
            <span>Qty</span>
          </div>
          <div className="space-y-2.5 max-h-[min(40vh,280px)] overflow-y-auto position-list">
            {positionsToTransfer.map(({ symbol, units }) => (
              <div key={symbol} className="flex items-center justify-between gap-3">
                <span className="type-body-md text-design-ink font-bold">{symbol}</span>
                <span className="type-body-md text-design-ink whitespace-nowrap pt-px">
                  {units} {units === 1 ? 'unit' : 'units'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
