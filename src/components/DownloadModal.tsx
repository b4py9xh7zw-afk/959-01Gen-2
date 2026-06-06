import React, { useEffect, useState } from 'react';
import { X, Download, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FONT_WEIGHT_LABELS, PROJECT_TYPE_LABELS, type Project } from '@shared/types';
import { projects } from '../services/api';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontId: number;
  fontName: string;
  weights: number[];
  onDownload: (projectId: number, weight: number) => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  fontId,
  fontName,
  weights,
  onDownload,
}) => {
  const [selectedWeights, setSelectedWeights] = useState<number[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadProjects();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, fontId]);

  useEffect(() => {
    if (isOpen) {
      setSelectedWeights([]);
      setSelectedProjectId(null);
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projects.getProjects({ pageSize: 100 });
      setProjectList(response.data);
    } catch (error) {
      console.error('Load projects error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleWeight = (weight: number) => {
    setSelectedWeights((prev) =>
      prev.includes(weight) ? prev.filter((w) => w !== weight) : [...prev, weight]
    );
  };

  const handleDownload = () => {
    if (!selectedProjectId || selectedWeights.length === 0) return;
    selectedWeights.forEach((weight) => {
      onDownload(selectedProjectId!, weight);
    });
    onClose();
  };

  const isDisabled = !selectedProjectId || selectedWeights.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-gold w-full max-w-lg mx-4 overflow-hidden',
          'transform transition-all duration-300',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
      >
        <div className="bg-gradient-to-r from-ink-800 to-ink-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">下载字体</h3>
              <p className="text-ink-200 text-sm mt-1">{fontName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">授权范围提示</p>
                <p className="mt-1 text-amber-700">
                  下载的字体仅可用于所选项目，不得用于其他项目或转授权。
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-800 mb-3">
              选择字重 <span className="text-coral-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {weights.map((weight) => (
                <button
                  key={weight}
                  onClick={() => toggleWeight(weight)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200',
                    selectedWeights.includes(weight)
                      ? 'border-gold-500 bg-gold-50 text-gold-700'
                      : 'border-ink-200 hover:border-gold-300 text-ink-600 hover:bg-gold-50/50'
                  )}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    {selectedWeights.includes(weight) && (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{FONT_WEIGHT_LABELS[weight] || weight}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-800 mb-3">
              关联项目 <span className="text-coral-500">*</span>
            </label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(Number(e.target.value) || null)}
              className={cn(
                'w-full px-4 py-3 rounded-xl border-2 text-ink-800',
                'focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500',
                'transition-all duration-200',
                selectedProjectId ? 'border-gold-500 bg-gold-50' : 'border-ink-200'
              )}
              disabled={loading}
            >
              <option value="">请选择项目</option>
              {projectList.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({PROJECT_TYPE_LABELS[project.type]})
                </option>
              ))}
            </select>
            {loading && (
              <p className="text-sm text-ink-400 mt-2">加载项目列表中...</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-ink-100 bg-ink-50">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-ink-600 bg-white border-2 border-ink-200 hover:bg-ink-50 transition-all duration-200"
          >
            取消
          </button>
          <button
            onClick={handleDownload}
            disabled={isDisabled}
            className={cn(
              'flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200',
              isDisabled
                ? 'bg-ink-200 text-ink-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 shadow-lg hover:shadow-gold'
            )}
          >
            <Download className="w-5 h-5" />
            确认下载 ({selectedWeights.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
