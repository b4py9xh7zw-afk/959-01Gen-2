import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FileKey,
  FolderKanban,
  Award,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { UserRole } from '../../shared/types';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: '仪表盘',
    path: '/dashboard',
    roles: ['brand', 'designer'],
  },
  {
    icon: ShoppingBag,
    label: '字体市场',
    path: '/fonts',
    roles: ['brand'],
  },
  {
    icon: FileKey,
    label: '授权管理',
    path: '/licenses',
    roles: ['brand'],
  },
  {
    icon: Download,
    label: '字体下载',
    path: '/downloads',
    roles: ['designer'],
  },
  {
    icon: FolderKanban,
    label: '项目管理',
    path: '/projects',
    roles: ['brand', 'designer'],
  },
  {
    icon: Award,
    label: '授权证明',
    path: '/certificates',
    roles: ['brand', 'designer'],
  },
];

interface SidebarProps {
  userRole: UserRole;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-ink-900 text-white flex flex-col transition-all duration-300 ease-in-out z-40',
        collapsed ? 'w-20' : 'w-[260px]'
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-ink-800">
        <div className={cn('flex items-center gap-3 overflow-hidden', collapsed && 'justify-center w-full')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-lg text-ink-900">F</span>
          </div>
          <div
            className={cn('overflow-hidden transition-all duration-300', collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100')}
          >
            <h1 className="font-display font-bold text-lg whitespace-nowrap">FontLicense</h1>
            <p className="text-xs text-ink-400 whitespace-nowrap">字体授权平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1 px-3">
          {filteredItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li
                key={item.path}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'sidebar-link group',
                      isActive ? 'sidebar-link-active' : 'sidebar-link',
                      collapsed && 'justify-center'
                    )
                  }
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0')} />
                  <span
                    className={cn(
                      'text-sm font-medium transition-all duration-300 whitespace-nowrap',
                      collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                    )}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-ink-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-ink-800 text-ink-400 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
