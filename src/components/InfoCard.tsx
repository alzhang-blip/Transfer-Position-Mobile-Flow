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
      <h3 className="text-[14px] font-bold mb-1 leading-snug text-questrade-grey-900">
        {title}
      </h3>
      <div className="text-[14px] text-questrade-grey-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
