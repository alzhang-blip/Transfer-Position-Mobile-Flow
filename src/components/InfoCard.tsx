import type { ReactNode } from 'react';

type CardVariant = 'warning' | 'info';

interface InfoCardProps {
  variant?: CardVariant;
  title: string;
  children: ReactNode;
}

export function InfoCard({ variant: _variant = 'info', title, children }: InfoCardProps) {
  return (
    <div
      className="rounded-xl border border-questrade-grey-200 bg-white px-3 py-2.5"
      role="note"
    >
      <h3 className="type-heading-lg text-questrade-grey-900 mb-1">
        {title}
      </h3>
      <div className="type-body-lg text-questrade-grey-600">
        {children}
      </div>
    </div>
  );
}
