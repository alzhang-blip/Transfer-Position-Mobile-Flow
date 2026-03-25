import { useCallback, useMemo, useState } from 'react';
import { useTransfer } from '../context/TransferContext';
import { Button } from '../components/Button';
import { InfoBanner } from '../components/InfoBanner';
import { InfoCard } from '../components/InfoCard';
import { ContextualWarnings } from '../components/ContextualWarnings';
import { PositionRow } from '../components/PositionRow';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

export function PositionSelection() {
  const { state, setUnitEntry, setAllMaxUnits, openReviewModal, loadPositions, showToast } =
    useTransfer();
  const [searchQuery, setSearchQuery] = useState('');

  const isFhsaDestination = state.toAccount?.accountType.includes('FHSA') ?? false;

  const fhsaDisabledSymbols = useMemo(() => {
    if (!isFhsaDestination) return new Set<string>();
    return new Set(state.positions.filter((p) => p.isMutualFund).map((p) => p.symbol));
  }, [isFhsaDestination, state.positions]);

  const hasFractionalShares = state.positions.some((p) => p.isFractional);

  const allFractionalOnly = state.positions.length > 0 &&
    state.positions.every((p) => p.isFractional && p.availableUnits < 1);

  const allFhsaRestricted = isFhsaDestination &&
    state.positions.length > 0 &&
    state.positions.every((p) => p.isMutualFund);

  const filteredPositions = useMemo(() => {
    if (!searchQuery.trim()) return state.positions;
    const q = searchQuery.toLowerCase();
    return state.positions.filter(
      (p) =>
        p.symbol.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q),
    );
  }, [state.positions, searchQuery]);

  const hasSelectedPositions = useMemo(
    () => Object.values(state.unitEntries).some((u) => u > 0),
    [state.unitEntries],
  );

  const hasValidationErrors = useMemo(() => {
    return Object.entries(state.unitEntries).some(([symbol, units]) => {
      if (units <= 0) return false;
      const pos = state.positions.find((p) => p.symbol === symbol);
      if (!pos) return false;
      const isDisabled = !pos.isTransferable || fhsaDisabledSymbols.has(symbol);
      if (isDisabled) return false;
      return units > Math.floor(pos.availableUnits);
    });
  }, [state.unitEntries, state.positions, fhsaDisabledSymbols]);

  const canProceed = hasSelectedPositions && !hasValidationErrors && !state.isOffline;

  const handleUnitsChange = useCallback(
    (symbol: string, units: number) => setUnitEntry(symbol, units),
    [setUnitEntry],
  );

  const handleMaxAll = useCallback(() => {
    const editable = state.positions.filter(
      (p) => p.isTransferable && !fhsaDisabledSymbols.has(p.symbol) && Math.floor(p.availableUnits) > 0,
    );
    if (editable.length === 0) {
      showToast('No whole units available to transfer.', 'info');
      return;
    }
    setAllMaxUnits(fhsaDisabledSymbols);
  }, [state.positions, fhsaDisabledSymbols, setAllMaxUnits, showToast]);

  const selectedCount = useMemo(
    () => Object.values(state.unitEntries).filter((u) => u > 0).length,
    [state.unitEntries],
  );

  const handleRetryPositions = useCallback(() => {
    if (state.fromAccount) loadPositions(state.fromAccount.accountId);
  }, [state.fromAccount, loadPositions]);

  // ── Loading ──────────────────────────
  if (state.isLoadingPositions) {
    return (
      <div className="space-y-3">
        <ReadOnlyField label="From account" value={state.fromAccount?.displayName ?? ''} />
        <ReadOnlyField label="To account" value={state.toAccount?.displayName ?? ''} />
        <SkeletonLoader rows={4} />
      </div>
    );
  }

  // ── Error ────────────────────────────
  if (state.positionsError) {
    return (
      <div className="space-y-3">
        <ReadOnlyField label="From account" value={state.fromAccount?.displayName ?? ''} />
        <ReadOnlyField label="To account" value={state.toAccount?.displayName ?? ''} />
        <ErrorState
          message="We couldn't load your positions. Check your connection and try again."
          onRetry={handleRetryPositions}
        />
      </div>
    );
  }

  // ── Empty ────────────────────────────
  if (state.positions.length === 0) {
    return (
      <div className="space-y-3">
        <ReadOnlyField label="From account" value={state.fromAccount?.displayName ?? ''} />
        <ReadOnlyField label="To account" value={state.toAccount?.displayName ?? ''} />
        <EmptyState title="No positions to transfer" description="This account has no positions to transfer." />
      </div>
    );
  }

  // ── All fractional ───────────────────
  if (allFractionalOnly) {
    return (
      <div className="space-y-3">
        <ReadOnlyField label="From account" value={state.fromAccount?.displayName ?? ''} />
        <ReadOnlyField label="To account" value={state.toAccount?.displayName ?? ''} />
        <EmptyState
          title="All positions are fractional"
          description="Contact support at 1-(888)-783-7866 to transfer fractional shares."
        />
      </div>
    );
  }

  // ── All FHSA restricted ──────────────
  if (allFhsaRestricted) {
    return (
      <div className="space-y-3">
        <ReadOnlyField label="From account" value={state.fromAccount?.displayName ?? ''} />
        <ReadOnlyField label="To account" value={state.toAccount?.displayName ?? ''} />
        <EmptyState
          title="No eligible positions"
          description="None of these positions can be transferred to an FHSA. Mutual funds are not eligible."
        />
      </div>
    );
  }

  // ── Main ─────────────────────────────
  return (
    <div className="flex flex-col">
      <div className="space-y-3 flex-1">
        <ReadOnlyField label="From account" value={state.fromAccount?.displayName ?? ''} />
        <ReadOnlyField label="To account" value={state.toAccount?.displayName ?? ''} />

        {/* Positions section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[13px] font-semibold text-questrade-grey-900">Positions</span>
              <span className="text-[10px] text-questrade-grey-500 bg-questrade-grey-100 px-1.5 py-px rounded-full">
                {state.positions.length}
              </span>
              {selectedCount > 0 && (
                <span className="text-[10px] text-questrade-green bg-questrade-green-light px-1.5 py-px rounded-full font-medium">
                  {selectedCount} selected
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleMaxAll}
              disabled={state.isLoadingPositions}
              className="text-[11px] font-medium text-questrade-green hover:underline disabled:opacity-50"
              aria-label="Max all units. Fills in maximum transferable units for all positions."
            >
              Max all units
            </button>
          </div>

          {hasFractionalShares && (
            <InfoBanner variant="blue">
              <div className="flex items-start gap-1.5">
                <InfoIcon />
                <span>To transfer fractional shares, contact support at 1-(888)-783-7866.</span>
              </div>
            </InfoBanner>
          )}

          {isFhsaDestination && fhsaDisabledSymbols.size > 0 && !allFhsaRestricted && (
            <div className="mt-1.5">
              <InfoBanner variant="yellow">
                Mutual fund positions are not eligible for transfer to an FHSA.
              </InfoBanner>
            </div>
          )}

          {state.positions.length > 10 && (
            <div className="mt-2 mb-1.5">
              <input
                type="text"
                placeholder="Search by ticker or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-questrade-grey-300 px-3 py-2 text-[12px] focus:border-questrade-green focus:ring-1 focus:ring-questrade-green focus:outline-none"
                aria-label="Search positions"
              />
            </div>
          )}

          <div className="border border-questrade-grey-200 rounded-lg overflow-hidden mt-2 max-h-[280px] overflow-y-auto">
            {filteredPositions.length === 0 ? (
              <div className="py-6 text-center text-questrade-grey-400 text-[12px]">
                {searchQuery ? 'No positions match your search.' : 'No positions available.'}
              </div>
            ) : (
              filteredPositions.map((position) => (
                <PositionRow
                  key={position.symbol}
                  position={position}
                  units={state.unitEntries[position.symbol] ?? 0}
                  onUnitsChange={(units) => handleUnitsChange(position.symbol, units)}
                  isFhsaRestricted={fhsaDisabledSymbols.has(position.symbol)}
                />
              ))
            )}
          </div>
        </div>

        <ContextualWarnings fromAccount={state.fromAccount} toAccount={state.toAccount} />

        <InfoBanner>
          All positions will be valued and transferred based on the closing market price of the
          day the request is created.
        </InfoBanner>

        <InfoCard variant="info" title="Self-directed accounts only">
          You cannot directly transfer positions with a Questwealth account.{' '}
          <a href="#" className="text-questrade-green underline font-medium">
            Learn available ways to transfer with Questwealth accounts.
          </a>
        </InfoCard>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 bg-white pt-2.5 pb-1.5 -mx-3.5 px-3.5 border-t border-questrade-grey-100">
        <Button fullWidth disabled={!canProceed} onClick={openReviewModal}>
          Next
        </Button>
        {!hasSelectedPositions && state.positions.length > 0 && !allFractionalOnly && !allFhsaRestricted && (
          <p className="text-[10px] text-questrade-grey-400 text-center mt-1.5">
            Enter units for at least one position to continue.
          </p>
        )}
      </div>

      <div className="text-center pt-0.5 pb-1.5">
        <a href="#" className="text-[11px] text-questrade-green underline">
          View disclosure
        </a>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-questrade-grey-600 mb-1">{label}</label>
      <div className="w-full rounded-md border border-questrade-grey-200 bg-questrade-grey-50 px-3 py-2 text-[13px] text-questrade-grey-700">
        {value}
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg className="h-3.5 w-3.5 mt-px text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}
