import { useTransfer } from '../context/TransferContext';
import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog() {
  const { state, cancelLeave, confirmLeave } = useTransfer();

  return (
    <Modal isOpen={state.modalState === 'confirm-leave'} onClose={cancelLeave} variant="center">
      <div className="px-5 py-5 text-center">
        <svg
          className="mx-auto mb-3 h-8 w-8 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>

        <h2 className="text-[18px] font-bold text-questrade-grey-900 mb-1.5">
          Are you sure you want to leave?
        </h2>
        <p className="text-[15px] text-questrade-grey-500 mb-4">
          Your transfer details will not be saved.
        </p>

        <div className="flex gap-2.5">
          <Button variant="secondary" fullWidth onClick={cancelLeave}>Stay</Button>
          <Button variant="primary" fullWidth onClick={confirmLeave}>Leave</Button>
        </div>
      </div>
    </Modal>
  );
}
