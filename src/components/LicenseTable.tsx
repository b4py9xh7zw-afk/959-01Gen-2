import React, { useState, useMemo } from 'react';
import { Eye, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDate, getDaysRemaining } from '@/utils/format';
import type { License } from '../../shared/types';
import StatusBadge from './StatusBadge';
import ProjectTypeBadge from './ProjectTypeBadge';

interface LicenseTableProps {
  licenses: License[];
  onView?: (license: License) => void;
  onRenew?: (license: License) => void;
}

type SortField = 'fontName' | 'status' | 'startDate' | 'endDate' | 'usedProjects';
type SortOrder = 'asc' | 'desc';

const LicenseTable: React.FC<LicenseTableProps> = ({ licenses, onView, onRenew }) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('endDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedLicenses = useMemo(() => {
    const sorted = [...licenses].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'fontName':
          aValue = a.font?.name || '';
          bValue = b.font?.name || '';
          break;
        case 'status':
          const statusOrder = { active: 0, expiring: 1, expired: 2 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'endDate':
          aValue = new Date(a.endDate).getTime();
          bValue = new Date(b.endDate).getTime();
          break;
        case 'usedProjects':
          aValue = a.usedProjects / a.maxProjects;
          bValue = b.usedProjects / b.maxProjects;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    return sorted;
  }, [licenses, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-4 h-4 text-ink-300 opacity-50" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-gold-500" />
    ) : (
      <ChevronDown className="w-4 h-4 text-gold-500" />
    );
  };

  const handleView = (license: License) => {
    if (onView) {
      onView(license);
    } else {
      navigate(`/licenses/${license.id}`);
    }
  };

  const handleRenew = (license: License) => {
    if (onRenew) {
      onRenew(license);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50">
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('fontName')}
                className="flex items-center gap-1 text-xs font-semibold text-ink-600 uppercase tracking-wider hover:text-ink-900 transition-colors"
              >
                字体名称
                <SortIndicator field="fontName" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 text-xs font-semibold text-ink-600 uppercase tracking-wider hover:text-ink-900 transition-colors"
              >
                状态
                <SortIndicator field="status" />
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-ink-600 uppercase tracking-wider">
              可用项目类型
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('usedProjects')}
                className="flex items-center gap-1 text-xs font-semibold text-ink-600 uppercase tracking-wider hover:text-ink-900 transition-colors"
              >
                项目使用
                <SortIndicator field="usedProjects" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('startDate')}
                className="flex items-center gap-1 text-xs font-semibold text-ink-600 uppercase tracking-wider hover:text-ink-900 transition-colors"
              >
                有效期
                <SortIndicator field="startDate" />
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-ink-600 uppercase tracking-wider">
              剩余天数
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-ink-600 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {sortedLicenses.map((license) => {
            const daysRemaining = getDaysRemaining(license.endDate);
            const usagePercent = (license.usedProjects / license.maxProjects) * 100;

            return (
              <tr
                key={license.id}
                className={cn(
                  'transition-colors duration-150',
                  'hover:bg-ink-50 cursor-default'
                )}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {license.font?.coverImage && (
                      <img
                        src={license.font.coverImage}
                        alt={license.font.name}
                        className="w-12 h-12 rounded-lg object-cover border border-ink-200"
                      />
                    )}
                    <div>
                      <div className="font-medium text-ink-900">
                        {license.font?.name || '未知字体'}
                      </div>
                      {license.font?.previewText && (
                        <div
                          className="text-sm text-ink-500 font-serif truncate max-w-[120px]"
                          style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          {license.font.previewText}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={license.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {license.allowedProjectTypes.map((type) => (
                      <ProjectTypeBadge key={type} type={type} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="w-32">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-ink-600">{license.usedProjects}</span>
                      <span className="text-ink-400">/ {license.maxProjects}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-ink-700">
                    {formatDate(license.startDate)} ~ {formatDate(license.endDate)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      daysRemaining > 30 && 'text-forest-600',
                      daysRemaining > 0 && daysRemaining <= 30 && 'text-gold-600',
                      daysRemaining <= 0 && 'text-coral-600'
                    )}
                  >
                    {daysRemaining > 0 ? `${daysRemaining} 天` : '已过期'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleView(license)}
                      className="btn-ghost px-2.5 py-1.5 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      详情
                    </button>
                    {license.status !== 'expired' && (
                      <button
                        onClick={() => handleRenew(license)}
                        className="btn-outline px-2.5 py-1.5 text-xs border-gold-300 text-gold-600 hover:bg-gold-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        续期
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LicenseTable;
