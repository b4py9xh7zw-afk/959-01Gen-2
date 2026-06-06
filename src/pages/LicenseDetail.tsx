import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Edit3,
  Save,
  X,
  Plus,
  Calendar,
  ShoppingBag,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, getDaysRemaining, formatPrice } from '@/utils/format';
import { licenses, projects } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import ProjectTypeBadge from '@/components/ProjectTypeBadge';
import ConfirmModal from '@/components/ConfirmModal';
import type { License, Project, ProjectType } from '../../shared/types';
import { PROJECT_TYPE_LABELS } from '../../shared/types';

const LicenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [license, setLicense] = useState<License | null>(null);
  const [boundProjects, setBoundProjects] = useState<Project[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{
    allowedProjectTypes: ProjectType[];
    maxProjects: number;
  } | null>(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [renewDuration, setRenewDuration] = useState(12);

  useEffect(() => {
    if (id) {
      fetchLicenseData(parseInt(id));
    }
  }, [id]);

  const fetchLicenseData = async (licenseId: number) => {
    setLoading(true);
    try {
      const [licenseData, projectsData] = await Promise.all([
        licenses.getLicenseById(licenseId),
        projects.getProjects({ pageSize: 100 }),
      ]);
      setLicense(licenseData);

      const bound = projectsData.data.filter((p) => p.licenseId === licenseId);
      const available = projectsData.data.filter(
        (p) => p.licenseId === null || p.licenseId === undefined
      );

      setBoundProjects(bound);
      setAvailableProjects(available);
    } catch (error) {
      console.error('Failed to fetch license data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!license) return;
    setEditData({
      allowedProjectTypes: [...license.allowedProjectTypes],
      maxProjects: license.maxProjects,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!license || !editData) return;
    try {
      const updated = await licenses.updateLicense(license.id, editData);
      setLicense(updated);
      setIsEditing(false);
      setEditData(null);
    } catch (error) {
      console.error('Failed to update license:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleRenew = async () => {
    if (!license) return;
    try {
      const months = renewDuration;
      await licenses.renewLicense(license.id, { months });
      setShowRenewModal(false);
      fetchLicenseData(license.id);
    } catch (error) {
      console.error('Failed to renew license:', error);
    }
  };

  const handleAssignProject = async () => {
    if (!license || !selectedProjectId) return;
    try {
      await projects.createProject({
        licenseId: license.id,
        projectId: selectedProjectId,
      });
      setShowAssignModal(false);
      setSelectedProjectId(null);
      fetchLicenseData(license.id);
    } catch (error) {
      console.error('Failed to assign project:', error);
    }
  };

  const toggleProjectType = (type: ProjectType) => {
    if (!editData) return;
    const current = editData.allowedProjectTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setEditData({ ...editData, allowedProjectTypes: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-ink-200 border-t-gold-500 rounded-full" />
      </div>
    );
  }

  if (!license) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">授权不存在</p>
        <button onClick={() => navigate('/licenses')} className="btn-primary mt-4">
          返回授权列表
        </button>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(license.endDate);
  const usagePercent = (license.usedProjects / license.maxProjects) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/licenses')}
          className="btn-ghost p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">授权详情</h1>
          <p className="text-ink-500 mt-1">查看和管理字体授权信息</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="relative h-40 bg-gradient-to-br from-ink-800 to-ink-900 grain">
              {license.font?.coverImage && (
                <img
                  src={license.font.coverImage}
                  alt={license.font.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {license.font?.name || '未知字体'}
                    </h2>
                    {license.font?.designer && (
                      <p className="text-ink-300 text-sm mt-1">
                        设计师：{license.font.designer}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={license.status} />
                </div>
              </div>
            </div>

            <div className="p-6">
              {license.font?.previewText && (
                <div
                  className="text-3xl text-ink-700 mb-6 pb-6 border-b border-ink-100"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {license.font.previewText}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-ink-50 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-gold-500 mx-auto mb-2" />
                  <div className="text-xs text-ink-500">购买日期</div>
                  <div className="text-sm font-medium text-ink-900 mt-1">
                    {formatDate(license.purchaseDate)}
                  </div>
                </div>
                <div className="text-center p-3 bg-ink-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gold-500 mx-auto mb-2" />
                  <div className="text-xs text-ink-500">有效期</div>
                  <div className="text-sm font-medium text-ink-900 mt-1">
                    {formatDate(license.startDate)}
                  </div>
                  <div className="text-xs text-ink-400">
                    至 {formatDate(license.endDate)}
                  </div>
                </div>
                <div className="text-center p-3 bg-ink-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-gold-500 mx-auto mb-2" />
                  <div className="text-xs text-ink-500">剩余天数</div>
                  <div
                    className={cn(
                      'text-lg font-bold mt-1',
                      daysRemaining > 30 && 'text-forest-600',
                      daysRemaining > 0 && daysRemaining <= 30 && 'text-gold-600',
                      daysRemaining <= 0 && 'text-coral-600'
                    )}
                  >
                    {daysRemaining > 0 ? `${daysRemaining}` : '0'}
                    <span className="text-sm font-normal text-ink-500 ml-1">天</span>
                  </div>
                </div>
                <div className="text-center p-3 bg-ink-50 rounded-lg">
                  <Layers className="w-5 h-5 text-gold-500 mx-auto mb-2" />
                  <div className="text-xs text-ink-500">项目使用</div>
                  <div className="text-lg font-bold text-ink-900 mt-1">
                    {license.usedProjects}
                    <span className="text-sm font-normal text-ink-500">
                      /{license.maxProjects}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink-900">授权范围</h3>
              {!isEditing ? (
                <button onClick={handleEdit} className="btn-ghost text-sm">
                  <Edit3 className="w-4 h-4 mr-1.5" />
                  编辑
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={handleCancelEdit} className="btn-ghost text-sm">
                    <X className="w-4 h-4 mr-1.5" />
                    取消
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="btn-primary text-sm"
                    disabled={editData?.allowedProjectTypes.length === 0}
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    保存
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">
                    允许的项目类型
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {license.allowedProjectTypes.map((type) => (
                      <ProjectTypeBadge key={type} type={type} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">
                    最大项目数
                  </label>
                  <div className="text-ink-900">{license.maxProjects} 个项目</div>
                  <div className="mt-3 w-full max-w-md">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-ink-600">已使用</span>
                      <span className="text-ink-500">
                        {license.usedProjects} / {license.maxProjects}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">
                    允许的项目类型
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleProjectType(type)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                          editData?.allowedProjectTypes.includes(type)
                            ? 'bg-gold-100 text-gold-700 border-gold-300'
                            : 'bg-white text-ink-600 border-ink-200 hover:border-ink-300'
                        )}
                      >
                        {PROJECT_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">
                    最大项目数
                  </label>
                  <input
                    type="number"
                    min={license.usedProjects}
                    value={editData?.maxProjects || ''}
                    onChange={(e) =>
                      setEditData(
                        editData
                          ? { ...editData, maxProjects: parseInt(e.target.value) || 0 }
                          : null
                      )
                    }
                    className="input max-w-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink-900">已绑定项目</h3>
              <button
                onClick={() => setShowAssignModal(true)}
                className="btn-primary text-sm"
                disabled={license.usedProjects >= license.maxProjects}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                分配项目
              </button>
            </div>

            {boundProjects.length === 0 ? (
              <div className="text-center py-8 text-ink-500">
                暂无已绑定的项目
              </div>
            ) : (
              <div className="space-y-3">
                {boundProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 bg-ink-50 rounded-lg hover:bg-ink-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div>
                      <div className="font-medium text-ink-900">{project.name}</div>
                      <div className="text-sm text-ink-500 mt-0.5">
                        {project.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ProjectTypeBadge type={project.type} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-ink-900 mb-4">授权价格</h3>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-gold-600">
                {formatPrice(license.price, license.font?.currency)}
              </div>
              <div className="text-sm text-ink-500 mt-1">
                订单号：{license.transactionId}
              </div>
            </div>
          </div>

          {license.status !== 'expired' && (
            <div className="card p-6 border-gold-200 bg-gold-50/50">
              <h3 className="text-lg font-semibold text-ink-900 mb-4">续期授权</h3>
              <p className="text-sm text-ink-600 mb-4">
                延长授权有效期，继续使用该字体
              </p>
              <button
                onClick={() => setShowRenewModal(true)}
                className="btn-gold w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                立即续期
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showRenewModal}
        onClose={() => setShowRenewModal(false)}
        onConfirm={handleRenew}
        title="续期授权"
        confirmText="确认续期"
        message={
          <div className="space-y-4">
            <p className="text-ink-600">
              确定要为 &quot;{license.font?.name}&quot; 续期吗？
            </p>
            <div>
              <label className="label">续期时长</label>
              <select
                value={renewDuration}
                onChange={(e) => setRenewDuration(parseInt(e.target.value))}
                className="input"
              >
                <option value={3}>3 个月</option>
                <option value={6}>6 个月</option>
                <option value={12}>12 个月</option>
                <option value={24}>24 个月</option>
              </select>
            </div>
            <div className="p-3 bg-ink-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-ink-600">预计费用</span>
                <span className="font-semibold text-gold-600">
                  {formatPrice(
                    (license.price / 12) * renewDuration,
                    license.font?.currency
                  )}
                </span>
              </div>
            </div>
          </div>
        }
      />

      <ConfirmModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedProjectId(null);
        }}
        onConfirm={handleAssignProject}
        title="分配项目"
        confirmText="确认分配"
        message={
          <div className="space-y-4">
            <p className="text-ink-600">选择要分配到该授权的项目：</p>
            {availableProjects.length === 0 ? (
              <p className="text-sm text-ink-500 text-center py-4">
                暂无可分配的项目，请先创建项目
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableProjects.map((project) => (
                  <label
                    key={project.id}
                    className={cn(
                      'flex items-center p-3 rounded-lg border cursor-pointer transition-all',
                      selectedProjectId === project.id
                        ? 'border-gold-400 bg-gold-50'
                        : 'border-ink-200 hover:border-ink-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="project"
                      value={project.id}
                      checked={selectedProjectId === project.id}
                      onChange={() => setSelectedProjectId(project.id)}
                      className="w-4 h-4 text-gold-600"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="font-medium text-ink-900 truncate">
                        {project.name}
                      </div>
                      <div className="text-sm text-ink-500 truncate">
                        {project.description}
                      </div>
                    </div>
                    <ProjectTypeBadge type={project.type} />
                  </label>
                ))}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
};

export default LicenseDetail;
