import { useCallback, useMemo, useState } from 'react';
import { useTransfer } from '../context/TransferContext';
import { Button } from '../components/Button';
import { InfoBanner } from '../components/InfoBanner';
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

  if (state.isLoadingPositions) {
    return <SkeletonLoader rows={5} />;
  }

  if (state.positionsError) {
    return (
      <ErrorState
        message="We couldn't load your positions. Check your connection and try again."
        onRetry={handleRetryPositions}
      />
    );
  }

  if (state.positions.length === 0) {
    return <EmptyState title="No positions to transfer" description="This account has no positions to transfer." />;
  }

  if (allFractionalOnly) {
    return (
      <EmptyState
        title="All positions are fractional"
        description="Contact support at 1-(888)-783-7866 to transfer fractional shares."
      />
    );
  }

  if (allFhsaRestricted) {
    return (
      <EmptyState
        title="No eligible positions"
        description="None of these positions can be transferred to an FHSA. Mutual funds are not eligible."
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1">
        {/* Positions header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[15px] font-semibold text-questrade-grey-900">Positions</span>
            <span className="text-[12px] text-questrade-grey-500 bg-questrade-grey-100 px-1.5 py-px rounded-full">
              {state.positions.length}
            </span>
            {selectedCount > 0 && (
              <span className="text-[12px] text-questrade-green bg-questrade-green-light px-1.5 py-px rounded-full font-medium">
                {selectedCount} selected
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleMaxAll}
            disabled={state.isLoadingPositions}
            className="text-[13px] font-medium text-questrade-green hover:underline disabled:opacity-50"
            aria-label="Max all units. Fills in maximum transferable units for all positions."
          >
            Max all units
          </button>
        </div>

        {hasFractionalShares && (
          <div className="mb-2">
            <InfoBanner variant="blue">
              <div className="flex items-start gap-1.5">
                <InfoIcon />
                <span>To transfer fractional shares, contact support at 1-(888)-783-7866.</span>
              </div>
            </InfoBanner>
          </div>
        )}

        {isFhsaDestination && fhsaDisabledSymbols.size > 0 && !allFhsaRestricted && (
          <div className="mb-2">
            <InfoBanner variant="yellow">
              Mutual fund positions are not eligible for transfer to an FHSA.
            </InfoBanner>
          </div>
        )}

        {state.positions.length > 10 && (
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search by ticker or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-questrade-grey-300 px-3 py-2 text-[14px] focus:border-questrade-green focus:ring-1 focus:ring-questrade-green focus:outline-none"
              aria-label="Search positions"
            />
          </div>
        )}

        <div className="position-list border border-questrade-grey-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto bg-white">
          {filteredPositions.length === 0 ? (
            <div className="py-6 text-center text-questrade-grey-400 text-[14px]">
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

      {/* Sticky footer */}
      <div className="sticky bottom-0 bg-[#f5f5f5] pt-2.5 pb-1.5 -mx-3.5 px-3.5 border-t border-questrade-grey-200">
        <Button fullWidth disabled={!canProceed} onClick={openReviewModal}>
          Next
        </Button>
        {!hasSelectedPositions && state.positions.length > 0 && !allFractionalOnly && !allFhsaRestricted && (
          <p className="text-[12px] text-questrade-grey-400 text-center mt-1.5">
            Enter units for at least one position to continue.
          </p>
        )}
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
