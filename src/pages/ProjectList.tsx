import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, FileWarning } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { projects } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import ProjectCard from '@/components/ProjectCard';
import StatusBadge from '@/components/StatusBadge';
import ProjectTypeBadge from '@/components/ProjectTypeBadge';
import ConfirmModal from '@/components/ConfirmModal';
import type { Project, ProjectType } from '../../shared/types';
import { PROJECT_TYPE_LABELS } from '../../shared/types';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isBrand = user?.role === 'brand';

  const [loading, setLoading] = useState(true);
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [archiveModal, setArchiveModal] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        pageSize,
      };
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await projects.getProjects(params);
      setProjectsData(response.data);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, typeFilter, searchQuery]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleTypeFilterChange = (type: ProjectType | 'all') => {
    setTypeFilter(type);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleArchiveProject = async () => {
    if (!archiveModal) return;
    try {
      await projects.archiveProject(archiveModal.id);
      setArchiveModal(null);
      fetchProjects();
    } catch (error) {
      console.error('Failed to archive project:', error);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const filteredProjects = projectsData.filter((project) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">项目管理</h1>
          <p className="text-ink-500 mt-1">管理您的字体使用项目</p>
        </div>
        {isBrand && (
          <button
            onClick={() => navigate('/projects/new')}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建项目
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-ink-400" />
              <span className="text-sm text-ink-600">类型筛选：</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleTypeFilterChange('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  typeFilter === 'all'
                    ? 'bg-ink-800 text-white'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                )}
              >
                全部
              </button>
              {(Object.keys(PROJECT_TYPE_LABELS) as ProjectType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeFilterChange(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                    typeFilter === type
                      ? 'bg-ink-800 text-white'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  )}
                >
                  {PROJECT_TYPE_LABELS[type]}
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
                placeholder="搜索项目名称或描述..."
                className="input pl-10 w-full lg:w-64"
              />
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-ink-200 border-t-gold-500 rounded-full mx-auto mb-4" />
          <p className="text-ink-500">加载中...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card p-12 text-center">
          <FileWarning className="w-12 h-12 text-ink-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ink-700 mb-2">暂无项目数据</h3>
          <p className="text-ink-500 mb-6">
            {searchQuery || typeFilter !== 'all'
              ? '没有找到符合条件的项目，请尝试其他筛选条件'
              : isBrand
              ? '您还没有创建任何项目，点击上方按钮创建第一个项目'
              : '暂无已分配的项目'}
          </p>
          {isBrand && (
            <button
              onClick={() => navigate('/projects/new')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建项目
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                onArchive={(p) => setArchiveModal(p)}
                showArchive={isBrand}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 card">
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

      <ConfirmModal
        isOpen={!!archiveModal}
        onClose={() => setArchiveModal(null)}
        onConfirm={handleArchiveProject}
        title="归档项目"
        confirmText="确认归档"
        message={`确定要归档项目"${archiveModal?.name}"吗？归档后该项目将不再显示在列表中。`}
      />
    </div>
  );
};

export default ProjectList;
