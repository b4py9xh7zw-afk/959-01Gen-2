import React, { useEffect, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Check, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fonts } from '../services/api';
import { toast } from '../components/Toast';
import FontCard from '../components/FontCard';
import Empty from '../components/Empty';
import { formatPrice } from '../utils/format';
import { cn } from '@/lib/utils';
import { FONT_STYLE_LABELS, PROJECT_TYPE_LABELS } from '@shared/types';
import type { Font, ProjectType, PaginatedResponse } from '@shared/types';

type FontStyle = 'all' | 'serif' | 'sans-serif' | 'display' | 'monospace';
type LicenseDuration = '1year' | '2year' | 'permanent';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  font: Font | null;
  onConfirm: (data: {
    duration: LicenseDuration;
    projectTypes: ProjectType[];
  }) => void;
  isLoading: boolean;
}

const licenseOptions: Record<LicenseDuration, { label: string; multiplier: number }> = {
  '1year': { label: '1年授权', multiplier: 1 },
  '2year': { label: '2年授权', multiplier: 1.8 },
  'permanent': { label: '永久授权', multiplier: 3 },
};

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  font,
  onConfirm,
  isLoading,
}) => {
  const [duration, setDuration] = useState<LicenseDuration>('1year');
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDuration('1year');
      setProjectTypes([]);
    }
  }, [isOpen]);

  if (!isOpen || !font) return null;

  const toggleProjectType = (type: ProjectType) => {
    setProjectTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const totalPrice = font.price * licenseOptions[duration].multiplier * projectTypes.length;
  const canConfirm = projectTypes.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-ink-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-ink-900">购买授权</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-ink-100 text-ink-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-ink-50 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-gold-100 to-gold-200 rounded-lg flex items-center justify-center">
              <span className="font-display text-2xl text-gold-700">Aa</span>
            </div>
            <div>
              <h4 className="font-semibold text-ink-900">{font.name}</h4>
              <p className="text-sm text-ink-500">by {font.designer}</p>
              <p className="text-lg font-bold text-gold-600 mt-1">
                {formatPrice(font.price, font.currency)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-3">
              选择授权期限
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(licenseOptions) as LicenseDuration[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setDuration(key)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-center transition-all duration-200',
                    duration === key
                      ? 'border-gold-500 bg-gold-50 text-gold-700'
                      : 'border-ink-200 hover:border-ink-300 text-ink-600'
                  )}
                >
                  <p className="font-medium text-sm">{licenseOptions[key].label}</p>
                  <p className="text-xs mt-1">×{licenseOptions[key].multiplier}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-3">
              选择项目类型（可多选）
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleProjectType(type)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between',
                    projectTypes.includes(type)
                      ? 'border-gold-500 bg-gold-50 text-gold-700'
                      : 'border-ink-200 hover:border-ink-300 text-ink-600'
                  )}
                >
                  <span className="font-medium text-sm">{PROJECT_TYPE_LABELS[type]}</span>
                  {projectTypes.includes(type) && (
                    <Check className="w-4 h-4 text-gold-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-ink-50 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">基础价格</span>
              <span className="text-ink-700">{formatPrice(font.price, font.currency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-ink-500">授权期限</span>
              <span className="text-ink-700">{licenseOptions[duration].label}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-ink-500">项目类型数量</span>
              <span className="text-ink-700">{projectTypes.length} 个</span>
            </div>
            <div className="border-t border-ink-200 my-3" />
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink-900">总计</span>
              <span className="text-2xl font-bold text-gold-600">
                {formatPrice(totalPrice, font.currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-ink-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-ink-300 text-ink-700 font-medium hover:bg-ink-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => canConfirm && onConfirm({ duration, projectTypes })}
            disabled={!canConfirm || isLoading}
            className={cn(
              'flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200',
              'flex items-center justify-center gap-2',
              canConfirm && !isLoading
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 shadow-gold'
                : 'bg-ink-200 text-ink-400 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                确认购买
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const FontMarketSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="h-12 bg-white rounded-xl animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
      ))}
    </div>
  </div>
);

const FontMarket: React.FC = () => {
  const navigate = useNavigate();
  const [fontsData, setFontsData] = useState<PaginatedResponse<Font> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<FontStyle>('all');
  const [page, setPage] = useState(1);
  const [purchaseModal, setPurchaseModal] = useState<{
    isOpen: boolean;
    font: Font | null;
  }>({ isOpen: false, font: null });
  const [isPurchasing, setIsPurchasing] = useState(false);

  const pageSize = 8;

  const fetchFonts = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {
        page,
        pageSize,
      };
      if (searchQuery) {
        params.search = searchQuery;
      }
      if (selectedStyle !== 'all') {
        params.style = selectedStyle;
      }
      const data = await fonts.getFonts(params);
      setFontsData(data);
    } catch (error) {
      console.error('Failed to fetch fonts:', error);
      toast.error('加载字体列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFonts();
  }, [page, selectedStyle]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFonts();
  };

  const handleStyleChange = (style: FontStyle) => {
    setSelectedStyle(style);
    setPage(1);
  };

  const handlePurchase = (font: Font) => {
    setPurchaseModal({ isOpen: true, font });
  };

  const handleViewDetail = (font: Font) => {
    navigate(`/fonts/${font.id}`);
  };

  const handleConfirmPurchase = async (data: {
    duration: LicenseDuration;
    projectTypes: ProjectType[];
  }) => {
    if (!purchaseModal.font) return;

    try {
      setIsPurchasing(true);
      const durationMap = {
        '1year': 1,
        '2year': 2,
        'permanent': -1,
      };
      await fonts.purchaseFont(purchaseModal.font.id, {
        duration: durationMap[data.duration],
        projectTypes: data.projectTypes,
      });
      toast.success('购买成功！');
      setPurchaseModal({ isOpen: false, font: null });
      fetchFonts();
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('购买失败，请稍后重试');
    } finally {
      setIsPurchasing(false);
    }
  };

  const styleFilters: { key: FontStyle; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'serif', label: '衬线体' },
    { key: 'sans-serif', label: '无衬线体' },
    { key: 'display', label: '展示体' },
    { key: 'monospace', label: '等宽体' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-card p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索字体名称、设计师..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ink-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all text-ink-900 placeholder-ink-400"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {styleFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => handleStyleChange(filter.key)}
                className={cn(
                  'px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200',
                  selectedStyle === filter.key
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-gold'
                    : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {isLoading ? (
        <FontMarketSkeleton />
      ) : fontsData && fontsData.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {fontsData.data.map((font, index) => (
              <div key={font.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <FontCard
                  font={font}
                  onPurchase={handlePurchase}
                  onView={handleViewDetail}
                />
              </div>
            ))}
          </div>

          {fontsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  page === 1
                    ? 'text-ink-300 cursor-not-allowed'
                    : 'text-ink-600 hover:bg-ink-100'
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: fontsData.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200',
                    page === p
                      ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-gold'
                      : 'text-ink-600 hover:bg-ink-100'
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(fontsData!.pagination.totalPages, p + 1))}
                disabled={page === fontsData.pagination.totalPages}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  page === fontsData.pagination.totalPages
                    ? 'text-ink-300 cursor-not-allowed'
                    : 'text-ink-600 hover:bg-ink-100'
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-card p-12">
          <Empty
            icon={<Search className="w-16 h-16 text-ink-300" />}
            title="未找到字体"
            description="尝试调整搜索条件或筛选器"
          />
        </div>
      )}

      <PurchaseModal
        isOpen={purchaseModal.isOpen}
        onClose={() => setPurchaseModal({ isOpen: false, font: null })}
        font={purchaseModal.font}
        onConfirm={handleConfirmPurchase}
        isLoading={isPurchasing}
      />
    </div>
  );
};

export default FontMarket;
