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
      <div className="px-5 py-4">
        <h2 className="text-[16px] font-bold text-questrade-grey-900 mb-4">Review and confirm</h2>

        <div className="space-y-3.5">
          <div>
            <p className="text-[10px] font-medium text-questrade-green mb-0.5 uppercase tracking-wide">
              From Questrade account
            </p>
            <p className="text-[13px] text-questrade-grey-900 font-medium">
              {state.fromAccount?.displayName}
            </p>
          </div>

          <hr className="border-questrade-grey-100" />

          <div>
            <p className="text-[10px] font-medium text-questrade-green mb-0.5 uppercase tracking-wide">
              To Questrade account
            </p>
            <p className="text-[13px] text-questrade-grey-900 font-medium">
              {state.toAccount?.displayName}
            </p>
          </div>

          <hr className="border-questrade-grey-100" />

          <div>
            <div className="flex items-center justify-between text-[10px] font-medium text-questrade-grey-400 mb-2 uppercase tracking-wide">
              <span>Position</span>
              <span>Qty</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {positionsToTransfer.map(({ symbol, companyName, units }) => (
                <div key={symbol} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] text-questrade-grey-900 font-bold">{symbol}</span>
                    <span className="text-[11px] text-questrade-grey-500 ml-1.5 truncate">
                      {companyName}
                    </span>
                  </div>
                  <span className="text-[12px] text-questrade-grey-900 font-medium whitespace-nowrap">
                    {units}
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
