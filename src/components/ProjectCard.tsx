import React, { useState, useEffect } from 'react';
import { Eye, Archive, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDate, getDaysRemaining } from '@/utils/format';
import type { Project } from '../../shared/types';
import StatusBadge from './StatusBadge';
import ProjectTypeBadge from './ProjectTypeBadge';

interface ProjectCardProps {
  project: Project;
  onView?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  showArchive?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onView, onArchive, showArchive = false }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  const endDate = project.endDate || project.license?.endDate;
  const daysRemaining = endDate ? getDaysRemaining(endDate) : null;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible && endDate) {
      const start = new Date(project.startDate).getTime();
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const total = end - start;
      const elapsed = now - start;
      const percent = Math.min(Math.max((elapsed / total) * 100, 0), 100);
      
      const progressTimer = setTimeout(() => setProgressWidth(percent), 200);
      return () => clearTimeout(progressTimer);
    }
  }, [isVisible, endDate, project.startDate]);

  const handleView = () => {
    if (onView) {
      onView(project);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(project);
    }
  };

  const getProgressColor = () => {
    if (daysRemaining === null) return 'from-ink-400 to-ink-500';
    if (daysRemaining > 30) return 'from-forest-400 to-forest-500';
    if (daysRemaining > 0) return 'from-gold-400 to-gold-500';
    return 'from-coral-400 to-coral-500';
  };

  return (
    <div
      className={cn(
        'card-hover overflow-hidden group cursor-pointer',
        'transform transition-all duration-500 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      onClick={handleView}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink-900 text-lg truncate group-hover:text-gold-600 transition-colors">
              {project.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <StatusBadge status={project.license?.status || 'active'} />
          </div>
        </div>

        <p className="text-sm text-ink-500 line-clamp-2 mb-4 min-h-[40px]">
          {project.description || '暂无描述'}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <ProjectTypeBadge type={project.type} />
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-500">有效期进度</span>
              {daysRemaining !== null && (
                <span
                  className={cn(
                    'font-medium',
                    daysRemaining > 30 && 'text-forest-600',
                    daysRemaining > 0 && daysRemaining <= 30 && 'text-gold-600',
                    daysRemaining <= 0 && 'text-coral-600'
                  )}
                >
                  {daysRemaining > 0 ? `剩余 ${daysRemaining} 天` : '已过期'}
                </span>
              )}
            </div>
            <div className="progress-bar">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r',
                  getProgressColor()
                )}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-ink-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {formatDate(project.startDate)}
              {endDate && ` ~ ${formatDate(endDate)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-ink-100 bg-ink-50/50">
        <span className="text-xs text-ink-400">
          创建于 {formatDate(project.createdAt)}
        </span>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost px-2.5 py-1.5 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            详情
          </button>
          {showArchive && !project.isArchived && (
            <button
              onClick={handleArchive}
              className="btn-outline px-2.5 py-1.5 text-xs border-ink-300 text-ink-600 hover:bg-ink-100"
            >
              <Archive className="w-3.5 h-3.5 mr-1" />
              归档
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
