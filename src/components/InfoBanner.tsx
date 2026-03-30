import type { ReactNode } from 'react';

type BannerVariant = 'yellow' | 'blue' | 'neutral';

interface InfoBannerProps {
  variant?: BannerVariant;
  children: ReactNode;
}

/** Variant preserved for call sites; all use the same pale blue informational cell. */
export function InfoBanner({ variant: _variant = 'yellow', children }: InfoBannerProps) {
  return (
    <div
      className="info-education-cell px-4 py-4 type-body-md text-design-ink leading-relaxed shadow-none [&_a]:text-design-link"
      role="note"
    >
      {children}
    </div>
  );
}
