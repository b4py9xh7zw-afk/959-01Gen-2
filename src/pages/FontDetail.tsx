import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  Type,
  Globe,
  Palette,
  Check,
  X,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { fonts } from '../services/api';
import { toast } from '../components/Toast';
import { formatPrice } from '../utils/format';
import { cn } from '@/lib/utils';
import {
  FONT_STYLE_LABELS,
  PROJECT_TYPE_LABELS,
} from '@shared/types';
import type { Font, ProjectType } from '@shared/types';

type LicenseDuration = '1year' | '2year' | 'permanent';

const licenseOptions: Record<LicenseDuration, { label: string; multiplier: number }> = {
  '1year': { label: '1年授权', multiplier: 1 },
  '2year': { label: '2年授权', multiplier: 1.8 },
  'permanent': { label: '永久授权', multiplier: 3 },
};

const FontDetailSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-10 bg-white rounded-xl w-40" />
    <div className="bg-white rounded-xl shadow-card h-96" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-card h-64" />
        <div className="bg-white rounded-xl shadow-card h-80" />
      </div>
      <div className="bg-white rounded-xl shadow-card h-96" />
    </div>
  </div>
);

const FontDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [font, setFont] = useState<Font | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewText, setPreviewText] = useState('');
  const [selectedWeight, setSelectedWeight] = useState<number>(400);
  const [duration, setDuration] = useState<LicenseDuration>('1year');
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const fetchFont = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await fonts.getFontById(parseInt(id));
        setFont(data);
        setPreviewText(data.previewText);
        if (data.weights.length > 0) {
          setSelectedWeight(data.weights[0]);
        }
      } catch (error) {
        console.error('Failed to fetch font:', error);
        toast.error('加载字体详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFont();
  }, [id]);

  const toggleProjectType = (type: ProjectType) => {
    setProjectTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handlePurchase = async () => {
    if (!font || projectTypes.length === 0) return;

    try {
      setIsPurchasing(true);
      const durationMap = {
        '1year': 1,
        '2year': 2,
        'permanent': -1,
      };
      await fonts.purchaseFont(font.id, {
        duration: durationMap[duration],
        projectTypes,
      });
      toast.success('购买成功！');
      navigate('/fonts');
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('购买失败，请稍后重试');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return <FontDetailSkeleton />;
  }

  if (!font) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-500">字体不存在</p>
        <button
          onClick={() => navigate('/fonts')}
          className="mt-4 px-4 py-2 text-gold-600 hover:text-gold-700"
        >
          返回列表
        </button>
      </div>
    );
  }

  const totalPrice = font.price * licenseOptions[duration].multiplier * projectTypes.length;
  const canPurchase = projectTypes.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/fonts')}
        className="flex items-center gap-2 text-ink-600 hover:text-ink-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回字体市场</span>
      </button>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div
          className="h-80 bg-gradient-to-br from-ink-50 via-white to-ink-100 flex items-center justify-center p-8 relative"
          style={{ fontFamily: font.family, fontWeight: selectedWeight }}
        >
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="w-full h-full text-center text-5xl md:text-6xl text-ink-800 bg-transparent border-none outline-none resize-none font-medium"
            style={{ fontFamily: font.family, fontWeight: selectedWeight }}
            placeholder="输入预览文本..."
          />
        </div>

        <div className="p-6 border-t border-ink-100">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-ink-500 mr-2">字重：</span>
            {font.weights.map((weight) => (
              <button
                key={weight}
                onClick={() => setSelectedWeight(weight)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  selectedWeight === weight
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-gold'
                    : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                )}
                style={{ fontWeight: weight }}
              >
                {weight}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink-900" style={{ fontFamily: font.family }}>
                {font.name}
              </h1>
              <p className="text-ink-500 mt-1">by {font.designer}</p>
            </div>
            <span className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm font-medium">
              {FONT_STYLE_LABELS[font.style]}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-ink-900 mb-4">字体信息</h2>
            <p className="text-ink-600 leading-relaxed mb-6">{font.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-ink-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  <Type className="w-5 h-5 text-gold-500" />
                </div>
                <div>
                  <p className="text-xs text-ink-400">风格</p>
                  <p className="font-medium text-ink-900">{FONT_STYLE_LABELS[font.style]}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-ink-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  <Globe className="w-5 h-5 text-forest-500" />
                </div>
                <div>
                  <p className="text-xs text-ink-400">语言支持</p>
                  <p className="font-medium text-ink-900">{font.languages.join('、')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-ink-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  <Palette className="w-5 h-5 text-coral-500" />
                </div>
                <div>
                  <p className="text-xs text-ink-400">字重数量</p>
                  <p className="font-medium text-ink-900">{font.weights.length} 种</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-ink-900 mb-4">授权套餐对比</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-ink-500">套餐</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-ink-500">价格倍数</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-ink-500">有效期</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-ink-500">推荐</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(licenseOptions) as LicenseDuration[]).map((key) => (
                    <tr
                      key={key}
                      className={cn(
                        'border-b border-ink-100 transition-colors',
                        duration === key ? 'bg-gold-50' : 'hover:bg-ink-50'
                      )}
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium text-ink-900">
                          {licenseOptions[key].label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-ink-600">×{licenseOptions[key].multiplier}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-ink-600">
                          {key === 'permanent' ? '永久' : key === '2year' ? '24个月' : '12个月'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {key === '2year' && (
                          <span className="px-2 py-1 bg-gold-100 text-gold-700 text-xs font-medium rounded-full">
                            最划算
                          </span>
                        )}
                        {key === '1year' && (
                          <span className="px-2 py-1 bg-ink-100 text-ink-600 text-xs font-medium rounded-full">
                            入门
                          </span>
                        )}
                        {key === 'permanent' && (
                          <span className="px-2 py-1 bg-forest-100 text-forest-700 text-xs font-medium rounded-full">
                            企业级
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-semibold text-ink-900 mb-4">字符集预览</h2>
            <div className="grid grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('').map((char, index) => (
                <div
                  key={index}
                  className="aspect-square flex items-center justify-center bg-ink-50 rounded-lg text-lg text-ink-700 hover:bg-gold-50 hover:text-gold-600 transition-colors"
                  style={{ fontFamily: font.family, fontWeight: selectedWeight }}
                >
                  {char}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-card p-6 sticky top-20">
            <h2 className="text-lg font-semibold text-ink-900 mb-4">购买授权</h2>

            <div className="p-4 bg-gold-50 rounded-xl mb-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-500">基础价格</span>
                <span className="text-2xl font-bold text-gold-600">
                  {formatPrice(font.price, font.currency)}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-ink-700 mb-3">
                授权期限
              </label>
              <div className="space-y-2">
                {(Object.keys(licenseOptions) as LicenseDuration[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setDuration(key)}
                    className={cn(
                      'w-full p-3 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between',
                      duration === key
                        ? 'border-gold-500 bg-gold-50 text-gold-700'
                        : 'border-ink-200 hover:border-ink-300 text-ink-600'
                    )}
                  >
                    <div>
                      <p className="font-medium text-sm">{licenseOptions[key].label}</p>
                      <p className="text-xs mt-0.5 opacity-70">
                        {formatPrice(font.price * licenseOptions[key].multiplier, font.currency)} / 项目类型
                      </p>
                    </div>
                    {duration === key && <Check className="w-5 h-5 text-gold-500" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-ink-700 mb-3">
                项目类型（可多选）
              </label>
              <div className="space-y-2">
                {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleProjectType(type)}
                    className={cn(
                      'w-full p-3 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between',
                      projectTypes.includes(type)
                        ? 'border-gold-500 bg-gold-50 text-gold-700'
                        : 'border-ink-200 hover:border-ink-300 text-ink-600'
                    )}
                  >
                    <span className="font-medium text-sm">{PROJECT_TYPE_LABELS[type]}</span>
                    {projectTypes.includes(type) ? (
                      <Check className="w-5 h-5 text-gold-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-ink-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-ink-50 rounded-xl mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">单价</span>
                <span className="text-ink-700">
                  {formatPrice(font.price * licenseOptions[duration].multiplier, font.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-ink-500">项目数量</span>
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

            <button
              onClick={handlePurchase}
              disabled={!canPurchase || isPurchasing}
              className={cn(
                'w-full py-4 rounded-xl font-medium text-lg transition-all duration-200',
                'flex items-center justify-center gap-2',
                canPurchase && !isPurchasing
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 shadow-gold active:scale-[0.98]'
                  : 'bg-ink-200 text-ink-400 cursor-not-allowed'
              )}
            >
              {isPurchasing ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  立即购买
                </>
              )}
            </button>

            {!canPurchase && (
              <p className="text-center text-xs text-ink-400 mt-3">
                请至少选择一种项目类型
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontDetail;
