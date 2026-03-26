import type { ReactNode } from 'react';

type BadgeVariant = 'green' | 'yellow' | 'purple' | 'grey';

interface BadgeProps {
  variant: BadgeVariant;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  green:
    'bg-emerald-50 text-emerald-900 border border-emerald-200/80',
  yellow: 'bg-questrade-yellow-bg text-yellow-800',
  purple: 'bg-questrade-purple-bg text-questrade-purple-text',
  grey: 'bg-design-close text-design-muted',
};

export function Badge({ variant, icon, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-px type-label-sm whitespace-nowrap ${variantClasses[variant]}`}
    >
      {icon}
      {children}
    </span>
  );
}
