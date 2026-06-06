import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Check,
  Info,
  FileText,
  Award,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/format';
import { projects, licenses } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import ProjectTypeBadge from '@/components/ProjectTypeBadge';
import type { ProjectType, License } from '../../shared/types';
import { PROJECT_TYPE_LABELS } from '../../shared/types';

interface StepIndicatorProps {
  currentStep: number;
  steps: { id: number; title: string; icon: React.ElementType }[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isCompleted && 'bg-gold-500 border-gold-500 text-white',
                  isActive && 'bg-white border-gold-500 text-gold-500',
                  !isCompleted && !isActive && 'bg-white border-ink-200 text-ink-300'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-sm font-medium',
                  isActive ? 'text-gold-600' : isCompleted ? 'text-ink-700' : 'text-ink-400'
                )}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-20 h-1 mx-2 rounded-full transition-colors duration-300',
                  isCompleted ? 'bg-gold-500' : 'bg-ink-200'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

interface FormData {
  name: string;
  description: string;
  type: ProjectType | '';
  startDate: string;
  endDate: string;
  licenseId: number | null;
}

interface FormErrors {
  name?: string;
  description?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  licenseId?: string;
}

const steps = [
  { id: 1, title: '基本信息', icon: Info },
  { id: 2, title: '选择授权', icon: Award },
  { id: 3, title: '确认创建', icon: FileText },
];

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableLicenses, setAvailableLicenses] = useState<License[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: '',
    startDate: '',
    endDate: '',
    licenseId: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    fetchAvailableLicenses();
  }, []);

  const fetchAvailableLicenses = async () => {
    setLoading(true);
    try {
      const response = await licenses.getLicenses({ status: 'active', pageSize: 100 });
      const available = response.data.filter(
        (license) => license.usedProjects < license.maxProjects
      );
      setAvailableLicenses(available);
    } catch (error) {
      console.error('Failed to fetch licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入项目名称';
    } else if (formData.name.length > 50) {
      newErrors.name = '项目名称不能超过50个字符';
    }

    if (!formData.description.trim()) {
      newErrors.description = '请输入项目描述';
    } else if (formData.description.length > 200) {
      newErrors.description = '项目描述不能超过200个字符';
    }

    if (!formData.type) {
      newErrors.type = '请选择项目类型';
    }

    if (!formData.startDate) {
      newErrors.startDate = '请选择开始日期';
    }

    if (!formData.endDate) {
      newErrors.endDate = '请选择结束日期';
    } else if (
      formData.startDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate = '结束日期不能早于开始日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.licenseId) {
      newErrors.licenseId = '请选择一个授权';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const project = await projects.createProject({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        licenseId: formData.licenseId,
      });
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const selectedLicense = availableLicenses.find((l) => l.id === formData.licenseId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/projects')} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">新建项目</h1>
          <p className="text-ink-500 mt-1">创建一个新的字体使用项目</p>
        </div>
      </div>

      <StepIndicator currentStep={currentStep} steps={steps} />

      <div className="card p-8">
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="label" htmlFor="name">
                项目名称 <span className="text-coral-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="请输入项目名称"
                className={cn('input', errors.name && 'border-coral-500 focus:ring-coral-500')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-coral-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="description">
                项目描述 <span className="text-coral-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="请输入项目描述"
                rows={3}
                className={cn('input', errors.description && 'border-coral-500 focus:ring-coral-500')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-coral-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-ink-400">
                {formData.description.length}/200
              </p>
            </div>

            <div>
              <label className="label">
                项目类型 <span className="text-coral-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, type }));
                      if (errors.type) {
                        setErrors((prev) => ({ ...prev, type: undefined }));
                      }
                    }}
                    className={cn(
                      'p-4 rounded-lg border-2 text-center transition-all',
                      formData.type === type
                        ? 'border-gold-400 bg-gold-50 text-gold-700'
                        : 'border-ink-200 hover:border-ink-300 text-ink-600'
                    )}
                  >
                    <ProjectTypeBadge type={type} />
                  </button>
                ))}
              </div>
              {errors.type && (
                <p className="mt-2 text-sm text-coral-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.type}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="startDate">
                  开始日期 <span className="text-coral-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={cn(
                      'input pl-10',
                      errors.startDate && 'border-coral-500 focus:ring-coral-500'
                    )}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-coral-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="endDate">
                  结束日期 <span className="text-coral-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={cn(
                      'input pl-10',
                      errors.endDate && 'border-coral-500 focus:ring-coral-500'
                    )}
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-coral-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-ink-600 mb-4">
              请选择一个有效的授权用于此项目。只有状态为「有效」且未满的授权可以选择。
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-ink-200 border-t-gold-500 rounded-full" />
              </div>
            ) : availableLicenses.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-ink-700 mb-2">暂无可用授权</h3>
                <p className="text-ink-500 mb-4">
                  您没有可用的有效授权，请先购买或续期授权
                </p>
                <button
                  onClick={() => navigate('/fonts')}
                  className="btn-gold"
                >
                  前往字体市场
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                {availableLicenses.map((license) => {
                  const isSelected = formData.licenseId === license.id;
                  const isTypeAllowed =
                    formData.type &&
                    license.allowedProjectTypes.includes(formData.type as ProjectType);
                  const usagePercent = (license.usedProjects / license.maxProjects) * 100;

                  return (
                    <label
                      key={license.id}
                      className={cn(
                        'block p-4 rounded-lg border-2 cursor-pointer transition-all',
                        isSelected
                          ? 'border-gold-400 bg-gold-50'
                          : isTypeAllowed
                          ? 'border-ink-200 hover:border-ink-300'
                          : 'border-ink-100 bg-ink-50 opacity-60 cursor-not-allowed'
                      )}
                    >
                      <input
                        type="radio"
                        name="licenseId"
                        value={license.id}
                        checked={isSelected}
                        onChange={() => {
                          if (isTypeAllowed) {
                            setFormData((prev) => ({ ...prev, licenseId: license.id }));
                            if (errors.licenseId) {
                              setErrors((prev) => ({ ...prev, licenseId: undefined }));
                            }
                          }
                        }}
                        disabled={!isTypeAllowed}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center',
                            isSelected
                              ? 'border-gold-500 bg-gold-500'
                              : 'border-ink-300 bg-white'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {license.font?.coverImage && (
                                <img
                                  src={license.font.coverImage}
                                  alt={license.font.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium text-ink-900">
                                  {license.font?.name || '未知字体'}
                                </div>
                                <div className="text-xs text-ink-500">
                                  {license.font?.designer}
                                </div>
                              </div>
                            </div>
                            <StatusBadge status={license.status} />
                          </div>

                          {!isTypeAllowed && (
                            <div className="text-xs text-coral-600 mb-2">
                              该授权不支持「{PROJECT_TYPE_LABELS[formData.type as ProjectType]}」类型项目
                            </div>
                          )}

                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex flex-wrap gap-1.5">
                              {license.allowedProjectTypes.map((type) => (
                                <ProjectTypeBadge key={type} type={type} />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-ink-500">
                            <span>
                              有效期：{formatDate(license.startDate)} ~{' '}
                              {formatDate(license.endDate)}
                            </span>
                            <span>
                              项目：{license.usedProjects}/{license.maxProjects}
                            </span>
                          </div>

                          <div className="mt-2 w-full max-w-xs">
                            <div className="progress-bar">
                              <div
                                className="progress-bar-fill"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {errors.licenseId && (
              <p className="text-sm text-coral-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.licenseId}
              </p>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="text-xl font-semibold text-ink-900">确认项目信息</h3>
              <p className="text-ink-500 mt-1">请确认以下信息是否正确</p>
            </div>

            <div className="bg-ink-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-ink-500">项目名称</div>
                  <div className="font-medium text-ink-900 mt-1">{formData.name}</div>
                </div>
                <div>
                  <div className="text-sm text-ink-500">项目类型</div>
                  <div className="mt-1">
                    {formData.type && <ProjectTypeBadge type={formData.type} />}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-ink-500">开始日期</div>
                  <div className="font-medium text-ink-900 mt-1">
                    {formatDate(formData.startDate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-ink-500">结束日期</div>
                  <div className="font-medium text-ink-900 mt-1">
                    {formatDate(formData.endDate)}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-ink-500">项目描述</div>
                <div className="font-medium text-ink-900 mt-1">{formData.description}</div>
              </div>
            </div>

            {selectedLicense && (
              <div className="bg-gradient-to-r from-gold-50 to-ink-50 rounded-lg p-6 border border-gold-100">
                <h4 className="font-semibold text-ink-900 mb-4">已选择的授权</h4>
                <div className="flex items-center gap-4">
                  {selectedLicense.font?.coverImage && (
                    <img
                      src={selectedLicense.font.coverImage}
                      alt={selectedLicense.font.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-ink-900">
                      {selectedLicense.font?.name}
                    </div>
                    <div className="text-sm text-ink-500">
                      {selectedLicense.font?.designer}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={selectedLicense.status} />
                      <span className="text-sm text-ink-500">
                        {formatDate(selectedLicense.startDate)} ~{' '}
                        {formatDate(selectedLicense.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gold-200">
                  <div className="text-sm text-ink-500 mb-2">授权范围</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLicense.allowedProjectTypes.map((type) => (
                      <ProjectTypeBadge key={type} type={type} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-ink-100">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1 || submitting}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一步
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={submitting}
              className="btn-primary"
            >
              下一步
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-gold"
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                  创建中...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  确认创建
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewProject;
