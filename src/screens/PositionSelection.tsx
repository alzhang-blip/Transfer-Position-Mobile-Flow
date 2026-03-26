import { useCallback, useMemo, useState } from 'react';
import { useTransfer } from '../context/TransferContext';
import { InfoBanner } from '../components/InfoBanner';
import { PositionRow } from '../components/PositionRow';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

export function PositionSelection() {
  const { state, setUnitEntry, setAllMaxUnits, clearAllUnits, loadPositions, showToast } =
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
            <span className="type-heading-md text-questrade-grey-900">Positions</span>
            <span className="type-label-sm text-questrade-grey-500 bg-questrade-grey-100 px-1.5 py-px rounded-full">
              {state.positions.length}
            </span>
            {selectedCount > 0 && (
              <span className="type-label-sm text-questrade-green bg-questrade-green-light px-1.5 py-px rounded-full">
                {selectedCount} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={clearAllUnits}
                className="type-label-md text-questrade-grey-500 hover:underline"
                aria-label="Clear all entered units"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleMaxAll}
              disabled={state.isLoadingPositions}
              className="type-label-md text-questrade-green hover:underline disabled:opacity-50"
              aria-label="Max all units. Fills in maximum transferable units for all positions."
            >
              Max all units
            </button>
          </div>
        </div>

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
              className="w-full rounded-xl border border-questrade-grey-300 px-3 py-2 type-input focus:border-questrade-green focus:ring-1 focus:ring-questrade-green focus:outline-none"
              aria-label="Search positions"
            />
          </div>
        )}

        <div className="position-list border border-questrade-grey-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto bg-white">
          {filteredPositions.length === 0 ? (
            <div className="py-6 text-center text-questrade-grey-400 type-body-lg">
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

        {hasFractionalShares && (
          <div className="mt-3">
            <InfoBanner variant="blue">
              <p>To transfer fractional shares, contact support.</p>
              <p className="mt-1">
                <a href="tel:18887837866" className="text-questrade-green font-medium underline">
                  1-(888)-783-7866
                </a>
              </p>
            </InfoBanner>
          </div>
        )}
      </div>

      <div className="text-center pt-3 pb-1">
        <a href="#" className="type-body-sm text-questrade-green underline">
          View disclosure
        </a>
      </div>
    </div>
  );
}

