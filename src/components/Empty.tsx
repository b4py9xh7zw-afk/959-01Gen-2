import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export default function Empty({ icon, title, description, className }: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-8', className)}>
      {icon && <div className="mb-4">{icon}</div>}
      {title && <p className="text-lg font-medium text-ink-700 mb-2">{title}</p>}
      {description && <p className="text-sm text-ink-400">{description}</p>}
      {!icon && !title && !description && (
        <div className={cn('flex h-full items-center justify-center')}>Empty</div>
      )}
    </div>
  );
}
