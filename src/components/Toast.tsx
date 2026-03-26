import { useTransfer } from '../context/TransferContext';

const variantClasses = {
  info: 'bg-questrade-grey-800 text-white',
  error: 'bg-red-700 text-white',
  success: 'bg-questrade-green text-white',
};

export function ToastContainer() {
  const { state, dismissToast } = useTransfer();

  if (state.toasts.length === 0) return null;

  return (
    <div
      className="absolute bottom-10 left-3 right-3 z-[70] flex flex-col gap-1.5 pointer-events-none"
      aria-live="polite"
    >
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg px-3 py-2 text-[14px] shadow-lg animate-slideUp pointer-events-auto flex items-center justify-between gap-2 ${variantClasses[toast.variant]}`}
          role="status"
        >
          <span className="leading-snug">{toast.text}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="opacity-70 hover:opacity-100 text-current flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
