import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Search, Download, Calendar, Clock, AlertTriangle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDate, getDaysRemaining } from '../utils/format';
import { downloads } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ProjectTypeBadge from '../components/ProjectTypeBadge';
import DownloadModal from '../components/DownloadModal';
import Empty from '../components/Empty';
import type { DownloadableFont, ProjectType } from '@shared/types';
import { PROJECT_TYPE_LABELS, FONT_WEIGHT_LABELS } from '@shared/types';

const DownloadCenter: React.FC = () => {
  const navigate = useNavigate();
  const [fonts, setFonts] = useState<DownloadableFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    fontId: number;
    fontName: string;
    weights: number[];
  }>({
    isOpen: false,
    fontId: 0,
    fontName: '',
    weights: [],
  });

  const loadFonts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await downloads.getDownloadableFonts();
      setFonts(data);
    } catch (error) {
      console.error('Load fonts error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  const filteredFonts = useMemo(() => {
    return fonts.filter((font) => {
      const matchesSearch = font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        font.family.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || font.availableScenes.includes(selectedType);
      return matchesSearch && matchesType;
    });
  }, [fonts, searchQuery, selectedType]);

  const handleOpenModal = (font: DownloadableFont) => {
    if (font.license.status === 'expired') return;
    setModalState({
      isOpen: true,
      fontId: font.id,
      fontName: font.name,
      weights: font.weights,
    });
  };

  const handleDownload = async (projectId: number, weight: number) => {
    try {
      const blob = await downloads.downloadFont(modalState.fontId, {
        projectId,
        weight,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modalState.fontName}-${weight}.ttf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleViewDetail = (fontId: number) => {
    navigate(`/fonts/${fontId}`);
  };

  const projectTypes: { value: ProjectType | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'website', label: PROJECT_TYPE_LABELS.website },
    { value: 'app', label: PROJECT_TYPE_LABELS.app },
    { value: 'packaging', label: PROJECT_TYPE_LABELS.packaging },
    { value: 'advertising', label: PROJECT_TYPE_LABELS.advertising },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-800 mb-2">字体下载中心</h1>
        <p className="text-ink-500">浏览并下载您已授权的字体文件</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              placeholder="搜索字体名称或字体系列..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-ink-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 outline-none transition-all duration-200 text-ink-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-ink-400" />
            <div className="flex flex-wrap gap-2">
              {projectTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    selectedType === type.value
                      ? 'bg-gold-500 text-white shadow-gold'
                      : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filteredFonts.length === 0 ? (
        <Empty title="暂无可用字体" description="您还没有可下载的字体授权" />
      ) : (
        <div className="space-y-6">
          {filteredFonts.map((font, index) => {
            const isExpired = font.license.status === 'expired';
            const daysRemaining = getDaysRemaining(font.endDate);

            return (
              <div
                key={font.id}
                className={cn(
                  'bg-white rounded-2xl shadow-card border border-ink-100 overflow-hidden',
                  'hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300',
                  'animate-fade-in-up',
                  isExpired && 'opacity-70',
                  { animationDelay: `${index * 100}ms` }
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row">
                  <div
                    className={cn(
                      'w-full md:w-48 h-48 md:h-auto flex-shrink-0 flex items-center justify-center p-6',
                      isExpired
                        ? 'bg-gradient-to-br from-ink-100 to-ink-200'
                        : 'bg-gradient-to-br from-ink-800 to-ink-900'
                    )}
                  >
                    <div
                      className={cn(
                        'text-center',
                        isExpired ? 'text-ink-500' : 'text-white'
                      )}
                    >
                      <p
                        className="text-3xl font-bold mb-2"
                        style={{ fontFamily: font.family }}
                      >
                        Aa
                      </p>
                      <p className="text-xs opacity-70">{font.family}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className="text-xl font-bold text-ink-800 cursor-pointer hover:text-gold-600 transition-colors"
                            onClick={() => handleViewDetail(font.id)}
                          >
                            {font.name}
                          </h3>
                          <StatusBadge status={font.license.status} />
                        </div>

                        <p className="text-ink-500 text-sm mb-4">
                          设计师: {font.designer}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {font.availableScenes.map((scene) => (
                            <ProjectTypeBadge key={scene} type={scene} />
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-ink-500">
                            <Calendar className="w-4 h-4" />
                            <span>到期日: {formatDate(font.endDate)}</span>
                          </div>
                          <div
                            className={cn(
                              'flex items-center gap-2',
                              isExpired
                                ? 'text-ink-400'
                                : daysRemaining <= 30
                                ? 'text-coral-500'
                                : 'text-forest-600'
                            )}
                          >
                            <Clock className="w-4 h-4" />
                            <span>
                              {isExpired
                                ? '已过期'
                                : `剩余 ${daysRemaining} 天`}
                            </span>
                          </div>
                        </div>

                        {isExpired && (
                          <div className="mt-4 flex items-center gap-2 text-ink-400 text-sm bg-ink-50 rounded-lg p-3">
                            <AlertTriangle className="w-4 h-4" />
                            <span>仅历史项目可用</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        <p className="text-sm font-medium text-ink-600 mb-1">
                          下载字重:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {font.weights.map((weight) => (
                            <button
                              key={weight}
                              onClick={() => {
                                if (!isExpired) {
                                  setModalState({
                                    isOpen: true,
                                    fontId: font.id,
                                    fontName: font.name,
                                    weights: [weight],
                                  });
                                }
                              }}
                              disabled={isExpired}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                                isExpired
                                  ? 'bg-ink-100 text-ink-400 cursor-not-allowed'
                                  : 'bg-ink-50 text-ink-700 hover:bg-gold-500 hover:text-white'
                              )}
                            >
                              <Download className="w-4 h-4" />
                              {FONT_WEIGHT_LABELS[weight] || weight}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => handleOpenModal(font)}
                          disabled={isExpired}
                          className={cn(
                            'mt-2 px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200',
                            isExpired
                              ? 'bg-ink-200 text-ink-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 shadow-lg hover:shadow-gold'
                          )}
                        >
                          <Download className="w-5 h-5" />
                          全部下载
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DownloadModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        fontId={modalState.fontId}
        fontName={modalState.fontName}
        weights={modalState.weights}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default DownloadCenter;
