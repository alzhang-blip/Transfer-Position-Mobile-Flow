import { useTransfer } from '../context/TransferContext';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

interface SuccessModalProps {
  onNavigateToHistory: () => void;
}

export function SuccessModal({ onNavigateToHistory }: SuccessModalProps) {
  const { state, done } = useTransfer();

  const handleViewHistory = () => {
    done();
    onNavigateToHistory();
  };

  return (
    <Modal isOpen={state.modalState === 'success'} onClose={done} variant="center">
      <div className="px-5 py-5 text-center bg-white">
        <div className="mx-auto mb-4">
          <HourglassIllustration />
        </div>

        <h2 className="type-display-md text-design-ink mb-2">
          Your transfer is being processed
        </h2>

        <p className="type-body-md text-design-muted mb-5 leading-relaxed">
          We've received your request. Monitor progress in your{' '}
          <button type="button" onClick={handleViewHistory} className="text-design-link font-semibold underline decoration-design-link/40 underline-offset-2">
            Transfer investments history
          </button>
          .
        </p>

        <Button fullWidth onClick={done}>
          Done
        </Button>
      </div>
    </Modal>
  );
}

function HourglassIllustration() {
  return (
    <svg width="90" height="76" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="mx-auto">
      <circle cx="60" cy="50" r="38" stroke="#E8E8E8" strokeWidth="1" strokeDasharray="4 3" />
      <path d="M42 20 H78 L62 48 H58 L42 20Z" fill="#F5F5F5" stroke="#D0D0D0" strokeWidth="1.5" />
      <path d="M42 80 H78 L62 52 H58 L42 80Z" fill="#F5F5F5" stroke="#D0D0D0" strokeWidth="1.5" />
      <path d="M50 28 H70 L62 44 H58 L50 28Z" fill="#FFF9C4" />
      <path d="M52 76 H68 L62 58 H58 L52 76Z" fill="#FFE082" />
      <line x1="60" y1="46" x2="60" y2="56" stroke="#FFD54F" strokeWidth="1.5" />
      <rect x="38" y="16" width="44" height="4" rx="2" fill="#E0E0E0" />
      <rect x="38" y="80" width="44" height="4" rx="2" fill="#E0E0E0" />
      <ellipse cx="84" cy="72" rx="6" ry="10" fill="#C8E6C9" transform="rotate(-20 84 72)" />
      <ellipse cx="78" cy="78" rx="5" ry="8" fill="#A5D6A7" transform="rotate(15 78 78)" />
      <circle cx="55" cy="12" r="3" fill="#90A4AE" />
      <path d="M52 12 L48 11" stroke="#90A4AE" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="54" cy="11" r="0.8" fill="white" />
    </svg>
  );
}
