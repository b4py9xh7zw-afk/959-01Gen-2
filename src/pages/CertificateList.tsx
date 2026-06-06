import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Search, Filter, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { certificates } from '../services/api';
import CertificateCard from '../components/CertificateCard';
import Empty from '../components/Empty';
import type { Certificate, ProjectType, LicenseStatus } from '@shared/types';
import { PROJECT_TYPE_LABELS, LICENSE_STATUS_LABELS } from '@shared/types';

const CertificateList: React.FC = () => {
  const navigate = useNavigate();
  const [certificatesList, setCertificatesList] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LicenseStatus | 'all'>(
    'all'
  );
  const [selectedType, setSelectedType] = useState<ProjectType | 'all'>('all');
  const [total, setTotal] = useState(0);

  const loadCertificates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await certificates.getCertificates({
        page: 1,
        pageSize: 20,
      });
      setCertificatesList(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Load certificates error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const handleExport = async (id: number) => {
    try {
      const blob = await certificates.exportCertificate(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cert = certificatesList.find((c) => c.id === id);
      a.download = `certificate-${cert?.certificateNumber || id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export certificate error:', error);
    }
  };

  const handleView = (id: number) => {
    navigate(`/certificates/${id}`);
  };

  const filteredCertificates = useMemo(() => {
    return certificatesList.filter((cert) => {
      const matchesSearch =
        cert.project?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        cert.certificateNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === 'all' || cert.license?.status === selectedStatus;
      const matchesType =
        selectedType === 'all' || cert.project?.type === selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [certificatesList, searchQuery, selectedStatus, selectedType]);

  const statusOptions: {
    value: LicenseStatus | 'all';
    label: string;
  }[] = [
    { value: 'all', label: '全部' },
    { value: 'active', label: LICENSE_STATUS_LABELS.active },
    { value: 'expiring', label: LICENSE_STATUS_LABELS.expiring },
    { value: 'expired', label: LICENSE_STATUS_LABELS.expired },
  ];

  const typeOptions: { value: ProjectType | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'website', label: PROJECT_TYPE_LABELS.website },
    { value: 'app', label: PROJECT_TYPE_LABELS.app },
    { value: 'packaging', label: PROJECT_TYPE_LABELS.packaging },
    { value: 'advertising', label: PROJECT_TYPE_LABELS.advertising },
  ];

  const sortedCertificates = useMemo(() => {
    return [...filteredCertificates].sort(
      (a, b) =>
        new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );
  }, [filteredCertificates]);

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
        <h1 className="text-3xl font-bold text-ink-800 mb-2">授权证明</h1>
        <p className="text-ink-500">查看和管理您的字体授权证书</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              placeholder="搜索项目名称或证书编号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-ink-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 outline-none transition-all duration-200 text-ink-800"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-ink-400" />
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as LicenseStatus | 'all')
                }
                className="px-4 py-3 rounded-xl border-2 border-ink-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 outline-none transition-all duration-200 text-ink-800 bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {typeOptions.map((type) => (
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gold-50 rounded-lg">
              <Award className="w-5 h-5 text-gold-600" />
            </div>
            <span className="text-ink-500 text-sm">总计</span>
          </div>
          <p className="text-3xl font-bold text-ink-800">{total}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-ink-500 text-sm">有效</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {
              certificatesList.filter((c) => c.license?.status === 'active')
                .length
            }
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-ink-500 text-sm">即将过期</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {
              certificatesList.filter((c) => c.license?.status === 'expiring')
                .length
            }
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-card border border-ink-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <Award className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-ink-500 text-sm">已过期</span>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {
              certificatesList.filter((c) => c.license?.status === 'expired')
                .length
            }
          </p>
        </div>
      </div>

      {sortedCertificates.length === 0 ? (
        <Empty
          title="暂无授权证明"
          description="您还没有任何字体授权证书"
        />
      ) : (
        <div className="pl-2">
          {sortedCertificates.map((cert, index) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              onView={handleView}
              onExport={handleExport}
              isLast={index === sortedCertificates.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateList;
