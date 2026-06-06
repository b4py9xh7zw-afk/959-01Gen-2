import React, { useEffect, useState, useCallback } from 'react';
import {
  useParams,
  useNavigate,
} from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Award,
  Calendar,
  User,
  FileText,
  Hash,
  Globe,
  Smartphone,
  Package,
  Megaphone,
  Shield,
  FileJson,
  FileDown,
  Type,
} from 'lucide-react';
import { formatDate } from '../utils/format';
import { certificates } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ProjectTypeBadge from '../components/ProjectTypeBadge';
import Empty from '../components/Empty';
import type { Certificate, ProjectType } from '@shared/types';
import {
  PROJECT_TYPE_LABELS,
  FONT_WEIGHT_LABELS,
} from '@shared/types';

const iconMap: Record<ProjectType, React.ElementType> = {
  website: Globe,
  app: Smartphone,
  packaging: Package,
  advertising: Megaphone,
};

const CertificateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadCertificate = useCallback(async () => {
    try {
      setLoading(true);
      const data = await certificates.getCertificateById(Number(id));
      setCertificate(data);
    } catch (error) {
      console.error('Load certificate error:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadCertificate();
    }
  }, [id, loadCertificate]);

  const handleExport = async (format: 'json' | 'pdf') => {
    try {
      setExporting(true);
      const blob = await certificates.exportCertificate(Number(id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'json' ? 'json' : 'pdf';
      a.download = `certificate-${certificate?.certificateNumber || id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export certificate error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <Empty title="证书不存在" description="请检查链接是否正确" />
    );
  }

  const project = certificate.project;
  const font = certificate.font;
  const license = certificate.license;

  const SceneIcon = project ? iconMap[project.type] : Globe;

  return (
    <div className="animate-fade-in print:animate-none">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-ink-500 hover:text-gold-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回证书列表
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl font-medium text-ink-700 bg-ink-50 hover:bg-ink-100 flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
          >
            <FileJson className="w-5 h-5" />
            导出 JSON
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl font-medium text-ink-700 bg-ink-50 hover:bg-ink-100 flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
          >
            <FileDown className="w-5 h-5" />
            导出 PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-gold"
          >
            <Printer className="w-5 h-5" />
            打印
          </button>
        </div>
      </div>

      <div className="relative" id="certificate-content">
        <div
          className="relative bg-gradient-to-br from-ink-800 via-ink-900 to-ink-800 rounded-3xl p-1 overflow-hidden"
          style={{
            boxShadow:
              '0 0 60px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(212, 175, 55, 0.4) 10px,
                rgba(212, 175, 55, 0.4) 20px
              )`,
            }}
          />

          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.8) 0%, transparent 40%),
                                  radial-gradient(circle at 70% 80%, rgba(212, 175, 55, 0.6) 0%, transparent 40%)`,
              }}
            />
          </div>

          <div
            className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-3xl p-12 md:p-16"
            style={{
              border: '4px solid transparent',
              backgroundImage: `linear-gradient(white, white),
                               linear-gradient(135deg, #d4af37 0%, #f2dea6 25%, #d4af37 50%, #936d1e 75%, #d4af37 100%)`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl opacity-3 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <div className="relative">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 mb-6 shadow-gold">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-ink-800 mb-3 font-display">
                  字体授权证书
                </h1>
                <p className="text-ink-500 text-lg">Font License Certificate</p>
              </div>

              <div className="flex items-center justify-center gap-3 mb-12">
                <Hash className="w-5 h-5 text-gold-600" />
                <span className="font-mono text-lg text-ink-700 tracking-wider">
                  {certificate.certificateNumber}
                </span>
                {license && <StatusBadge status={license.status} />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gold-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-gold-100 rounded-lg">
                        <FileText className="w-5 h-5 text-gold-600" />
                      </div>
                      <h2 className="text-lg font-bold text-ink-800">
                        项目信息
                      </h2>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-ink-500">项目名称</span>
                        <span className="font-semibold text-ink-800">
                          {project?.name || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ink-500">项目类型</span>
                        {project && (
                          <ProjectTypeBadge type={project.type} />
                        )}
                      </div>
                      {project?.description && (
                        <div>
                          <span className="text-ink-500 block mb-1">
                            项目描述
                          </span>
                          <p className="text-ink-800 text-sm">
                            {project.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gold-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-gold-100 rounded-lg">
                        <Type className="w-5 h-5 text-gold-600" />
                      </div>
                      <h2 className="text-lg font-bold text-ink-800">
                        字体信息
                      </h2>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-ink-500">字体名称</span>
                        <span className="font-semibold text-ink-800">
                          {font?.name || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">字体系列</span>
                        <span className="text-ink-800">
                          {font?.family || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">字重</span>
                        <span className="text-ink-800">
                          {font?.weights
                            .map(
                              (w) =>
                                FONT_WEIGHT_LABELS[w] || w.toString()
                            )
                            .join(', ') || '-'}
                        </span>
                      </div>
                    </div>

                    {font && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-ink-50 to-ink-100 rounded-xl text-center">
                        <p
                          className="text-4xl text-ink-800"
                          style={{ fontFamily: font.family }}
                        >
                          Aa
                        </p>
                        <p className="text-xs text-ink-500 mt-1">
                          字体预览
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gold-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-gold-100 rounded-lg">
                        <Shield className="w-5 h-5 text-gold-600" />
                      </div>
                      <h2 className="text-lg font-bold text-ink-800">
                        授权信息
                      </h2>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-ink-500">授权方</span>
                        <span className="font-semibold text-ink-800">
                          字体授权平台
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ink-500">使用范围</span>
                        {project && (
                          <div className="flex items-center gap-1.5 text-ink-700">
                            <SceneIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {PROJECT_TYPE_LABELS[project.type]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">授权日期</span>
                        <span className="text-ink-800">
                          {formatDate(certificate.issuedAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-500">有效期至</span>
                        <span className="text-ink-800">
                          {formatDate(certificate.validTo)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gold-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-gold-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-gold-600" />
                      </div>
                      <h2 className="text-lg font-bold text-ink-800">
                        有效期
                      </h2>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-ink-800 mb-2">
                        {formatDate(certificate.validFrom)}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-gold-600 my-2">
                        <div className="h-px w-12 bg-gold-300" />
                        <span className="text-sm">至</span>
                        <div className="h-px w-12 bg-gold-300" />
                      </div>
                      <p className="text-3xl font-bold text-ink-800">
                        {formatDate(certificate.validTo)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-ink-50 via-amber-50 to-ink-50 rounded-2xl p-8 mb-12 border border-gold-200">
                <h3 className="text-lg font-bold text-ink-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gold-600" />
                  法律声明
                </h3>
                <div className="text-ink-600 text-sm leading-relaxed space-y-3">
                  <p>
                    1. 本证书授予持证人在授权范围内使用指定字体的非独占、不可转让的使用权。
                  </p>
                  <p>
                    2. 字体文件仅限于本证书所列项目使用，不得用于其他项目或转授权给第三方。
                  </p>
                  <p>
                    3. 持证人不得对字体文件进行修改、反向工程、 decompile 或 disassemble。
                  </p>
                  <p>
                    4. 授权期满后，持证人应立即停止使用该字体并销毁所有副本。
                  </p>
                  <p>
                    5. 违反本声明将承担相应的法律责任，我方保留追究法律责任的权利。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gold-200">
                  <h3 className="text-lg font-bold text-ink-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gold-600" />
                    授权方签名
                  </h3>
                  <div className="flex items-center justify-center h-24 bg-gradient-to-br from-gold-50 to-amber-100 rounded-xl">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-ink-800">
                        字体授权平台
                      </p>
                      <p className="text-xs text-ink-500 mt-1">
                        {formatDate(certificate.issuedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gold-200">
                  <h3 className="text-lg font-bold text-ink-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gold-600" />
                    数字签名
                  </h3>
                  <div className="bg-ink-900 rounded-xl p-4 font-mono text-xs text-green-400 overflow-hidden">
                    <p className="truncate">
                      SHA256: {certificate.digitalSignature}
                    </p>
                    <p className="text-ink-500 mt-2">
                      签发时间: {formatDate(certificate.issuedAt, 'YYYY-MM-DD HH:mm:ss')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center text-ink-400 text-sm">
                <p>
                  本证书由字体授权平台自动生成，具备法律效力。
                </p>
                <p className="mt-1">
                  验证真伪请访问官方网站并输入证书编号查询。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:animate-none {
            animation: none !important;
          }
          #certificate-content {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateDetail;
