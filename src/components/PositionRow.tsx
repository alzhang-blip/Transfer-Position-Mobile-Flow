import type { Position } from '../types';
import { Badge } from './Badge';
import { NumericInput } from './NumericInput';

interface PositionRowProps {
  position: Position;
  units: number;
  onUnitsChange: (units: number) => void;
  isFhsaRestricted?: boolean;
}

function WarningIcon() {
  return (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function getUnitsBadge(position: Position) {
  if (position.isFractional) {
    return (
      <Badge variant="yellow" icon={<WarningIcon />}>
        {position.availableUnits} units
      </Badge>
    );
  }
  if (position.availableUnits <= 5) {
    return (
      <Badge variant="purple">
        {position.availableUnits} {position.availableUnits === 1 ? 'unit' : 'units'}
      </Badge>
    );
  }
  return (
    <Badge variant="green">
      {position.availableUnits.toLocaleString()} units
    </Badge>
  );
}

export function PositionRow({ position, units, onUnitsChange, isFhsaRestricted = false }: PositionRowProps) {
  const isFractionalOnly = position.isFractional && position.availableUnits < 1;
  const isDisabled = !position.isTransferable || isFhsaRestricted;
  const maxTransferable = isDisabled ? 0 : Math.floor(position.availableUnits);

  let disabledReason: string | undefined;
  if (isFhsaRestricted) {
    disabledReason = 'Not eligible for FHSA';
  } else if (isFractionalOnly) {
    disabledReason = 'Contact support';
  }

  const accessibleDescription = isDisabled
    ? `${position.symbol}, ${position.companyName}, ${position.availableUnits} units available, not eligible for transfer`
    : `${position.symbol}, ${position.companyName}, ${position.availableUnits} units available`;

  return (
    <div
      className="flex items-center justify-between gap-2 py-2 px-3 border-b border-questrade-grey-100 last:border-b-0"
      role="group"
      aria-label={accessibleDescription}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-questrade-grey-900 text-[14px] leading-none">
            {position.symbol}
          </span>
          <span className="text-[12px] text-questrade-grey-400 truncate leading-none" title={position.companyName}>
            {position.companyName}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 flex-wrap">
          {getUnitsBadge(position)}
          {isFhsaRestricted && <Badge variant="grey">Not FHSA eligible</Badge>}
        </div>
      </div>
      <div className="flex-shrink-0">
        <NumericInput
          value={units}
          max={maxTransferable}
          onChange={onUnitsChange}
          disabled={isDisabled}
          disabledReason={disabledReason}
          ariaLabel={`Units to transfer for ${position.symbol}`}
        />
      </div>
    </div>
  );
}
