import type { ReactNode } from 'react';

type BannerVariant = 'yellow' | 'blue' | 'neutral';

interface InfoBannerProps {
  variant?: BannerVariant;
  children: ReactNode;
}

const variantClasses: Record<BannerVariant, string> = {
  yellow: 'bg-questrade-yellow-bg border-questrade-yellow-border text-yellow-900',
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  neutral: 'bg-questrade-grey-50 border-questrade-grey-200 text-questrade-grey-800',
};

export function InfoBanner({ variant = 'yellow', children }: InfoBannerProps) {
  return (
    <div
      className={`rounded-md border px-3 py-2 text-[11px] leading-relaxed ${variantClasses[variant]}`}
      role="note"
    >
      {children}
    </div>
  );
}
