import React, { useEffect, useState, useCallback } from 'react';
import {
  useParams,
  useNavigate,
} from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  ZoomIn,
  ZoomOut,
  Globe,
  Smartphone,
  Package,
  Megaphone,
  Calendar,
  Clock,
  AlertTriangle,
  User,
  Languages,
  Palette,
  Type,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, getDaysRemaining } from '../utils/format';
import { downloads, projects } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DownloadModal from '../components/DownloadModal';
import Empty from '../components/Empty';
import type {
  FontDetail,
  Project,
  ProjectType,
  DownloadRecord,
} from '@shared/types';
import {
  FONT_WEIGHT_LABELS,
  FONT_STYLE_LABELS,
  PROJECT_TYPE_LABELS,
} from '@shared/types';

const iconMap: Record<ProjectType, React.ElementType> = {
  website: Globe,
  app: Smartphone,
  packaging: Package,
  advertising: Megaphone,
};

const FontPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [font, setFont] = useState<FontDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewText, setPreviewText] = useState(
    'The quick brown fox jumps over the lazy dog'
  );
  const [selectedWeight, setSelectedWeight] = useState<number>(400);
  const [fontSize, setFontSize] = useState(72);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [downloadRecords, setDownloadRecords] = useState<DownloadRecord[]>([]);
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

  const loadFontDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await downloads.getFontDetail(Number(id));
      setFont(data);
      if (data.weights.length > 0) {
        setSelectedWeight(data.weights[0]);
      }
    } catch (error) {
      console.error('Load font detail error:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadProjects = useCallback(async () => {
    try {
      const response = await projects.getProjects({ pageSize: 100 });
      setProjectList(response.data);
    } catch (error) {
      console.error('Load projects error:', error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadFontDetail();
      loadProjects();
    }
  }, [id, loadFontDetail, loadProjects]);

  const handleZoomIn = () => {
    setFontSize((prev) => Math.min(prev + 16, 200));
  };

  const handleZoomOut = () => {
    setFontSize((prev) => Math.max(prev - 16, 24));
  };

  const handleDownload = async (projectId: number, weight: number) => {
    try {
      const blob = await downloads.downloadFont(Number(id), {
        projectId,
        weight,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${font?.name || 'font'}-${weight}.ttf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setDownloadRecords((prev) => [
        {
          id: Date.now(),
          fontName: font?.name || '',
          weight,
          projectName:
            projectList.find((p) => p.id === projectId)?.name || '',
          downloadedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDirectDownload = () => {
    if (!selectedProjectId || !font) return;
    handleDownload(selectedProjectId, selectedWeight);
  };

  const handleOpenModal = () => {
    if (!font || font.license?.status === 'expired') return;
    setModalState({
      isOpen: true,
      fontId: font.id,
      fontName: font.name,
      weights: font.weights,
    });
  };

  const generateCharacters = () => {
    const chars = [];
    for (let i = 33; i <= 126; i++) {
      chars.push(String.fromCharCode(i));
    }
    return chars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!font) {
    return <Empty title="字体不存在" description="请检查链接是否正确" />;
  }

  const isExpired = font.license?.status === 'expired';
  const daysRemaining = font.endDate ? getDaysRemaining(font.endDate) : 0;

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-ink-500 hover:text-gold-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        返回下载中心
      </button>

      <div className="bg-gradient-to-br from-ink-800 via-ink-900 to-ink-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.5) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-white">{font.name}</h1>
                {font.license && (
                  <StatusBadge status={font.license.status} />
                )}
              </div>
              <p className="text-ink-300 text-lg">{font.family}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-ink-400 text-sm">有效期</p>
                <p className="text-white font-medium">
                  {font.endDate ? formatDate(font.endDate) : '永久'}
                </p>
              </div>
              <div
                className={cn(
                  'px-4 py-2 rounded-xl',
                  isExpired
                    ? 'bg-ink-700 text-ink-400'
                    : daysRemaining <= 30
                    ? 'bg-coral-500/20 text-coral-300'
                    : 'bg-gold-500/20 text-gold-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {isExpired ? '已过期' : `剩余 ${daysRemaining} 天`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="flex-1 mr-4 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-ink-400 focus:outline-none focus:border-gold-500 transition-colors"
                placeholder="输入预览文本..."
              />
              <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded-md hover:bg-white/10 text-white transition-colors"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-sm font-medium w-16 text-center">
                  {fontSize}px
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded-md hover:bg-white/10 text-white transition-colors"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              className="text-white text-center py-8 overflow-x-auto"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: font.family,
                fontWeight: selectedWeight,
                lineHeight: 1.4,
                minHeight: `${fontSize * 2}px`,
              }}
            >
              {previewText || '请输入预览文本'}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-ink-400 text-sm mr-2 self-center">
              字重:
            </span>
            {font.weights.map((weight) => (
              <button
                key={weight}
                onClick={() => setSelectedWeight(weight)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  selectedWeight === weight
                    ? 'bg-gold-500 text-white shadow-gold'
                    : 'bg-white/10 text-ink-300 hover:bg-white/20'
                )}
              >
                {FONT_WEIGHT_LABELS[weight] || weight}
              </button>
            ))}
          </div>

          {isExpired && (
            <div className="flex items-center gap-2 text-ink-400 bg-white/5 rounded-lg p-4 mb-6">
              <AlertTriangle className="w-5 h-5" />
              <span>该授权已过期，仅历史项目可用</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={selectedProjectId || ''}
                onChange={(e) =>
                  setSelectedProjectId(Number(e.target.value) || null)
                }
                className={cn(
                  'w-full px-4 py-3 rounded-xl border-2 text-ink-800',
                  'focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500',
                  'transition-all duration-200',
                  selectedProjectId
                    ? 'border-gold-500 bg-gold-50'
                    : 'border-white/20 bg-white/10 text-white placeholder-ink-400'
                )}
                disabled={isExpired}
              >
                <option value="">选择关联项目</option>
                {projectList.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({PROJECT_TYPE_LABELS[project.type]})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDirectDownload}
              disabled={isExpired || !selectedProjectId}
              className={cn(
                'px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200',
                isExpired || !selectedProjectId
                  ? 'bg-ink-600 text-ink-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 shadow-lg hover:shadow-gold'
              )}
            >
              <Download className="w-5 h-5" />
              下载 {FONT_WEIGHT_LABELS[selectedWeight] || selectedWeight}
            </button>
            <button
              onClick={handleOpenModal}
              disabled={isExpired}
              className={cn(
                'px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 border-2',
                isExpired
                  ? 'border-ink-600 text-ink-400 cursor-not-allowed'
                  : 'border-gold-500 text-gold-400 hover:bg-gold-500/10'
              )}
            >
              批量下载
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6">
            <h2 className="text-xl font-bold text-ink-800 mb-4">字体信息</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gold-50 rounded-lg">
                  <User className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <p className="text-sm text-ink-500">设计师</p>
                  <p className="font-medium text-ink-800">{font.designer}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gold-50 rounded-lg">
                  <Languages className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <p className="text-sm text-ink-500">支持语言</p>
                  <p className="font-medium text-ink-800">
                    {font.languages.join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gold-50 rounded-lg">
                  <Palette className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <p className="text-sm text-ink-500">风格</p>
                  <p className="font-medium text-ink-800">
                    {FONT_STYLE_LABELS[font.style] || font.style}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gold-50 rounded-lg">
                  <Type className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <p className="text-sm text-ink-500">字重数量</p>
                  <p className="font-medium text-ink-800">
                    {font.weights.length} 种
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6">
            <h2 className="text-xl font-bold text-ink-800 mb-4">可用场景</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {font.availableScenes?.map((scene) => {
                const Icon = iconMap[scene];
                return (
                  <div
                    key={scene}
                    className="flex flex-col items-center p-4 bg-ink-50 rounded-xl hover:bg-gold-50 transition-colors"
                  >
                    <Icon className="w-8 h-8 text-gold-600 mb-2" />
                    <span className="text-sm font-medium text-ink-700">
                      {PROJECT_TYPE_LABELS[scene]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6">
            <h2 className="text-xl font-bold text-ink-800 mb-4">字符集</h2>
            <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 gap-2">
              {generateCharacters().map((char, index) => (
                <div
                  key={index}
                  className="aspect-square flex items-center justify-center bg-ink-50 rounded-lg text-ink-700 hover:bg-gold-100 hover:text-gold-700 transition-colors cursor-default"
                  style={{
                    fontFamily: font.family,
                    fontWeight: selectedWeight,
                  }}
                >
                  {char}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gold-600" />
              <h2 className="text-xl font-bold text-ink-800">有效期</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-ink-500">开始日期</span>
                <span className="font-medium text-ink-800">
                  {font.license?.startDate
                    ? formatDate(font.license.startDate)
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">到期日期</span>
                <span className="font-medium text-ink-800">
                  {font.endDate ? formatDate(font.endDate) : '-'}
                </span>
              </div>
              <div className="pt-3 border-t border-ink-100">
                <div className="flex justify-between mb-2">
                  <span className="text-ink-500">剩余天数</span>
                  <span
                    className={cn(
                      'font-bold',
                      isExpired
                        ? 'text-ink-400'
                        : daysRemaining <= 30
                        ? 'text-coral-500'
                        : 'text-forest-600'
                    )}
                  >
                    {isExpired ? '已过期' : `${daysRemaining} 天`}
                  </span>
                </div>
                <div className="w-full bg-ink-100 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-500',
                      isExpired
                        ? 'bg-ink-300'
                        : daysRemaining <= 30
                        ? 'bg-coral-500'
                        : 'bg-gold-500'
                    )}
                    style={{
                      width: isExpired
                        ? '100%'
                        : `${Math.max(10, (daysRemaining / 365) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gold-600" />
              <h2 className="text-xl font-bold text-ink-800">下载记录</h2>
            </div>
            {downloadRecords.length === 0 ? (
              <p className="text-ink-400 text-sm text-center py-8">
                暂无下载记录
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {downloadRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 bg-ink-50 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-ink-800">
                        {record.fontName}
                      </span>
                      <span className="text-xs text-ink-400">
                        {FONT_WEIGHT_LABELS[record.weight] || record.weight}
                      </span>
                    </div>
                    <p className="text-sm text-ink-500">
                      {record.projectName}
                    </p>
                    <p className="text-xs text-ink-400 mt-1">
                      {formatDate(record.downloadedAt, 'YYYY-MM-DD HH:mm')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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

export default FontPreview;
