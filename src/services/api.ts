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

export async function fetchAccounts(): Promise<Account[]> {
  await delay(800);
  if (Math.random() >= 0.95) {
    throw new Error('NETWORK_ERROR');
  }
  return mockAccounts;
}

export async function fetchPositions(accountId: string): Promise<Position[]> {
  await delay(600);
  if (Math.random() >= 0.95) {
    throw new Error('NETWORK_ERROR');
  }
  const positions = mockPositionsByAccount[accountId];
  if (!positions) {
    return [];
  }
  return positions;
}

const errorResponses: TransferResponse[] = [
  {
    success: false,
    errorCode: 'INSUFFICIENT_BUYING_POWER',
    errorMessage:
      'Your transfer could not be completed because your available buying power is insufficient to cover the required margin for these positions.',
  },
  {
    success: false,
    errorCode: 'CONFLICT_STALE_POSITIONS',
    errorMessage:
      'One or more positions are no longer available in the quantities specified. Please review and update your transfer.',
  },
  {
    success: false,
    errorCode: 'RATE_LIMITED',
    errorMessage:
      "You've made too many requests. Please wait a moment and try again.",
  },
  {
    success: false,
    errorCode: 'SERVER_ERROR',
    errorMessage:
      'Something went wrong on our end. Please try again. If the problem persists, contact support at 1-(888)-783-7866.',
  },
  {
    success: false,
    errorCode: 'TRANSFER_IN_PROGRESS',
    errorMessage:
      'A transfer for one or more of these positions is already being processed. Check your Transfer investments history.',
  },
];

export async function submitTransfer(request: TransferRequest): Promise<TransferResponse> {
  try {
    const result = await withTimeout(
      (async (): Promise<TransferResponse> => {
        await delay(1500);

        if (Math.random() < 0.9) {
          void request;
          return {
            success: true,
            transferId: `TRF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          };
        }

        return errorResponses[Math.floor(Math.random() * errorResponses.length)];
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
