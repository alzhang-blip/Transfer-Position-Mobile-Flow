import { useEffect, useMemo } from 'react';
import { useTransfer } from '../context/TransferContext';
import { Dropdown } from '../components/Dropdown';
import { InfoBanner } from '../components/InfoBanner';
import { InfoCard } from '../components/InfoCard';
import { ContextualWarnings } from '../components/ContextualWarnings';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';

export function AccountSelection() {
  const {
    state,
    accounts,
    loadAccounts,
    setFromAccount,
    setToAccount,
  } = useTransfer();

  useEffect(() => {
    if (accounts.length === 0 && !state.accountsError) {
      loadAccounts();
    }
  }, [accounts.length, state.accountsError, loadAccounts]);

  const selfDirectedAccounts = useMemo(
    () => accounts.filter((a) => a.isSelfDirected),
    [accounts],
  );

  const fromAccounts = useMemo(
    () => selfDirectedAccounts.filter((a) => a.eligibility === 'eligible' || a.eligibility === 'fx'),
    [selfDirectedAccounts],
  );

  if (state.isLoadingAccounts) {
    return (
      <div className="space-y-4">
        <DropdownSkeleton label="From account" />
        <DropdownSkeleton label="To account" />
        <div className="h-12 bg-questrade-grey-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (state.accountsError) {
    return (
      <ErrorState
        message="We couldn't load your accounts. Check your connection and try again."
        onRetry={loadAccounts}
      />
    );
  }

  if (accounts.length > 0 && selfDirectedAccounts.length === 0) {
    return (
      <EmptyState
        icon={<AccountIcon />}
        title="No self-directed accounts"
        description="You don't have any self-directed accounts. Open an account to get started."
        actionLabel="Open an account"
        onAction={() => {}}
      />
    );
  }

  if (accounts.length > 0 && fromAccounts.length === 0) {
    return (
      <EmptyState
        icon={<AccountIcon />}
        title="No eligible accounts"
        description="None of your accounts are currently eligible to initiate a position transfer."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Dropdown
        label="From account"
        placeholder="Choose an account"
        accounts={fromAccounts}
        selectedAccount={state.fromAccount}
        excludeAccountId={state.toAccount?.accountId}
        onSelect={setFromAccount}
        disabled={state.isOffline}
      />

      <Dropdown
        label="To account"
        placeholder="Choose an account"
        accounts={selfDirectedAccounts}
        selectedAccount={state.toAccount}
        excludeAccountId={state.fromAccount?.accountId}
        onSelect={setToAccount}
        disabled={state.isOffline || !state.fromAccount}
      />

      <InfoBanner>
        All positions will be valued and transferred based on the closing market price of the
        day the request is created.
      </InfoBanner>

      <ContextualWarnings fromAccount={state.fromAccount} toAccount={state.toAccount} />

      <InfoCard variant="info" title="Self-directed accounts only">
        You cannot directly transfer positions with a Questwealth account.{' '}
        <a href="#" className="text-questrade-green underline font-medium">
          Learn available ways to transfer with Questwealth accounts.
        </a>
      </InfoCard>

      <div className="text-center pt-2 pb-1">
<a href="#" className="text-[14px] text-questrade-green underline">
            View disclosure
        </a>
      </div>
    </div>
  );
}

function DropdownSkeleton({ label }: { label: string }) {
  return (
    <div className="animate-pulse">
      <p className="text-[14px] font-medium text-questrade-grey-600 mb-1">{label}</p>
      <div className="h-10 bg-questrade-grey-200 rounded-xl" />
    </div>
  );
}

function AccountIcon() {
  return (
    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
      />
    </svg>
  );
}
