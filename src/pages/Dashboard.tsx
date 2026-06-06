import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Clock,
  FolderKanban,
  Download,
  Plus,
  ShoppingCart,
  FileText,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { stats } from '../services/api';
import StatCard from '../components/StatCard';
import ActivityTimeline from '../components/ActivityTimeline';
import { PROJECT_TYPE_LABELS } from '@shared/types';
import type { DashboardStats, ProjectType, UserRole } from '@shared/types';

const COLORS = ['#d4af37', '#e94560', '#2d6a4f', '#4a4a7a'];

const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl h-36" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl h-96" />
      <div className="bg-white rounded-xl h-96" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await stats.getDashboardStats();
        setStatsData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!statsData || !user) {
    return null;
  }

  const pieData = Object.entries(statsData.licenseByType).map(([type, count]) => ({
    name: PROJECT_TYPE_LABELS[type as ProjectType],
    value: count,
  }));

  const quickActions = getQuickActions(user.role as UserRole, navigate);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总授权数"
          value={statsData.totalLicenses}
          icon={<ShieldAlert className="w-6 h-6 text-gold-500" />}
          color="gold"
          trend={{ value: 12, isUp: true }}
        />
        <StatCard
          title="即将过期数"
          value={statsData.expiringLicenses}
          icon={<Clock className="w-6 h-6 text-coral-500" />}
          color="coral"
          trend={{ value: 5, isUp: false }}
        />
        <StatCard
          title="活跃项目数"
          value={statsData.activeProjects}
          icon={<FolderKanban className="w-6 h-6 text-forest-500" />}
          color="forest"
          trend={{ value: 8, isUp: true }}
        />
        <StatCard
          title="本月下载量"
          value={statsData.monthlyDownloads}
          icon={<Download className="w-6 h-6 text-ink-500" />}
          color="ink"
          trend={{ value: 15, isUp: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-ink-900">授权按项目类型分布</h3>
          </div>
          <div className="h-80">
            {pieData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-ink-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-ink-900 mb-4">快捷操作</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-ink-50 hover:bg-ink-100 text-ink-700 hover:text-ink-900 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-ink-400">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-ink-900 mb-6">近期活动</h3>
        <ActivityTimeline activities={statsData.recentActivities} />
      </div>
    </div>
  );
};

function getQuickActions(role: UserRole, navigate: ReturnType<typeof useNavigate>) {
  const actions = [];

  if (role === 'brand') {
    actions.push({
      title: '购买字体',
      description: '浏览字体市场',
      icon: <ShoppingCart className="w-5 h-5 text-gold-500" />,
      onClick: () => navigate('/fonts'),
    });
  }

  actions.push({
    title: '创建项目',
    description: '新建授权项目',
    icon: <Plus className="w-5 h-5 text-forest-500" />,
    onClick: () => navigate('/projects/new'),
  });

  actions.push({
    title: '查看授权',
    description: '管理授权证书',
    icon: <FileText className="w-5 h-5 text-ink-500" />,
    onClick: () => navigate('/certificates'),
  });

  if (role === 'designer') {
    actions.push({
      title: '下载字体',
      description: '下载已购字体',
      icon: <Download className="w-5 h-5 text-coral-500" />,
      onClick: () => navigate('/downloads'),
    });
  }

  return actions;
}

export default Dashboard;
