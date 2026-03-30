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
      className="info-education-cell px-4 py-4 shadow-none text-design-ink"
      role="note"
    >
      <h3 className="type-heading-md text-design-ink mb-1.5">
        {title}
      </h3>
      <div className="type-body-md text-design-ink leading-relaxed [&_a]:text-design-link">
        {children}
      </div>
    </div>
  );
}
