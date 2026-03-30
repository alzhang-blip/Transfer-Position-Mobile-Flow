import { useCallback, useEffect, useRef, useState } from 'react';
import { TransferProvider, useTransfer } from './context/TransferContext';
import { IPhoneFrame } from './components/IPhoneFrame';
import { OfflineBanner } from './components/OfflineBanner';
import { ToastContainer } from './components/Toast';
import { ConfirmDialog } from './components/ConfirmDialog';
import { AccountSelection } from './screens/AccountSelection';
import { PositionSelection } from './screens/PositionSelection';
import { TransferHistory } from './screens/TransferHistory';
import { MoveMoneyHub } from './screens/MoveMoneyHub';
import { ReviewConfirmScreen } from './screens/ReviewConfirmScreen';
import { ErrorModal } from './modals/ErrorModal';
import { SuccessModal } from './modals/SuccessModal';
import { Button } from './components/Button';
import { TransferProgressBar } from './components/TransferProgressBar';
import type { TransferStep } from './types';

type AppView = 'hub' | 'transfer' | 'history';

const STEP_ORDER: Record<TransferStep, number> = {
  'account-selection': 0,
  'position-selection': 1,
  'review-confirm': 2,
};

function TransferFlow({
  onExitToHub,
  navigateToHistory,
}: {
  onExitToHub: () => void;
  navigateToHistory: () => void;
}) {
  const {
    state,
    goBackToAccountSelection,
    requestLeave,
    goToReviewConfirm,
    goBackFromReview,
    confirmTransfer,
    loadPositions,
    goToPositionSelection,
    showToast,
  } = useTransfer();

  const prevStepRef = useRef(state.step);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [slideKey, setSlideKey] = useState(0);

  useEffect(() => {
    if (prevStepRef.current !== state.step) {
      const prev = prevStepRef.current;
      const forward = STEP_ORDER[state.step] > STEP_ORDER[prev];
      setSlideDirection(forward ? 'left' : 'right');
      setSlideKey((k) => k + 1);
      prevStepRef.current = state.step;
    }
  }, [state.step]);

  const handleBack = () => {
    if (state.step === 'review-confirm') {
      goBackFromReview();
    } else if (state.step === 'position-selection') {
      if (state.hasUnsavedData) {
        requestLeave();
      } else {
        goBackToAccountSelection();
      }
    } else {
      onExitToHub();
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
      <div className="flex flex-col flex-1 min-h-0 w-full">
        {/* Fixed: top nav + screen title / summary only */}
        <div className="flex-shrink-0 bg-white border-b border-design-border">
          <header className="relative flex items-center justify-center px-3.5 py-2.5 min-h-[52px]">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              {state.step === 'account-selection' ? (
                <button
                  type="button"
                  onClick={onExitToHub}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-design-close text-design-ink shadow-none hover:bg-design-close-hover transition-colors"
                  aria-label="Back to Move money"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-design-close text-design-ink shadow-none hover:bg-design-close-hover transition-colors"
                  aria-label={
                    state.step === 'review-confirm'
                      ? 'Back to positions'
                      : 'Go back to account selection'
                  }
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
            </div>
            <h1 className="type-heading-lg text-design-ink max-w-[calc(100%-7rem)] text-center truncate tracking-tight">
              {state.step === 'review-confirm' ? 'Review and confirm' : 'Transfer investments'}
            </h1>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={() => showToast('More options are not available in this prototype.', 'info')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-design-close text-design-ink shadow-none hover:bg-design-close-hover transition-colors"
                aria-label="More options"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
            </div>
          </header>
          <TransferProgressBar step={state.step} />
        </div>

        {/* Scroll: intro / From–To + main flow (everything between header and pinned Next) */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white">
          <div className="px-3.5 pt-3 pb-2">
            {state.step === 'account-selection' ? (
              <>
                <p className="type-body-md text-design-muted leading-relaxed">
                  Transfer investments between your Questrade Self-directed accounts. For
                  transfers from another broker or financial institution, go to{' '}
                  <a href="#" className="text-design-link font-medium underline decoration-design-link/40 underline-offset-2">
                    Transfer account to Questrade
                  </a>
                  .
                </p>
                <p className="mt-2 type-body-md text-design-muted leading-relaxed">
                  To see the list of position transfer requests you have created, go to{' '}
                  <button
                    type="button"
                    onClick={navigateToHistory}
                    className="text-design-link font-medium underline decoration-design-link/40 underline-offset-2"
                  >
                    Transfer investments history
                  </button>
                  .
                </p>
              </>
            ) : state.step === 'position-selection' ? (
              <div className="rounded-xl border border-design-border bg-white px-3.5 py-3.5 space-y-3 shadow-none">
                <div>
                  <span className="type-body-sm text-design-muted font-medium">From</span>
                  <p className="type-body-lg text-design-ink mt-0.5">
                    {state.fromAccount?.displayName ?? '—'}
                  </p>
                </div>
                <div>
                  <span className="type-body-sm text-design-muted font-medium">To</span>
                  <p className="type-body-lg text-design-ink mt-0.5">
                    {state.toAccount?.displayName ?? '—'}
                  </p>
                </div>
              </div>
            ) : state.step === 'review-confirm' ? (
              <div key={slideKey} className={slideClass}>
                <ReviewConfirmScreen />
              </div>
            ) : null}
          </div>

          {state.step !== 'review-confirm' && (
            <main className="px-3.5 pt-6 pb-4">
              <div key={slideKey} className={slideClass}>
                {state.step === 'account-selection' && <AccountSelection />}
                {state.step === 'position-selection' && <PositionSelection />}
              </div>
            </main>
          )}
        </div>

        {/* Pinned footer: always at bottom of screen (above home indicator) */}
        <div className="flex-shrink-0 bg-white px-3.5 pt-3 pb-3 border-t border-design-border">
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
              <Button fullWidth disabled={!canProceedPositions} onClick={goToReviewConfirm}>
                Next
              </Button>
              {!hasSelectedPositions && state.positions.length > 0 && (
                <p className="type-body-sm text-design-muted text-center mt-2">
                  Enter units for at least one position.
                </p>
              )}
            </>
          )}
          {state.step === 'review-confirm' && (
            <div className="flex gap-2.5">
              <Button variant="secondary" fullWidth onClick={goBackFromReview} disabled={state.isSubmitting}>
                Edit
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => void confirmTransfer()}
                loading={state.isSubmitting}
                disabled={state.isSubmitting}
              >
                {state.isSubmitting ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <ErrorModal />
      <SuccessModal onNavigateToHistory={navigateToHistory} />
      <ConfirmDialog />
    </>
  );
}

function AppRouter() {
  const [view, setView] = useState<AppView>('hub');
  const [rootSlideDir, setRootSlideDir] = useState<'left' | 'right' | null>(null);
  const [rootNavKey, setRootNavKey] = useState(0);
  const { showToast, done } = useTransfer();

  const openTransfer = useCallback(() => {
    setRootSlideDir('left');
    setRootNavKey((k) => k + 1);
    done();
    setView('transfer');
  }, [done]);

  const exitToHub = useCallback(() => {
    setRootSlideDir('right');
    setRootNavKey((k) => k + 1);
    done();
    setView('hub');
  }, [done]);

  const openHistory = useCallback(() => {
    setRootSlideDir('left');
    setRootNavKey((k) => k + 1);
    setView('history');
  }, []);

  const backToHubFromHistory = useCallback(() => {
    setRootSlideDir('right');
    setRootNavKey((k) => k + 1);
    setView('hub');
  }, []);

  const rootSlideClass =
    rootSlideDir === 'left'
      ? 'animate-slideInLeft'
      : rootSlideDir === 'right'
        ? 'animate-slideInRight'
        : '';

  return (
    <>
      <OfflineBanner />
      <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden bg-white">
        <div
          key={rootNavKey}
          className={`flex flex-col flex-1 min-h-0 w-full bg-white ${rootSlideClass}`}
        >
          {view === 'hub' && (
            <MoveMoneyHub
              onTransferInvestments={openTransfer}
              onTransferInvestmentsHistory={openHistory}
              onClose={() =>
                showToast('In the full app, Close dismisses Move money.', 'info')
              }
              showToast={showToast}
            />
          )}
          {view === 'history' && (
            <TransferHistory
              onBack={backToHubFromHistory}
              onClose={backToHubFromHistory}
              showToast={showToast}
            />
          )}
          {view === 'transfer' && (
            <TransferFlow onExitToHub={exitToHub} navigateToHistory={openHistory} />
          )}
        </div>
      </div>
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
            <AppRouter />
          </IPhoneFrame>
        </div>
      </div>
    </TransferProvider>
  );
}
