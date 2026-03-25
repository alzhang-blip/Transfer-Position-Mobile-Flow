import type { ReactNode } from 'react';

type CardVariant = 'warning' | 'info';

interface InfoCardProps {
  variant?: CardVariant;
  title: string;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  warning: 'bg-questrade-yellow-bg border-questrade-yellow-border',
  info: 'bg-questrade-info-bg border-questrade-info-border',
};

const titleClasses: Record<CardVariant, string> = {
  warning: 'text-yellow-900',
  info: 'text-questrade-grey-900',
};

export function InfoCard({ variant = 'info', title, children }: InfoCardProps) {
  return (
    <div
      className={`rounded-md border px-3 py-2.5 ${variantClasses[variant]}`}
      role="note"
    >
      <h3 className={`text-[11px] font-bold mb-1 leading-snug ${titleClasses[variant]}`}>
        {title}
      </h3>
      <div className="text-[11px] text-questrade-grey-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
