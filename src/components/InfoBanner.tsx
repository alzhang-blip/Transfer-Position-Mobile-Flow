import type { ReactNode } from 'react';

type BannerVariant = 'yellow' | 'blue' | 'neutral';

interface InfoBannerProps {
  variant?: BannerVariant;
  children: ReactNode;
}

const variantClasses: Record<BannerVariant, string> = {
  yellow: 'bg-white border-questrade-grey-200 text-questrade-grey-700',
  blue: 'bg-white border-questrade-grey-200 text-questrade-grey-700',
  neutral: 'bg-white border-questrade-grey-200 text-questrade-grey-700',
};

export function InfoBanner({ variant = 'yellow', children }: InfoBannerProps) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-[13px] leading-relaxed ${variantClasses[variant]}`}
      role="note"
    >
      {children}
    </div>
  );
}
