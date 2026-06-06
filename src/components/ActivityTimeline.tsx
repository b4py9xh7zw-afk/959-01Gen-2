import React from 'react';
import { ShoppingCart, Download, FolderPlus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '../utils/format';
import type { ActivityItem } from '@shared/types';

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

const iconMap = {
  purchase: ShoppingCart,
  download: Download,
  project_create: FolderPlus,
  license_expire: Clock,
};

const colorMap = {
  purchase: 'bg-gold-500',
  download: 'bg-forest-500',
  project_create: 'bg-ink-500',
  license_expire: 'bg-coral-500',
};

const bgColorMap = {
  purchase: 'bg-gold-50',
  download: 'bg-forest-50',
  project_create: 'bg-ink-50',
  license_expire: 'bg-coral-50',
};

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-ink-400">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>暂无活动记录</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-ink-200" />
      <div className="space-y-6">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className={cn(
                'relative flex items-start gap-4 pl-14 animate-fade-in-up'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={cn(
                  'absolute left-4 w-5 h-5 rounded-full border-4 border-white shadow-md',
                  colorMap[activity.type],
                  'transform -translate-x-1/2 z-10'
                )}
              />
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                  bgColorMap[activity.type]
                )}
              >
                <Icon className={cn('w-5 h-5', colorMap[activity.type].replace('bg-', 'text-'))} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900">
                  {activity.description}
                </p>
                <p className="text-xs text-ink-400 mt-1">
                  {formatDate(activity.timestamp, 'YYYY-MM-DD HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTimeline;
