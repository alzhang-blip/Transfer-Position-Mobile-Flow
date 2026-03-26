import type { Account, Position, TransferRequest, TransferResponse, TransferHistoryRecord, TransferComment } from '../types';
import { mockAccounts, mockPositionsByAccount, mockTransferHistory, mockCommentsByTransfer } from './mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms),
    ),
  ]);
}

let fetchAccountsCallCount = 0;

export async function fetchAccounts(): Promise<Account[]> {
  await delay(800);
  fetchAccountsCallCount++;
  // Simulate a failure on the 4th call so the user can test the retry pattern
  if (fetchAccountsCallCount % 4 === 0) {
    throw new Error('NETWORK_ERROR');
  }
  return mockAccounts;
}

let fetchPositionsCallCount = 0;

export async function fetchPositions(accountId: string): Promise<Position[]> {
  await delay(600);
  fetchPositionsCallCount++;
  // Simulate a failure on the 5th call
  if (fetchPositionsCallCount % 5 === 0) {
    throw new Error('NETWORK_ERROR');
  }
  const positions = mockPositionsByAccount[accountId];
  if (!positions) {
    return [];
  }
  return positions;
}

let submitCount = 0;

export async function submitTransfer(request: TransferRequest): Promise<TransferResponse> {
  submitCount++;

  const errorScenario = submitCount % 7;

  try {
    const result = await withTimeout(
      (async (): Promise<TransferResponse> => {
        // Scenario 6: simulate a slow request (won't actually timeout in demo, but shows the pattern)
        if (errorScenario === 6) {
          await delay(2000);
        } else {
          await delay(1500);
        }

        // Scenario 1: Insufficient buying power
        if (errorScenario === 1) {
          return {
            success: false,
            errorCode: 'INSUFFICIENT_BUYING_POWER',
            errorMessage:
              'Your transfer could not be completed because your available buying power is insufficient to cover the required margin for these positions.',
          };
        }

        // Scenario 2: Conflict — stale positions
        if (errorScenario === 2) {
          return {
            success: false,
            errorCode: 'CONFLICT_STALE_POSITIONS',
            errorMessage:
              'One or more positions are no longer available in the quantities specified. Please review and update your transfer.',
          };
        }

        // Scenario 3: Rate limited
        if (errorScenario === 3) {
          return {
            success: false,
            errorCode: 'RATE_LIMITED',
            errorMessage:
              "You've made too many requests. Please wait a moment and try again.",
          };
        }

        // Scenario 4: Server error
        if (errorScenario === 4) {
          return {
            success: false,
            errorCode: 'SERVER_ERROR',
            errorMessage:
              'Something went wrong on our end. Please try again. If the problem persists, contact support at 1-(888)-783-7866.',
          };
        }

        // Scenario 5: Transfer already in progress
        if (errorScenario === 5) {
          return {
            success: false,
            errorCode: 'TRANSFER_IN_PROGRESS',
            errorMessage:
              'A transfer for one or more of these positions is already being processed. Check your Transfer investments history.',
          };
        }

        void request;
        return {
          success: true,
          transferId: `TRF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        };
      })(),
    );
    return result;
  } catch (err) {
    if (err instanceof Error && err.message === 'TIMEOUT') {
      return {
        success: false,
        errorCode: 'TIMEOUT',
        errorMessage:
          'The request is taking longer than expected. Please check your Transfer investments history to see if the transfer was submitted, or try again.',
      };
    }
    throw err;
  }
}

const historyState = [...mockTransferHistory];

export async function fetchTransferHistory(
  startDate: string,
  endDate: string,
): Promise<TransferHistoryRecord[]> {
  await delay(700);
  return historyState.filter((t) => t.date >= startDate && t.date <= endDate);
}

export async function cancelTransferRequest(
  refId: string,
): Promise<{ success: boolean; message?: string }> {
  await delay(1000);
  const record = historyState.find((t) => t.refId === refId);
  if (!record) {
    return { success: false, message: 'Transfer not found.' };
  }
  if (record.status !== 'Active') {
    return { success: false, message: 'This transfer can no longer be cancelled.' };
  }
  record.status = 'Cancelled';
  record.isCancellable = false;
  return { success: true };
}

export function addTransferToHistory(record: TransferHistoryRecord) {
  historyState.unshift(record);
}

const commentsState: Record<string, TransferComment[]> = { ...mockCommentsByTransfer };

export async function fetchTransferComments(
  refId: string,
): Promise<TransferComment[]> {
  await delay(500);
  return commentsState[refId] ?? [];
}

export async function markCommentsAsRead(
  refId: string,
): Promise<{ success: boolean }> {
  await delay(200);
  const comments = commentsState[refId];
  if (comments) {
    comments.forEach((c) => { c.isRead = true; });
  }
  const record = historyState.find((r) => r.refId === refId);
  if (record) {
    record.unreadCommentCount = 0;
  }
  return { success: true };
}
