import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'gold' | 'coral' | 'forest' | 'ink';
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const colorMap = {
  gold: {
    bar: 'bg-gold-500',
    bg: 'bg-gold-50',
    text: 'text-gold-600',
    icon: 'text-gold-500',
  },
  coral: {
    bar: 'bg-coral-500',
    bg: 'bg-coral-50',
    text: 'text-coral-600',
    icon: 'text-coral-500',
  },
  forest: {
    bar: 'bg-forest-500',
    bg: 'bg-forest-50',
    text: 'text-forest-600',
    icon: 'text-forest-500',
  },
  ink: {
    bar: 'bg-ink-800',
    bg: 'bg-ink-50',
    text: 'text-ink-600',
    icon: 'text-ink-500',
  },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const colors = colorMap[color];

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
  };

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl shadow-card overflow-hidden',
        'transform transition-all duration-300 cursor-pointer',
        isHovered ? 'shadow-card-hover -translate-y-1' : ''
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn('h-1 w-full', colors.bar)} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-ink-500 mb-1">{title}</p>
            <p className={cn('text-3xl font-bold', colors.text)}>
              {formatNumber(displayValue)}
            </p>
          </div>
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              colors.bg,
              'transform transition-transform duration-500',
              isHovered ? 'scale-110 rotate-3' : ''
            )}
          >
            <div className={cn('transform transition-all duration-500', isHovered ? 'animate-pulse-slow' : '')}>
              {icon}
            </div>
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1">
            {trend.isUp ? (
              <TrendingUp className="w-4 h-4 text-forest-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-coral-500" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                trend.isUp ? 'text-forest-500' : 'text-coral-500'
              )}
            >
              {trend.value}%
            </span>
            <span className="text-ink-400 text-sm">较上月</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
