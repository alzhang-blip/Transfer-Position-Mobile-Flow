import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type {
  Account,
  ErrorCode,
  ModalState,
  Position,
  ToastMessage,
  TransferState,
  TransferStep,
} from '../types';
import { fetchAccounts, fetchPositions, submitTransfer } from '../services/api';

// ── Actions ──────────────────────────────────────────
type Action =
  | { type: 'SET_STEP'; step: TransferStep }
  | { type: 'SET_MODAL'; modal: ModalState }
  | { type: 'SET_FROM_ACCOUNT'; account: Account | null }
  | { type: 'SET_TO_ACCOUNT'; account: Account | null }
  | { type: 'SET_ACCOUNTS_LOADING'; loading: boolean }
  | { type: 'SET_ACCOUNTS_ERROR'; error: boolean }
  | { type: 'SET_POSITIONS_LOADING'; loading: boolean }
  | { type: 'SET_POSITIONS_ERROR'; error: boolean }
  | { type: 'SET_POSITIONS'; positions: Position[] }
  | { type: 'SET_UNIT_ENTRY'; symbol: string; units: number }
  | { type: 'SET_ALL_MAX_UNITS'; positions: Position[]; disabledSymbols: Set<string> }
  | { type: 'CLEAR_UNIT_ENTRIES' }
  | { type: 'SET_SUBMITTING'; submitting: boolean }
  | { type: 'SET_ERROR'; code: ErrorCode | null; message: string | null }
  | { type: 'SET_TRANSFER_ID'; id: string }
  | { type: 'SET_OFFLINE'; offline: boolean }
  | { type: 'ADD_TOAST'; toast: ToastMessage }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'SET_HAS_UNSAVED'; value: boolean }
  | { type: 'RESET' };

const initialState: TransferState = {
  step: 'account-selection',
  modalState: 'none',
  fromAccount: null,
  toAccount: null,
  positions: [],
  unitEntries: {},
  isLoadingAccounts: false,
  isLoadingPositions: false,
  isSubmitting: false,
  errorCode: null,
  errorMessage: null,
  transferId: null,
  accountsError: false,
  positionsError: false,
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  toasts: [],
  hasUnsavedData: false,
};

function reducer(state: TransferState, action: Action): TransferState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_MODAL':
      return { ...state, modalState: action.modal };
    case 'SET_FROM_ACCOUNT':
      return {
        ...state,
        fromAccount: action.account,
        positions: [],
        unitEntries: {},
        positionsError: false,
        hasUnsavedData: false,
      };
    case 'SET_TO_ACCOUNT':
      return { ...state, toAccount: action.account };
    case 'SET_ACCOUNTS_LOADING':
      return { ...state, isLoadingAccounts: action.loading };
    case 'SET_ACCOUNTS_ERROR':
      return { ...state, accountsError: action.error };
    case 'SET_POSITIONS_LOADING':
      return { ...state, isLoadingPositions: action.loading };
    case 'SET_POSITIONS_ERROR':
      return { ...state, positionsError: action.error };
    case 'SET_POSITIONS':
      return { ...state, positions: action.positions, positionsError: false };
    case 'SET_UNIT_ENTRY':
      return {
        ...state,
        unitEntries: { ...state.unitEntries, [action.symbol]: action.units },
        hasUnsavedData: true,
      };
    case 'SET_ALL_MAX_UNITS': {
      const entries: Record<string, number> = { ...state.unitEntries };
      action.positions.forEach((p) => {
        if (p.isTransferable && !action.disabledSymbols.has(p.symbol)) {
          entries[p.symbol] = Math.floor(p.availableUnits);
        }
      });
      return { ...state, unitEntries: entries, hasUnsavedData: true };
    }
    case 'CLEAR_UNIT_ENTRIES':
      return { ...state, unitEntries: {}, hasUnsavedData: false };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.submitting };
    case 'SET_ERROR':
      return { ...state, errorCode: action.code, errorMessage: action.message };
    case 'SET_TRANSFER_ID':
      return { ...state, transferId: action.id };
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.offline };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'SET_HAS_UNSAVED':
      return { ...state, hasUnsavedData: action.value };
    case 'RESET':
      return { ...initialState, isOffline: state.isOffline };
    default:
      return state;
  }
}

