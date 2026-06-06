import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronRight, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../../shared/types';
import { cn } from '@/lib/utils';

const breadcrumbMap: Record<string, string> = {
  dashboard: '仪表盘',
  fonts: '字体市场',
  licenses: '授权管理',
  projects: '项目管理',
  downloads: '字体下载',
  certificates: '授权证明',
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPage = pathSegments[0] || 'dashboard';
  const pageTitle = breadcrumbMap[currentPage] || '首页';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar userRole={user.role as UserRole} />

      <div className="lg:ml-[260px] transition-all duration-300">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-ink-200 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-ink-100 text-ink-600"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Home className="w-4 h-4 text-ink-400" />
              <ChevronRight className="w-4 h-4 text-ink-300" />
              <span className="text-ink-600">{pageTitle}</span>
            </div>
            <h2 className="sm:hidden font-semibold text-ink-900">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-ink-900" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-ink-900">{user.name}</p>
                  <p className="text-xs text-ink-500">
                    {user.role === 'brand' ? '品牌方' : '设计师'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-ink-100 text-ink-600 hover:text-coral-600 transition-colors"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>

      <div
        className={cn(
          'fixed inset-0 bg-ink-900/60 z-40 lg:hidden transition-opacity duration-300',
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={cn(
          'fixed left-0 top-0 h-full w-[260px] bg-ink-900 z-50 lg:hidden transform transition-transform duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar userRole={user.role as UserRole} />
      </div>
    </div>
  );
}
