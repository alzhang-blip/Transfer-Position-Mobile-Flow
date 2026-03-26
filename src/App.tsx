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
import { ReviewConfirmModal } from './modals/ReviewConfirmModal';
import { ErrorModal } from './modals/ErrorModal';
import { SuccessModal } from './modals/SuccessModal';
import { Button } from './components/Button';

type AppView = 'hub' | 'transfer' | 'history';

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
        <div className="flex-shrink-0 bg-design-canvas border-b border-design-border">
          <nav className="px-3.5 py-2.5">
            {state.step === 'account-selection' ? (
              <button
                type="button"
                onClick={onExitToHub}
                className="inline-flex items-center gap-2 rounded-full bg-design-close pl-2.5 pr-3 py-2 type-label-md text-design-link hover:bg-design-close-hover transition-colors"
                aria-label="Back to Move money"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm border border-design-border/60">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </span>
                <span>Back to Move money</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-full bg-design-close pl-2.5 pr-3 py-2 type-label-md text-design-link hover:bg-design-close-hover transition-colors"
                aria-label="Go back to account selection"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm border border-design-border/60">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </span>
                <span>Back to Account selection</span>
              </button>
            )}
          </nav>

          <header className="px-3.5 pt-2 pb-3">
            <h1 className="type-display-lg text-design-ink">
              Transfer investments
            </h1>
          </header>
        </div>

        {/* Scroll: intro / From–To + main flow (everything between header and pinned Next) */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-design-canvas">
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
            ) : (
              <div className="rounded-2xl border border-design-border bg-white px-3.5 py-3.5 space-y-3 shadow-card">
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
            )}
          </div>

          <main className="px-3.5 pt-6 pb-4">
            <div key={slideKey} className={slideClass}>
              {state.step === 'account-selection' && <AccountSelection />}
              {state.step === 'position-selection' && <PositionSelection />}
            </div>
          </main>
        </div>

        {/* Pinned footer: always at bottom of screen (above home indicator) */}
        <div className="flex-shrink-0 bg-design-canvas px-3.5 pt-3 pb-3 border-t border-design-border shadow-[0_-4px_24px_rgba(32,36,43,0.06)]">
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
                <p className="type-body-sm text-design-muted text-center mt-2">
                  Enter units for at least one position.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <ReviewConfirmModal />
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
      <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
        <div
          key={rootNavKey}
          className={`flex flex-col flex-1 min-h-0 w-full ${rootSlideClass}`}
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
