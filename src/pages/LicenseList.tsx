import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, FileWarning } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { licenses } from '@/services/api';
import LicenseTable from '@/components/LicenseTable';
import StatusBadge from '@/components/StatusBadge';
import ProjectTypeBadge from '@/components/ProjectTypeBadge';
import type { License, LicenseStatus, ProjectType } from '../../shared/types';
import { LICENSE_STATUS_LABELS, PROJECT_TYPE_LABELS } from '../../shared/types';

const LicenseList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [licensesData, setLicensesData] = useState<License[]>([]);
  const [statusFilter, setStatusFilter] = useState<LicenseStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        pageSize,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await licenses.getLicenses(params);
      setLicensesData(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch licenses:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, searchQuery]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const handleStatusFilterChange = (status: LicenseStatus | 'all') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleViewLicense = (license: License) => {
    navigate(`/licenses/${license.id}`);
  };

  const handleRenewLicense = (license: License) => {
    navigate(`/licenses/${license.id}?action=renew`);
  };

  const totalPages = Math.ceil(total / pageSize);

  const filteredLicenses = licensesData.filter((license) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      license.font?.name?.toLowerCase().includes(searchLower) ||
      license.font?.family?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">授权管理</h1>
          <p className="text-ink-500 mt-1">管理您购买的字体授权</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-ink-400" />
              <span className="text-sm text-ink-600">状态筛选：</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleStatusFilterChange('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  statusFilter === 'all'
                    ? 'bg-ink-800 text-white'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                )}
              >
                全部
              </button>
              {(['active', 'expiring', 'expired'] as LicenseStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    statusFilter === status
                      ? 'bg-ink-800 text-white'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  )}
                >
                  {LICENSE_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearch} className="w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索字体名称..."
                className="input pl-10 w-full lg:w-64"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-ink-200 border-t-gold-500 rounded-full mx-auto mb-4" />
            <p className="text-ink-500">加载中...</p>
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="p-12 text-center">
            <FileWarning className="w-12 h-12 text-ink-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-ink-700 mb-2">暂无授权数据</h3>
            <p className="text-ink-500">
              {searchQuery || statusFilter !== 'all'
                ? '没有找到符合条件的授权，请尝试其他筛选条件'
                : '您还没有购买任何字体授权'}
            </p>
          </div>
        ) : (
          <>
            <LicenseTable
              licenses={filteredLicenses}
              onView={handleViewLicense}
              onRenew={handleRenewLicense}
            />

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100 bg-ink-50">
                <div className="text-sm text-ink-500">
                  共 {total} 条，第 {page} / {totalPages} 页
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-outline px-2.5 py-1.5 text-sm disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                          page === pageNum
                            ? 'bg-ink-800 text-white'
                            : 'text-ink-600 hover:bg-ink-100'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-outline px-2.5 py-1.5 text-sm disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LicenseList;