// ── Context value interface ──────────────────────────
export interface TransferContextValue {
  state: TransferState;
  accounts: Account[];
  loadAccounts: () => Promise<void>;
  setFromAccount: (account: Account | null) => void;
  setToAccount: (account: Account | null) => void;
  loadPositions: (accountId: string) => Promise<void>;
  setUnitEntry: (symbol: string, units: number) => void;
  setAllMaxUnits: (disabledSymbols?: Set<string>) => void;
  goToPositionSelection: () => void;
  goBackToAccountSelection: () => void;
  openReviewModal: () => void;
  closeModal: () => void;
  confirmTransfer: () => Promise<void>;
  tryAgain: () => void;
  tryAgainWithRefresh: () => void;
  done: () => void;
  showToast: (text: string, variant?: ToastMessage['variant']) => void;
  dismissToast: (id: string) => void;
  requestLeave: () => void;
  confirmLeave: () => void;
  cancelLeave: () => void;
}

const TransferContext = createContext<TransferContextValue | null>(null);

// ── Provider ─────────────────────────────────────────
export function TransferProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Connectivity detection
  useEffect(() => {
    const goOnline = () => dispatch({ type: 'SET_OFFLINE', offline: false });
    const goOffline = () => dispatch({ type: 'SET_OFFLINE', offline: true });
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // ── Toast ───────────────────────────────────
  const showToast = useCallback(
    (text: string, variant: ToastMessage['variant'] = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      dispatch({ type: 'ADD_TOAST', toast: { id, text, variant } });
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 4000);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  // ── Accounts ────────────────────────────────
  const loadAccounts = useCallback(async () => {
    dispatch({ type: 'SET_ACCOUNTS_LOADING', loading: true });
    dispatch({ type: 'SET_ACCOUNTS_ERROR', error: false });
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch {
      dispatch({ type: 'SET_ACCOUNTS_ERROR', error: true });
    } finally {
      dispatch({ type: 'SET_ACCOUNTS_LOADING', loading: false });
    }
  }, []);

  const setFromAccount = useCallback(
    (account: Account | null) => {
      // If the new "From" matches the current "To", clear "To"
      if (account && state.toAccount && account.accountId === state.toAccount.accountId) {
        dispatch({ type: 'SET_TO_ACCOUNT', account: null });
      }
      dispatch({ type: 'SET_FROM_ACCOUNT', account });
    },
    [state.toAccount],
  );

  const setToAccount = useCallback((account: Account | null) => {
    dispatch({ type: 'SET_TO_ACCOUNT', account });
  }, []);

  // ── Positions ───────────────────────────────
  const loadPositions = useCallback(async (accountId: string) => {
    dispatch({ type: 'SET_POSITIONS_LOADING', loading: true });
    dispatch({ type: 'SET_POSITIONS_ERROR', error: false });
    try {
      const data = await fetchPositions(accountId);
      dispatch({ type: 'SET_POSITIONS', positions: data });
    } catch {
      dispatch({ type: 'SET_POSITIONS_ERROR', error: true });
    } finally {
      dispatch({ type: 'SET_POSITIONS_LOADING', loading: false });
    }
  }, []);

  // ── Unit entries ────────────────────────────
  const setUnitEntry = useCallback((symbol: string, units: number) => {
    dispatch({ type: 'SET_UNIT_ENTRY', symbol, units });
  }, []);

  const setAllMaxUnits = useCallback(
    (disabledSymbols: Set<string> = new Set()) => {
      dispatch({ type: 'SET_ALL_MAX_UNITS', positions: state.positions, disabledSymbols });
    },
    [state.positions],
  );

  // ── Navigation ──────────────────────────────
  const goToPositionSelection = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: 'position-selection' });
  }, []);

  const goBackToAccountSelection = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: 'account-selection' });
    dispatch({ type: 'CLEAR_UNIT_ENTRIES' });
    dispatch({ type: 'SET_POSITIONS', positions: [] });
  }, []);

  // ── Leave confirmation ──────────────────────
  const requestLeave = useCallback(() => {
    if (state.hasUnsavedData && state.step === 'position-selection') {
      dispatch({ type: 'SET_MODAL', modal: 'confirm-leave' });
    } else {
      goBackToAccountSelection();
    }
  }, [state.hasUnsavedData, state.step, goBackToAccountSelection]);

  const confirmLeave = useCallback(() => {
    dispatch({ type: 'SET_MODAL', modal: 'none' });
    goBackToAccountSelection();
  }, [goBackToAccountSelection]);

  const cancelLeave = useCallback(() => {
    dispatch({ type: 'SET_MODAL', modal: 'none' });
  }, []);

  // ── Modals ──────────────────────────────────
  const openReviewModal = useCallback(() => {
    dispatch({ type: 'SET_MODAL', modal: 'review' });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'SET_MODAL', modal: 'none' });
  }, []);

  // ── Transfer submission ─────────────────────
  const confirmTransfer = useCallback(async () => {
    if (!state.fromAccount || !state.toAccount) return;
    if (state.isSubmitting) return; // Double-tap guard

    dispatch({ type: 'SET_SUBMITTING', submitting: true });
    dispatch({ type: 'SET_ERROR', code: null, message: null });

    const positionsToTransfer = Object.entries(state.unitEntries)
      .filter(([, units]) => units > 0)
      .map(([symbol, units]) => ({ symbol, units }));

    try {
      const response = await submitTransfer({
        fromAccountId: state.fromAccount.accountId,
        toAccountId: state.toAccount.accountId,
        positions: positionsToTransfer,
      });

      if (response.success) {
        dispatch({ type: 'SET_TRANSFER_ID', id: response.transferId! });
        dispatch({ type: 'SET_MODAL', modal: 'success' });
      } else {
        dispatch({
          type: 'SET_ERROR',
          code: response.errorCode ?? 'SERVER_ERROR',
          message: response.errorMessage ?? 'An unexpected error occurred. Please try again.',
        });
        dispatch({ type: 'SET_MODAL', modal: 'error' });
      }
    } catch {
      dispatch({
        type: 'SET_ERROR',
        code: 'NETWORK_ERROR',
        message: 'Unable to connect. Check your internet connection and try again.',
      });
      dispatch({ type: 'SET_MODAL', modal: 'error' });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', submitting: false });
    }
  }, [state.fromAccount, state.toAccount, state.unitEntries, state.isSubmitting]);

  const tryAgain = useCallback(() => {
    dispatch({ type: 'SET_MODAL', modal: 'none' });
    dispatch({ type: 'SET_ERROR', code: null, message: null });
  }, []);

  // Return to Screen 2 + re-fetch positions (for 409 / stale-data errors)
  const tryAgainWithRefresh = useCallback(async () => {
    dispatch({ type: 'SET_MODAL', modal: 'none' });
    dispatch({ type: 'SET_ERROR', code: null, message: null });
    dispatch({ type: 'CLEAR_UNIT_ENTRIES' });
    if (state.fromAccount) {
      await loadPositions(state.fromAccount.accountId);
    }
  }, [state.fromAccount, loadPositions]);

  const done = useCallback(() => {
    dispatch({ type: 'RESET' });
    setAccounts([]);
  }, []);

  // ── Memoised value ─────────────────────────
  const value = useMemo<TransferContextValue>(
    () => ({
      state,
      accounts,
      loadAccounts,
      setFromAccount,
      setToAccount,
      loadPositions,
      setUnitEntry,
      setAllMaxUnits,
      goToPositionSelection,
      goBackToAccountSelection,
      openReviewModal,
      closeModal,
      confirmTransfer,
      tryAgain,
      tryAgainWithRefresh,
      done,
      showToast,
      dismissToast,
      requestLeave,
      confirmLeave,
      cancelLeave,
    }),
    [
      state,
      accounts,
      loadAccounts,
      setFromAccount,
      setToAccount,
      loadPositions,
      setUnitEntry,
      setAllMaxUnits,
      goToPositionSelection,
      goBackToAccountSelection,
      openReviewModal,
      closeModal,
      confirmTransfer,
      tryAgain,
      tryAgainWithRefresh,
      done,
      showToast,
      dismissToast,
      requestLeave,
      confirmLeave,
      cancelLeave,
    ],
  );

  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>;
}

export function useTransfer(): TransferContextValue {
  const ctx = useContext(TransferContext);
  if (!ctx) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return ctx;
}
