export type AccountEligibility = 'eligible' | 'not_eligible' | 'pending_approval' | 'fx';

export interface Account {
  accountId: string;
  accountType: string;
  displayName: string;
  eligibility: AccountEligibility;
  isSelfDirected: boolean;
}

export interface Position {
  symbol: string;
  companyName: string;
  availableUnits: number;
  isFractional: boolean;
  isTransferable: boolean;
  isMutualFund: boolean;
}

export interface TransferPositionEntry {
  symbol: string;
  units: number;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  positions: TransferPositionEntry[];
}

export type ErrorCode =
  | 'INSUFFICIENT_BUYING_POWER'
  | 'CONFLICT_STALE_POSITIONS'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'TRANSFER_IN_PROGRESS';

export interface TransferResponse {
  success: boolean;
  errorCode?: ErrorCode;
  errorMessage?: string;
  transferId?: string;
}

export type TransferStep = 'account-selection' | 'position-selection';

export type ModalState = 'none' | 'review' | 'error' | 'success' | 'confirm-leave';

export interface ToastMessage {
  id: string;
  text: string;
  variant: 'info' | 'error' | 'success';
}

export interface TransferState {
  step: TransferStep;
  modalState: ModalState;
  fromAccount: Account | null;
  toAccount: Account | null;
  positions: Position[];
  unitEntries: Record<string, number>;
  isLoadingAccounts: boolean;
  isLoadingPositions: boolean;
  isSubmitting: boolean;
  errorCode: ErrorCode | null;
  errorMessage: string | null;
  transferId: string | null;
  accountsError: boolean;
  positionsError: boolean;
  isOffline: boolean;
  toasts: ToastMessage[];
  hasUnsavedData: boolean;
}
