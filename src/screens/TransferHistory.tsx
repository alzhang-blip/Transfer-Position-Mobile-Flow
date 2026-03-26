import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TransferHistoryRecord, TransferComment } from '../types';
import {
  fetchTransferHistory,
  cancelTransferRequest,
  fetchTransferComments,
  markCommentsAsRead,
} from '../services/api';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { SkeletonLoader } from '../components/SkeletonLoader';

interface TransferHistoryProps {
  onBack: () => void;
  onClose: () => void;
  showToast: (text: string, variant?: 'info' | 'error' | 'success') => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCommentTimestamp(isoDatetime: string): string {
  const d = new Date(isoDatetime);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const commentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (commentDay.getTime() === today.getTime()) {
    return `Today at ${timeStr}`;
  }
  if (commentDay.getTime() === yesterday.getTime()) {
    return `Yesterday at ${timeStr}`;
  }
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDefaultRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 90);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

const URL_REGEX = /https?:\/\/[^\s,)}\]]+/g;

function renderBodyWithLinks(body: string) {
  const parts: (string | { url: string })[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(URL_REGEX.source, 'g');
  while ((match = regex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      parts.push(body.slice(lastIndex, match.index));
    }
    parts.push({ url: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < body.length) {
    parts.push(body.slice(lastIndex));
  }

  return parts.map((part, i) => {
    if (typeof part === 'string') {
      return <span key={i}>{part}</span>;
    }
    return (
      <a
        key={i}
        href={part.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-questrade-green underline break-all"
      >
        {part.url}
      </a>
    );
  });
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  'Pending approval': 'bg-questrade-grey-200 text-questrade-grey-700',
  Completed: 'bg-blue-100 text-blue-800',
  Cancelled: 'bg-questrade-grey-100 text-questrade-grey-500',
  Failed: 'bg-red-100 text-red-700',
};

export function TransferHistory({ onBack, onClose, showToast }: TransferHistoryProps) {
  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [records, setRecords] = useState<TransferHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<TransferHistoryRecord | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [commentsTarget, setCommentsTarget] = useState<TransferHistoryRecord | null>(null);
  const [comments, setComments] = useState<TransferComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState(false);
  const actionLockRef = useRef(false);

  const loadHistory = useCallback(async (start: string, end: string) => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await fetchTransferHistory(start, end);
      setRecords(data);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(startDate, endDate);
  }, [startDate, endDate, loadHistory]);

  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTarget || isCancelling) return;
    setIsCancelling(true);
    try {
      const result = await cancelTransferRequest(cancelTarget.refId);
      if (result.success) {
        setRecords((prev) =>
          prev.map((r) =>
            r.refId === cancelTarget.refId
              ? { ...r, status: 'Cancelled' as const, isCancellable: false }
              : r,
          ),
        );
        showToast('Transfer cancelled.', 'success');
      } else {
        showToast(result.message || 'Unable to cancel this transfer. Please try again.', 'error');
        loadHistory(startDate, endDate);
      }
    } catch {
      showToast('Unable to cancel this transfer. Please try again.', 'error');
    } finally {
      setIsCancelling(false);
      setCancelTarget(null);
      actionLockRef.current = false;
    }
  }, [cancelTarget, isCancelling, showToast, loadHistory, startDate, endDate]);

  const handleOpenComments = useCallback(async (record: TransferHistoryRecord) => {
    if (actionLockRef.current) return;
    actionLockRef.current = true;

    setCommentsTarget(record);
    setIsLoadingComments(true);
    setCommentsError(false);
    setComments([]);

    try {
      const data = await fetchTransferComments(record.refId);
      setComments(data);

      if (record.unreadCommentCount > 0) {
        markCommentsAsRead(record.refId).catch(() => {});
        setRecords((prev) =>
          prev.map((r) =>
            r.refId === record.refId ? { ...r, unreadCommentCount: 0 } : r,
          ),
        );
      }
    } catch {
      setCommentsError(true);
    } finally {
      setIsLoadingComments(false);
    }
  }, []);

  const handleRetryComments = useCallback(async () => {
    if (!commentsTarget) return;
    setIsLoadingComments(true);
    setCommentsError(false);
    try {
      const data = await fetchTransferComments(commentsTarget.refId);
      setComments(data);
    } catch {
      setCommentsError(true);
    } finally {
      setIsLoadingComments(false);
    }
  }, [commentsTarget]);

  const handleCloseComments = useCallback(() => {
    setCommentsTarget(null);
    setComments([]);
    setCommentsError(false);
    actionLockRef.current = false;
  }, []);

  const handleCancelTap = useCallback((record: TransferHistoryRecord) => {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    setCancelTarget(record);
  }, []);

  const handleCancelDismiss = useCallback(() => {
    if (!isCancelling) {
      setCancelTarget(null);
      actionLockRef.current = false;
    }
  }, [isCancelling]);

  const handleDateRangeApply = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setShowDatePicker(false);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Nav bar */}
      <nav className="bg-[#f5f5f5] border-b border-questrade-grey-200 px-3.5 py-2.5 flex items-center justify-between flex-shrink-0">
        <button type="button" onClick={onBack} className="p-1" aria-label="Go back">
          <svg className="h-5 w-5 text-questrade-grey-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="type-heading-lg text-questrade-grey-900">Transfer investments history</h2>
        <button type="button" onClick={onClose} className="p-1" aria-label="Close">
          <svg className="h-5 w-5 text-questrade-grey-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </nav>

      {/* Date range pill */}
      <div className="px-3.5 pt-3 pb-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => setShowDatePicker(true)}
          className="inline-flex items-center gap-1.5 border border-questrade-grey-300 rounded-full px-4 py-1.5 type-label-md text-questrade-grey-800 bg-white hover:bg-questrade-grey-50 transition-colors"
        >
          <span>{formatDateShort(startDate)} – {formatDateShort(endDate)}</span>
          <svg className="h-3.5 w-3.5 text-questrade-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-4">
        {isLoading && <SkeletonLoader rows={4} />}

        {!isLoading && hasError && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="type-body-lg text-questrade-grey-600 mb-4 max-w-[260px]">
              We couldn't load your transfer history. Check your connection and try again.
            </p>
            <Button size="sm" onClick={() => loadHistory(startDate, endDate)}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !hasError && records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <EmptyChartIcon />
            <p className="type-body-lg text-questrade-grey-500 mt-4 max-w-[260px]">
              You don't have any transfers for the selected time period
            </p>
          </div>
        )}

        {!isLoading && !hasError && records.length > 0 && (
          <div className="space-y-2.5">
            {records.map((record) => (
              <HistoryCard
                key={record.refId}
                record={record}
                onCancel={() => handleCancelTap(record)}
                onComments={() => handleOpenComments(record)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel confirmation bottom sheet */}
      <Modal isOpen={!!cancelTarget} onClose={handleCancelDismiss} variant="bottom-sheet">
        {cancelTarget && (
          <div className="px-5 py-5">
            <h3 className="type-display-sm text-questrade-grey-900 mb-2">
              Cancel this transfer?
            </h3>
            <p className="type-body-lg text-questrade-grey-500 mb-5">
              This will cancel the transfer of {cancelTarget.qty} {cancelTarget.qty === 1 ? 'unit' : 'units'} of{' '}
              <span className="font-semibold text-questrade-grey-700">{cancelTarget.symbol}</span> from{' '}
              {cancelTarget.fromAccount} to {cancelTarget.toAccount}.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelDismiss}
                disabled={isCancelling}
                className="flex-1 rounded-xl border border-questrade-grey-300 bg-white text-questrade-grey-700 type-label-lg min-h-[44px] px-4 whitespace-nowrap hover:bg-questrade-grey-50 transition-colors disabled:opacity-60"
              >
                Keep transfer
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={isCancelling}
                className="flex-1 rounded-xl bg-red-600 text-white type-label-lg min-h-[44px] px-4 whitespace-nowrap hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isCancelling ? 'Cancelling\u2026' : 'Cancel transfer'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Comments bottom sheet */}
      <Modal isOpen={!!commentsTarget} onClose={handleCloseComments} variant="bottom-sheet" maxHeight="90%">
        {commentsTarget && (
          <CommentsSheet
            record={commentsTarget}
            comments={comments}
            isLoading={isLoadingComments}
            hasError={commentsError}
            onRetry={handleRetryComments}
            onClose={handleCloseComments}
          />
        )}
      </Modal>

      {/* Date picker modal */}
      <Modal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)} variant="bottom-sheet">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onApply={handleDateRangeApply}
          onCancel={() => setShowDatePicker(false)}
        />
      </Modal>
    </div>
  );
}

/* ── Comments Bottom Sheet ─────────────────────────── */

function CommentsSheet({
  record,
  comments,
  isLoading,
  hasError,
  onRetry,
  onClose,
}: {
  record: TransferHistoryRecord;
  comments: TransferComment[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col" style={{ maxHeight: '90vh', minHeight: '60vh' }}>
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-questrade-grey-200 flex-shrink-0">
        <div>
          <h3 className="type-heading-lg text-questrade-grey-900">Comments</h3>
          <p className="type-body-sm text-questrade-grey-500 mt-0.5">
            {record.symbol} &middot; {record.refId}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 text-questrade-grey-400 hover:text-questrade-grey-700 transition-colors"
          aria-label="Close comments"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-questrade-grey-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-questrade-grey-200 rounded w-full mb-1" />
                <div className="h-3 bg-questrade-grey-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && hasError && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="type-body-lg text-questrade-grey-600 mb-4 max-w-[260px]">
              We couldn't load comments for this transfer. Please try again.
            </p>
            <Button size="sm" onClick={onRetry}>Retry</Button>
          </div>
        )}

        {!isLoading && !hasError && comments.length === 0 && (
          <div className="flex items-center justify-center py-10">
            <p className="type-body-lg text-questrade-grey-500">No comments for this transfer.</p>
          </div>
        )}

        {!isLoading && !hasError && comments.length > 0 && (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentCard key={comment.commentId} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Single Comment Card ───────────────────────────── */

function CommentCard({ comment }: { comment: TransferComment }) {
  return (
    <div className="bg-questrade-grey-50 border border-questrade-grey-200 rounded-xl px-4 py-3">
      {/* Header row */}
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <span className="type-heading-sm text-questrade-grey-900">{comment.agentName}</span>
        <span className="type-body-sm text-questrade-grey-400 whitespace-nowrap flex-shrink-0">
          {formatCommentTimestamp(comment.createdAt)}
        </span>
      </div>

      {/* Body */}
      <div className="type-body-lg text-questrade-grey-700 whitespace-pre-wrap break-words">
        {renderBodyWithLinks(comment.body)}
      </div>

      {/* Action required banner */}
      {comment.actionRequired && (
        <ActionRequiredBanner action={comment.actionRequired} />
      )}
    </div>
  );
}

/* ── Action Required Banner ────────────────────────── */

function ActionRequiredBanner({ action }: { action: NonNullable<TransferComment['actionRequired']> }) {
  if (action.isCompleted) {
    return (
      <div className="mt-3 border border-green-200 bg-green-50 rounded-lg px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <svg className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="type-label-md text-green-700">Completed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 border border-amber-200 bg-amber-50 rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-amber-600 flex-shrink-0" aria-hidden="true">&#9888;</span>
        <span className="type-label-md text-amber-700">Action required</span>
      </div>
      <p className="type-body-md text-questrade-grey-700">{action.description}</p>
      {action.deepLink && (
        <a
          href={action.deepLink}
          className="type-label-md text-questrade-green underline mt-1 inline-block"
        >
          Upload document
        </a>
      )}
    </div>
  );
}

/* ── History Card ──────────────────────────────────── */

function HistoryCard({
  record,
  onCancel,
  onComments,
}: {
  record: TransferHistoryRecord;
  onCancel: () => void;
  onComments: () => void;
}) {
  const hasAnyAction = record.hasComments || record.isCancellable;

  return (
    <div className="bg-white border border-questrade-grey-200 rounded-xl px-3.5 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="type-ticker text-questrade-grey-900 truncate">
              {record.symbol}
            </span>
            <span className={`type-label-sm px-2 py-px rounded-full whitespace-nowrap ${statusColors[record.status] || 'bg-questrade-grey-100 text-questrade-grey-600'}`}>
              {record.status}
            </span>
          </div>
          <p className="type-body-sm text-questrade-grey-500 mb-2">
            {record.refId} &middot; {formatDate(record.date)}
          </p>
          <div className="grid grid-cols-3 gap-1">
            <div>
              <span className="type-heading-sm text-questrade-grey-400">From</span>
              <p className="type-body-md text-questrade-grey-700">{record.fromAccount}</p>
            </div>
            <div>
              <span className="type-heading-sm text-questrade-grey-400">To</span>
              <p className="type-body-md text-questrade-grey-700">{record.toAccount}</p>
            </div>
            <div>
              <span className="type-heading-sm text-questrade-grey-400">Qty</span>
              <p className="type-body-md text-questrade-grey-700">{record.qty}</p>
            </div>
          </div>
        </div>

        {hasAnyAction && (
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0 mt-0.5">
            <div className="flex items-center gap-1">
              {record.hasComments && (
                <button
                  type="button"
                  onClick={onComments}
                  className="relative p-1.5 text-questrade-grey-400 hover:text-questrade-green transition-colors"
                  aria-label={`View comments for transfer ${record.refId}${record.unreadCommentCount > 0 ? ` (${record.unreadCommentCount} unread)` : ''}`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {record.unreadCommentCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-[7px] w-[7px] bg-red-500 rounded-full ring-2 ring-white" />
                  )}
                </button>
              )}
              {record.isCancellable && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="p-1.5 text-questrade-grey-400 hover:text-red-600 transition-colors"
                  aria-label={`Cancel transfer ${record.refId}`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" d="M8 16l8-8" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Date Range Picker ─────────────────────────────── */

function DateRangePicker({
  startDate,
  endDate,
  onApply,
  onCancel,
}: {
  startDate: string;
  endDate: string;
  onApply: (start: string, end: string) => void;
  onCancel: () => void;
}) {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  const presets = useMemo(() => {
    const now = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const daysAgo = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return fmt(d);
    };
    return [
      { label: 'Last 30 days', start: daysAgo(30), end: fmt(now) },
      { label: 'Last 90 days', start: daysAgo(90), end: fmt(now) },
      { label: 'Last 6 months', start: daysAgo(180), end: fmt(now) },
      { label: 'Last 1 year', start: daysAgo(365), end: fmt(now) },
    ];
  }, []);

  return (
    <div className="px-5 py-5">
      <h3 className="type-display-sm text-questrade-grey-900 mb-4">Select date range</h3>

      <div className="space-y-2 mb-4">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => { setLocalStart(p.start); setLocalEnd(p.end); }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl border type-body-md transition-colors ${
              localStart === p.start && localEnd === p.end
                ? 'border-questrade-green bg-green-50 text-questrade-green font-medium'
                : 'border-questrade-grey-200 text-questrade-grey-700 hover:bg-questrade-grey-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block type-body-sm text-questrade-grey-500 mb-1">Start</label>
          <input
            type="date"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            className="w-full border border-questrade-grey-300 rounded-xl px-3 py-2 type-input focus:border-questrade-green focus:ring-1 focus:ring-questrade-green focus:outline-none"
          />
        </div>
        <div>
          <label className="block type-body-sm text-questrade-grey-500 mb-1">End</label>
          <input
            type="date"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            className="w-full border border-questrade-grey-300 rounded-xl px-3 py-2 type-input focus:border-questrade-green focus:ring-1 focus:ring-questrade-green focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button fullWidth variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button fullWidth onClick={() => onApply(localStart, localEnd)}>Apply</Button>
      </div>
    </div>
  );
}

/* ── Empty Chart Icon ──────────────────────────────── */

function EmptyChartIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true" className="text-questrade-grey-300">
      <rect x="4" y="36" width="6" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="14" y="28" width="6" height="16" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="24" y="20" width="6" height="24" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="34" y="12" width="6" height="32" rx="1" fill="currentColor" opacity="0.3" />
      <path d="M6 32 L17 24 L27 28 L40 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <circle cx="40" cy="14" r="2.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
