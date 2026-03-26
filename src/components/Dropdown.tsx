import { useCallback, useEffect, useRef, useState } from 'react';
import type { Account, AccountEligibility } from '../types';
import { Badge } from './Badge';

interface DropdownProps {
  label: string;
  placeholder: string;
  accounts: Account[];
  selectedAccount: Account | null;
  excludeAccountId?: string;
  onSelect: (account: Account) => void;
  disabled?: boolean;
  helperText?: string;
}

const eligibilityBadge: Record<AccountEligibility, { label: string; selectable: boolean } | null> = {
  eligible: null,
  not_eligible: { label: 'Not eligible', selectable: false },
  pending_approval: { label: 'Pending approval', selectable: false },
  fx: { label: 'FX', selectable: true },
};

export function Dropdown({
  label,
  placeholder,
  accounts,
  selectedAccount,
  excludeAccountId,
  onSelect,
  disabled = false,
  helperText,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    if (!disabled) setIsOpen((prev) => !prev);
  }, [disabled]);

  const handleSelect = useCallback(
    (account: Account) => {
      const badgeInfo = eligibilityBadge[account.eligibility];
      if (badgeInfo && !badgeInfo.selectable) return;
      onSelect(account);
      setIsOpen(false);
    },
    [onSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, account?: Account) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (account) handleSelect(account);
        else toggle();
      }
      if (e.key === 'Escape') setIsOpen(false);
    },
    [handleSelect, toggle],
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAccounts = excludeAccountId
    ? accounts.filter((a) => a.accountId !== excludeAccountId)
    : accounts;

  const allDisabled = filteredAccounts.length > 0 &&
    filteredAccounts.every((a) => {
      const badge = eligibilityBadge[a.eligibility];
      return badge && !badge.selectable;
    });

  const isEmpty = filteredAccounts.length === 0;

  return (
    <div ref={containerRef} className="relative">
      <label className="block type-heading-md text-questrade-grey-600 mb-1">
        {label}
      </label>
      <button
        type="button"
        className={`w-full flex items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-left type-input transition-colors
          ${isOpen ? 'border-questrade-green ring-1 ring-questrade-green' : 'border-questrade-grey-300'}
          ${disabled ? 'bg-questrade-grey-100 cursor-not-allowed opacity-60' : 'hover:border-questrade-grey-400 cursor-pointer'}
        `}
        onClick={toggle}
        onKeyDown={(e) => handleKeyDown(e)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className={`truncate ${selectedAccount ? 'text-questrade-grey-900' : 'text-questrade-grey-400'}`}>
          {selectedAccount
            ? selectedAccount.displayName
            : isEmpty
              ? 'No eligible destination accounts'
              : placeholder}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {(allDisabled || helperText) && (
        <p className="type-body-sm text-questrade-grey-500 mt-1">
          {helperText ?? 'None of your accounts are currently eligible to receive this transfer.'}
        </p>
      )}

      {isOpen && !isEmpty && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-questrade-grey-200 bg-white shadow-lg"
        >
          {filteredAccounts.map((account) => {
            const badgeInfo = eligibilityBadge[account.eligibility];
            const isItemDisabled = !!badgeInfo && !badgeInfo.selectable;

            return (
              <li
                key={account.accountId}
                role="option"
                aria-selected={selectedAccount?.accountId === account.accountId}
                aria-disabled={isItemDisabled}
                tabIndex={isItemDisabled ? -1 : 0}
                className={`flex items-center justify-between px-3 py-2.5 type-body-md transition-colors
                  ${isItemDisabled ? 'text-questrade-grey-400 cursor-not-allowed' : 'text-questrade-grey-900 cursor-pointer hover:bg-questrade-grey-50'}
                  ${selectedAccount?.accountId === account.accountId ? 'bg-questrade-green-light' : ''}
                `}
                onClick={() => !isItemDisabled && handleSelect(account)}
                onKeyDown={(e) => !isItemDisabled && handleKeyDown(e, account)}
              >
                <span className="truncate mr-2">{account.displayName}</span>
                {badgeInfo && <Badge variant="grey">{badgeInfo.label}</Badge>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-questrade-grey-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
