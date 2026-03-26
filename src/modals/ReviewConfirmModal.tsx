import { useMemo } from 'react';
import { useTransfer } from '../context/TransferContext';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

export function ReviewConfirmModal() {
  const { state, closeModal, confirmTransfer } = useTransfer();

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

  const handleConfirm = () => {
    if (state.isSubmitting) return;
    confirmTransfer();
  };

  return (
    <Modal isOpen={state.modalState === 'review'} onClose={state.isSubmitting ? undefined : closeModal} variant="bottom-sheet">
      <div className="px-5 py-4 bg-white">
        <h2 className="type-display-md text-design-ink mb-4">Review and confirm</h2>

        <div className="space-y-3.5">
          <div>
            <p className="type-body-sm text-design-muted mb-1 font-medium uppercase tracking-wide">
            From Questrade account
            </p>
            <p className="type-body-lg text-design-ink">
              {state.fromAccount?.displayName}
            </p>
          </div>

          <hr className="border-design-border" />

          <div>
            <p className="type-body-sm text-design-muted mb-1 font-medium uppercase tracking-wide">
            To Questrade account
            </p>
            <p className="type-body-lg text-design-ink">
              {state.toAccount?.displayName}
            </p>
          </div>

          <hr className="border-design-border" />

          <div>
            <div className="flex items-center justify-between type-body-sm text-design-muted mb-2 uppercase tracking-wide font-medium">
              <span>Position</span>
              <span>Qty</span>
            </div>
            <div className="space-y-2.5 max-h-40 overflow-y-auto">
              {positionsToTransfer.map(({ symbol, units }) => (
                <div key={symbol} className="flex items-center justify-between gap-3">
                  <span className="type-body-md text-design-ink font-bold">
                    {symbol}
                  </span>
                  <span className="type-body-md text-design-ink whitespace-nowrap pt-px">
                    {units} {units === 1 ? 'unit' : 'units'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 mt-5">
          <Button variant="secondary" fullWidth onClick={closeModal} disabled={state.isSubmitting}>
            Edit
          </Button>
          <Button variant="primary" fullWidth onClick={handleConfirm} loading={state.isSubmitting} disabled={state.isSubmitting}>
            {state.isSubmitting ? 'Processing...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
