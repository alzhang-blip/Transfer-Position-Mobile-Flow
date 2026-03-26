import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {icon && <div className="mb-3 text-design-muted">{icon}</div>}
      <h3 className="type-heading-md text-design-ink mb-1">{title}</h3>
      <p className="type-body-md text-design-muted leading-relaxed mb-4 max-w-[240px]">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
