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
      className="rounded-2xl border border-design-border bg-white px-3.5 py-3 shadow-card"
      role="note"
    >
      <h3 className="type-heading-md text-design-ink mb-1">
        {title}
      </h3>
      <div className="type-body-md text-design-muted">
        {children}
      </div>
    </div>
  );
}
