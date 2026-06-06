import React from 'react';
import { Eye, Download, Award, Calendar, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '../utils/format';
import StatusBadge from './StatusBadge';
import ProjectTypeBadge from './ProjectTypeBadge';
import type { Certificate } from '@shared/types';

interface CertificateCardProps {
  certificate: Certificate;
  onView: (id: number) => void;
  onExport: (id: number) => void;
  isLast?: boolean;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onView,
  onExport,
  isLast = false,
}) => {
  const isExpired = certificate.license?.status === 'expired';

  return (
    <div className="relative flex gap-6">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-4 h-4 rounded-full border-4 z-10',
            isExpired
              ? 'bg-ink-300 border-ink-100'
              : 'bg-gold-500 border-gold-100 shadow-gold'
          )}
        />
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-gold-300 to-ink-200 mt-2" />
        )}
      </div>

      <div
        className={cn(
          'flex-1 bg-white rounded-2xl shadow-card border border-ink-100 overflow-hidden',
          'hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300',
          'mb-8'
        )}
      >
        <div
          className={cn(
            'h-2 bg-gradient-to-r',
            isExpired
              ? 'from-ink-400 to-ink-300'
              : 'from-gold-600 via-gold-400 to-gold-600'
          )}
        />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Hash className="w-4 h-4 text-gold-500" />
                <span className="font-mono text-sm font-semibold text-ink-600">
                  {certificate.certificateNumber}
                </span>
                <StatusBadge status={certificate.license?.status || 'active'} />
              </div>

              <h3 className="text-xl font-bold text-ink-800 mb-2">
                {certificate.project?.name || '未命名项目'}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <ProjectTypeBadge type={certificate.project?.type || 'website'} />
                <span className="text-ink-400 text-sm">
                  {certificate.font?.name}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-ink-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(certificate.validFrom)} -{' '}
                    {formatDate(certificate.validTo)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>授权证书</span>
                </div>
              </div>
            </div>

            <div
              className={cn(
                'w-24 h-32 rounded-xl flex-shrink-0 overflow-hidden',
                'border-2 relative',
                isExpired
                  ? 'border-ink-200 bg-ink-50'
                  : 'border-gold-300 bg-gradient-to-br from-gold-50 to-amber-100'
              )}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 5px,
                    rgba(212, 175, 55, 0.3) 5px,
                    rgba(212, 175, 55, 0.3) 10px
                  )`,
                }}
              />
              <div className="relative h-full flex flex-col items-center justify-center p-3">
                <Award
                  className={cn(
                    'w-8 h-8 mb-2',
                    isExpired ? 'text-ink-400' : 'text-gold-600'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-bold text-center leading-tight',
                    isExpired ? 'text-ink-400' : 'text-gold-700'
                  )}
                >
                  字体授权
                  <br />
                  证书
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-ink-100">
            <button
              onClick={() => onView(certificate.id)}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-ink-700 bg-ink-50 hover:bg-ink-100 flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              查看详情
            </button>
            <button
              onClick={() => onExport(certificate.id)}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-gold"
            >
              <Download className="w-4 h-4" />
              导出证书
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
