import type { ReactNode } from 'react';

type BadgeVariant = 'green' | 'yellow' | 'purple' | 'grey';

interface BadgeProps {
  variant: BadgeVariant;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-questrade-green-light text-questrade-green',
  yellow: 'bg-questrade-yellow-bg text-yellow-800',
  purple: 'bg-questrade-purple-bg text-questrade-purple-text',
  grey: 'bg-questrade-grey-200 text-questrade-grey-600',
};

export function Badge({ variant, icon, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-px text-[10px] font-medium whitespace-nowrap leading-tight ${variantClasses[variant]}`}
    >
      {icon}
      {children}
    </span>
  );
}
