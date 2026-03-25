import { useEffect, useRef, useState } from 'react';
import { TransferProvider, useTransfer } from './context/TransferContext';
import { IPhoneFrame } from './components/IPhoneFrame';
import { OfflineBanner } from './components/OfflineBanner';
import { ToastContainer } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { AccountSelection } from './screens/AccountSelection';
import { PositionSelection } from './screens/PositionSelection';
import { ReviewConfirmModal } from './modals/ReviewConfirmModal';
import { ErrorModal } from './modals/ErrorModal';
import { SuccessModal } from './modals/SuccessModal';
import { Button } from './components/Button';

function TransferFlow() {
  const {
    state,
    goBackToAccountSelection,
    requestLeave,
    done,
    openReviewModal,
    loadPositions,
    goToPositionSelection,
  } = useTransfer();

  const prevStepRef = useRef(state.step);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [slideKey, setSlideKey] = useState(0);

  useEffect(() => {
    if (prevStepRef.current !== state.step) {
      const isForward = state.step === 'position-selection';
      setSlideDirection(isForward ? 'left' : 'right');
      setSlideKey((k) => k + 1);
      prevStepRef.current = state.step;
    }
  }, [state.step]);

  const handleBack = () => {
    if (state.step === 'position-selection') {
      if (state.hasUnsavedData) {
        requestLeave();
      } else {
        goBackToAccountSelection();
      }
    } else {
      done();
    }
  };

  const slideClass = slideDirection === 'left'
    ? 'animate-slideInLeft'
    : slideDirection === 'right'
      ? 'animate-slideInRight'
      : '';

  const canProceedAccount =
    state.fromAccount !== null &&
    state.toAccount !== null &&
    state.fromAccount.accountId !== state.toAccount.accountId &&
    !state.isOffline;

  const hasSelectedPositions = Object.values(state.unitEntries).some((u) => u > 0);
  const hasValidationErrors = Object.entries(state.unitEntries).some(([symbol, units]) => {
    if (units <= 0) return false;
    const pos = state.positions.find((p) => p.symbol === symbol);
    if (!pos) return false;
    return units > Math.floor(pos.availableUnits);
  });
  const canProceedPositions = hasSelectedPositions && !hasValidationErrors && !state.isOffline;

  const handleNextAccount = async () => {
    if (!state.fromAccount) return;
    await loadPositions(state.fromAccount.accountId);
    goToPositionSelection();
  };

  return (
    <>
      <OfflineBanner />

      {/* Nav — only shown on position selection */}
      {state.step === 'position-selection' && (
        <nav className="bg-[#f5f5f5] border-b border-questrade-grey-200 px-3.5 py-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[14px] text-questrade-green hover:underline"
            aria-label="Go back"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Account selection</span>
          </button>
        </nav>
      )}

      {/* Header */}
      <header className="px-3.5 pt-4 pb-2 flex-shrink-0">
        <h1 className="text-[22px] font-bold text-questrade-grey-900 leading-tight">
          Transfer investments
        </h1>
        <p className="mt-2 text-[13px] text-questrade-grey-500 leading-relaxed">
          Transfer investments between your Questrade Self-directed accounts. For
          transfers from another broker or financial institution, go to{' '}
          <a href="#" className="text-questrade-green font-medium underline">
            Transfer account to Questrade
          </a>
          .
        </p>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 px-3.5 py-3 overflow-x-hidden overflow-y-auto">
        <div key={slideKey} className={slideClass}>
          {state.step === 'account-selection' && <AccountSelection />}
          {state.step === 'position-selection' && <PositionSelection />}
        </div>
      </main>

      {/* Pinned footer — always visible at bottom */}
      <div className="flex-shrink-0 bg-[#f5f5f5] px-3.5 pt-2 pb-1 border-t border-questrade-grey-200">
        {state.step === 'account-selection' && (
          <Button
            fullWidth
            disabled={!canProceedAccount}
            onClick={handleNextAccount}
            loading={state.isLoadingPositions}
          >
            Next
          </Button>
        )}
        {state.step === 'position-selection' && (
          <>
            <Button fullWidth disabled={!canProceedPositions} onClick={openReviewModal}>
              Next
            </Button>
            {!hasSelectedPositions && state.positions.length > 0 && (
              <p className="text-[12px] text-questrade-grey-400 text-center mt-1">
                Enter units for at least one position.
              </p>
            )}
          </>
        )}
      </div>

      <ReviewConfirmModal />
      <ErrorModal />
      <SuccessModal />
      <ConfirmDialog />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <TransferProvider>
      <div className="showcase-page">
        <div className="showcase-container">
          <h1 className="showcase-title">Transfer Position — Mobile Flow</h1>
          <p className="showcase-subtitle">iPhone 17 Preview</p>
          <IPhoneFrame>
            <TransferFlow />
          </IPhoneFrame>
        </div>
      </div>
    </TransferProvider>
  );
}
