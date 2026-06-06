import React from 'react';
import { cn } from '@/lib/utils';
import { LICENSE_STATUS_LABELS } from '../../shared/types';

interface StatusBadgeProps {
  status: 'active' | 'expiring' | 'expired' | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string): string => {
    const labels = LICENSE_STATUS_LABELS as Record<string, string>;
    return labels[status] || status;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusStyles(status)
      )}
    >
      {getStatusText(status)}
    </span>
  );
};

export default StatusBadge;
