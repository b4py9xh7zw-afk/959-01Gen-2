import React from 'react';
import { Globe, Smartphone, Package, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectType } from '../../shared/types';
import { PROJECT_TYPE_LABELS } from '../../shared/types';

interface ProjectTypeBadgeProps {
  type: ProjectType;
}

const iconMap: Record<ProjectType, React.ElementType> = {
  website: Globe,
  app: Smartphone,
  packaging: Package,
  advertising: Megaphone,
};

const colorMap: Record<ProjectType, string> = {
  website: 'bg-blue-100 text-blue-800 border-blue-200',
  app: 'bg-purple-100 text-purple-800 border-purple-200',
  packaging: 'bg-orange-100 text-orange-800 border-orange-200',
  advertising: 'bg-pink-100 text-pink-800 border-pink-200',
};

const ProjectTypeBadge: React.FC<ProjectTypeBadgeProps> = ({ type }) => {
  const Icon = iconMap[type];
  const colorClass = colorMap[type];
  const label = PROJECT_TYPE_LABELS[type];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorClass
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};

export default ProjectTypeBadge;
