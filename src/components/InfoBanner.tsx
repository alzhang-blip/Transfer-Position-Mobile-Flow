import type { ReactNode } from 'react';

type BannerVariant = 'yellow' | 'blue' | 'neutral';

interface InfoBannerProps {
  variant?: BannerVariant;
  children: ReactNode;
}

const variantClasses: Record<BannerVariant, string> = {
  yellow: 'bg-white border-design-border text-design-ink',
  blue: 'bg-white border-design-border text-design-ink',
  neutral: 'bg-white border-design-border text-design-ink',
};

export function InfoBanner({ variant = 'yellow', children }: InfoBannerProps) {
  return (
    <div
      className={`rounded-2xl border px-3.5 py-3 type-body-md shadow-card ${variantClasses[variant]}`}
      role="note"
    >
      {children}
    </div>
  );
}
