import type { Account } from '../types';
import { InfoCard } from './InfoCard';

interface ContextualWarningsProps {
  fromAccount: Account | null;
  toAccount: Account | null;
}

export function ContextualWarnings({ fromAccount, toAccount }: ContextualWarningsProps) {
  const warnings: { key: string; title: string; content: string; variant: 'warning' | 'info' }[] = [];

  if (fromAccount?.accountType.includes('Margin')) {
    warnings.push({
      key: 'margin-interest',
      title: 'Interest charges:',
      content: 'If there are insufficient funds to cover the amount, a negative balance is subject to interest charges.',
      variant: 'warning',
    });
  }

  if (toAccount?.accountType.includes('FHSA')) {
    warnings.push({
      key: 'fhsa-rules',
      title: 'Transferring to a FHSA:',
      content:
        'Transfers to a FHSA from an RRSP are tax free and deducted from your FHSA contribution limit. They are not income deductible and do not reinstate RRSP contribution room. Mutual funds cannot be transferred into a FHSA.',
      variant: 'warning',
    });
  }

  if (fromAccount?.accountType.includes('TFSA')) {
    warnings.push({
      key: 'tfsa-withdrawal',
      title: 'Transferring from a TFSA:',
      content: 'Withdrawal amounts will be added to your contribution room at the beginning of the following year.',
      variant: 'warning',
    });
  }

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map(({ key, title, content, variant }) => (
        <InfoCard key={key} variant={variant} title={title}>
          {content}
        </InfoCard>
      ))}
    </div>
  );
}
