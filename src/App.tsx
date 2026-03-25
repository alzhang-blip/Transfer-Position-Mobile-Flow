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

function TransferFlow() {
  const { state, goBackToAccountSelection, requestLeave, done } = useTransfer();

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

  const handleExitFlow = () => {
    if (state.step === 'position-selection' && state.hasUnsavedData) {
      requestLeave();
    } else {
      done();
    }
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

      {/* Content */}
      <main className="flex-1 px-3.5 py-3">
        {state.step === 'account-selection' && <AccountSelection />}
        {state.step === 'position-selection' && <PositionSelection />}
      </main>

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
