import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  Globe,
  Smartphone,
  Package,
  Megaphone,
  DownloadCloud,
  Award,
  Clock,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDate, getDaysRemaining } from '@/utils/format';
import { projects, certificates } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import ProjectTypeBadge from '@/components/ProjectTypeBadge';
import type { Project, Certificate, DownloadLog } from '../../shared/types';
import { PROJECT_TYPE_LABELS } from '../../shared/types';

const iconMap: Record<string, React.ElementType> = {
  website: Globe,
  app: Smartphone,
  packaging: Package,
  advertising: Megaphone,
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [downloadHistory, setDownloadHistory] = useState<DownloadLog[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectData(parseInt(id));
    }
  }, [id]);

  const fetchProjectData = async (projectId: number) => {
    setLoading(true);
    try {
      const projectData = await projects.getProjectById(projectId);
      setProject(projectData);
      
      const mockDownloads: DownloadLog[] = [
        {
          id: 1,
          userId: 1,
          fontId: projectData.license?.fontId || projectData.license?.font?.id || 1,
          projectId: projectId,
          weight: 400,
          downloadedAt: new Date().toISOString(),
          ipAddress: '192.168.1.1',
        },
        {
          id: 2,
          userId: 1,
          fontId: projectData.license?.fontId || projectData.license?.font?.id || 1,
          projectId: projectId,
          weight: 700,
          downloadedAt: new Date(Date.now() - 86400000).toISOString(),
          ipAddress: '192.168.1.1',
        },
      ];
      setDownloadHistory(mockDownloads);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCertificate = async () => {
    if (!project) return;
    setExporting(true);
    try {
      const blob = await certificates.exportCertificate(project.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${project.name}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export certificate:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-ink-200 border-t-gold-500 rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">项目不存在</p>
        <button onClick={() => navigate('/projects')} className="btn-primary mt-4">
          返回项目列表
        </button>
      </div>
    );
  }

  const endDate = project.endDate || project.license?.endDate;
  const daysRemaining = endDate ? getDaysRemaining(endDate) : null;
  const TypeIcon = iconMap[project.type] || Globe;
  const license = project.license;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/projects')} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">项目详情</h1>
          <p className="text-ink-500 mt-1">查看项目信息和授权证明</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-ink-900">{project.name}</h2>
                <p className="text-ink-500 mt-1">{project.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={license?.status || 'active'} />
                <ProjectTypeBadge type={project.type} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-ink-50 rounded-lg">
                <TypeIcon className="w-5 h-5 text-gold-500 mb-2" />
                <div className="text-xs text-ink-500">项目类型</div>
                <div className="text-sm font-medium text-ink-900 mt-1">
                  {PROJECT_TYPE_LABELS[project.type]}
                </div>
              </div>
              <div className="p-4 bg-ink-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gold-500 mb-2" />
                <div className="text-xs text-ink-500">创建日期</div>
                <div className="text-sm font-medium text-ink-900 mt-1">
                  {formatDate(project.createdAt)}
                </div>
              </div>
              <div className="p-4 bg-ink-50 rounded-lg">
                <Clock className="w-5 h-5 text-gold-500 mb-2" />
                <div className="text-xs text-ink-500">有效期</div>
                <div className="text-sm font-medium text-ink-900 mt-1">
                  {formatDate(project.startDate)}
                </div>
                {endDate && (
                  <div className="text-xs text-ink-400">至 {formatDate(endDate)}</div>
                )}
              </div>
              <div className="p-4 bg-ink-50 rounded-lg">
                <Award className="w-5 h-5 text-gold-500 mb-2" />
                <div className="text-xs text-ink-500">剩余天数</div>
                <div
                  className={cn(
                    'text-lg font-bold mt-1',
                    daysRemaining !== null && daysRemaining > 30 && 'text-forest-600',
                    daysRemaining !== null &&
                      daysRemaining > 0 &&
                      daysRemaining <= 30 &&
                      'text-gold-600',
                    (daysRemaining === null || daysRemaining <= 0) && 'text-coral-600'
                  )}
                >
                  {daysRemaining !== null && daysRemaining > 0
                    ? `${daysRemaining} 天`
                    : '已过期'}
                </div>
              </div>
            </div>
          </div>

          {license && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-ink-900 mb-4">绑定的授权</h3>
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gold-50 to-ink-50 rounded-lg border border-gold-100">
                {license.font?.coverImage && (
                  <img
                    src={license.font.coverImage}
                    alt={license.font.name}
                    className="w-16 h-16 rounded-lg object-cover border border-ink-200"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-ink-900">
                    {license.font?.name || '未知字体'}
                  </div>
                  {license.font?.previewText && (
                    <div
                      className="text-lg text-ink-500 font-serif"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {license.font.previewText}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={license.status} />
                    <span className="text-sm text-ink-500">
                      {formatDate(license.startDate)} ~ {formatDate(license.endDate)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/licenses/${license.id}`)}
                  className="btn-ghost text-sm"
                >
                  查看授权
                </button>
              </div>
            </div>
          )}

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ink-900">下载历史</h3>
              <span className="text-sm text-ink-500">
                共 {downloadHistory.length} 次下载
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-200">
                    <th className="text-left py-3 text-xs font-semibold text-ink-600 uppercase">
                      字体粗细
                    </th>
                    <th className="text-left py-3 text-xs font-semibold text-ink-600 uppercase">
                      下载时间
                    </th>
                    <th className="text-left py-3 text-xs font-semibold text-ink-600 uppercase">
                      IP 地址
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {downloadHistory.map((log) => (
                    <tr key={log.id} className="hover:bg-ink-50 transition-colors">
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-ink-100 text-ink-700">
                          {log.weight}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-ink-700">
                        {formatDate(log.downloadedAt, 'YYYY-MM-DD HH:mm:ss')}
                      </td>
                      <td className="py-3 text-sm text-ink-500 font-mono">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-ink-900 mb-4">授权证明</h3>
            
            <div className="relative bg-gradient-to-br from-ink-800 to-ink-900 rounded-lg p-6 text-white overflow-hidden grain">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-6 h-6 text-gold-400" />
                  <span className="text-gold-400 font-semibold">正版授权证书</span>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-ink-400">项目名称</div>
                    <div className="font-medium">{project.name}</div>
                  </div>
                  <div>
                    <div className="text-ink-400">授权字体</div>
                    <div className="font-medium">{license?.font?.name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-ink-400">有效期</div>
                    <div className="font-medium">
                      {formatDate(project.startDate)}
                      {endDate && ` ~ ${formatDate(endDate)}`}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-ink-700">
                  <div className="flex items-center justify-between text-xs text-ink-400">
                    <span>证书编号</span>
                    <span className="font-mono">CERT-{project.id.toString().padStart(6, '0')}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportCertificate}
              disabled={exporting}
              className="btn-gold w-full mt-4"
            >
              {exporting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  导出授权证明
                </>
              )}
            </button>
          </div>

          {license && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-ink-900 mb-4">授权范围</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-ink-500 mb-2">允许的项目类型</div>
                  <div className="flex flex-wrap gap-1.5">
                    {license.allowedProjectTypes.map((type) => (
                      <ProjectTypeBadge key={type} type={type} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-ink-500 mb-1">项目使用情况</div>
                  <div className="text-sm">
                    <span className="font-medium text-ink-900">{license.usedProjects}</span>
                    <span className="text-ink-500"> / {license.maxProjects} 个项目</span>
                  </div>
                  <div className="progress-bar mt-2">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min((license.usedProjects / license.maxProjects) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
