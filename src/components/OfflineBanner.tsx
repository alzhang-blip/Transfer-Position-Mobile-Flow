import { useTransfer } from '../context/TransferContext';

export function OfflineBanner() {
  const { state } = useTransfer();

  if (!state.isOffline) return null;

  return (
    <div
      className="bg-yellow-600 text-white text-[12px] font-medium text-center px-3 py-1 flex-shrink-0"
      role="alert"
      aria-live="assertive"
    >
      You're offline. Some features may not work.
    </div>
  );
}
