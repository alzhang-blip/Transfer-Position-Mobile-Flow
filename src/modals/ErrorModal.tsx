import { useCallback, useEffect, useState } from 'react';
import type { ErrorCode } from '../types';
import { useTransfer } from '../context/TransferContext';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

interface ErrorConfig {
  title: string;
  primaryLabel: string;
  primaryAction: 'try-again' | 'try-again-with-refresh' | 'try-again-cooldown';
  secondaryLabel?: string;
}

function getErrorConfig(code: ErrorCode | null): ErrorConfig {
  switch (code) {
    case 'INSUFFICIENT_BUYING_POWER':
      return { title: 'Cannot process transfer', primaryLabel: 'Try again', primaryAction: 'try-again' };
    case 'CONFLICT_STALE_POSITIONS':
      return { title: 'Positions have changed', primaryLabel: 'Review positions', primaryAction: 'try-again-with-refresh' };
    case 'RATE_LIMITED':
      return { title: 'Too many requests', primaryLabel: 'Try again', primaryAction: 'try-again-cooldown' };
    case 'TIMEOUT':
      return { title: 'Request timed out', primaryLabel: 'Try again', primaryAction: 'try-again', secondaryLabel: 'View history' };
    case 'TRANSFER_IN_PROGRESS':
      return { title: 'Transfer already in progress', primaryLabel: 'View history', primaryAction: 'try-again' };
    case 'SERVER_ERROR':
      return { title: 'Something went wrong', primaryLabel: 'Try again', primaryAction: 'try-again' };
    case 'NETWORK_ERROR':
      return { title: 'Connection error', primaryLabel: 'Try again', primaryAction: 'try-again' };
    default:
      return { title: 'Cannot process transfer', primaryLabel: 'Try again', primaryAction: 'try-again' };
  }
}

export function ErrorModal() {
  const { state, tryAgain, tryAgainWithRefresh } = useTransfer();
  const [cooldown, setCooldown] = useState(0);
  const config = getErrorConfig(state.errorCode);

  useEffect(() => {
    if (state.modalState !== 'error' || state.errorCode !== 'RATE_LIMITED') {
      setCooldown(0);
      return;
    }
    setCooldown(10);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.modalState, state.errorCode]);

  const handlePrimary = useCallback(() => {
    if (config.primaryAction === 'try-again-cooldown' && cooldown > 0) return;
    if (config.primaryAction === 'try-again-with-refresh') tryAgainWithRefresh();
    else tryAgain();
  }, [config.primaryAction, cooldown, tryAgain, tryAgainWithRefresh]);

  return (
    <Modal isOpen={state.modalState === 'error'} onClose={tryAgain} variant="center">
      <div className="px-5 py-5 text-center">
        <div className="mx-auto mb-4">
          <SadDeviceIllustration />
        </div>

        <h2 className="text-[18px] font-bold text-questrade-grey-900 mb-2">
          {config.title}
        </h2>

        <p className="text-[15px] text-questrade-grey-500 leading-relaxed mb-5">
          {state.errorMessage ?? 'An unexpected error occurred. Please try again.'}
        </p>

        <div className="space-y-2">
          {config.secondaryLabel && (
            <Button variant="secondary" fullWidth onClick={tryAgain}>
              {config.secondaryLabel}
            </Button>
          )}
          <Button
            fullWidth
            onClick={handlePrimary}
            disabled={config.primaryAction === 'try-again-cooldown' && cooldown > 0}
          >
            {config.primaryAction === 'try-again-cooldown' && cooldown > 0
              ? `Try again (${cooldown}s)`
              : config.primaryLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function SadDeviceIllustration() {
  return (
    <svg width="90" height="76" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="mx-auto">
      <rect x="35" y="10" width="50" height="75" rx="8" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="2" />
      <rect x="40" y="18" width="40" height="55" rx="2" fill="white" />
      <circle cx="52" cy="40" r="2.5" fill="#2E7D32" />
      <circle cx="68" cy="40" r="2.5" fill="#2E7D32" />
      <path d="M52 54 C55 50, 65 50, 68 54" stroke="#2E7D32" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="10" y="62" width="18" height="23" rx="2" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1.5" transform="rotate(-15 10 62)" />
      <rect x="88" y="65" width="14" height="16" rx="2" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1.5" />
      <circle cx="95" cy="62" r="5" fill="#C8E6C9" />
      <circle cx="90" cy="59" r="4" fill="#A5D6A7" />
    </svg>
  );
}
