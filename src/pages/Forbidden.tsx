import { Link } from 'react-router-dom';
import { Lock, LayoutDashboard, Shield } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-50 to-ink-100 p-6">
      <div className="text-center max-w-md animate-fade-in-up">
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-coral-100 flex items-center justify-center">
            <Shield className="w-16 h-16 text-coral-500 animate-pulse-slow" />
          </div>
          <div className="absolute top-0 right-1/2 translate-x-8">
            <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
              <Lock className="w-6 h-6 text-gold-600" />
            </div>
          </div>
        </div>

        <h1 className="font-display text-5xl font-bold text-coral-600 mb-3">403</h1>
        <h2 className="text-2xl font-bold text-ink-900 mb-3">权限不足</h2>
        <p className="text-ink-500 mb-8">
          抱歉，您没有权限访问此页面。该页面可能仅对特定角色开放。
          如需访问，请联系管理员获取相应权限。
        </p>

        <Link
          to="/dashboard"
          className="btn-gold inline-flex items-center justify-center gap-2"
        >
          <LayoutDashboard className="w-4 h-4" />
          返回仪表盘
        </Link>

        <div className="mt-12 p-4 rounded-lg bg-white border border-ink-100">
          <p className="text-xs text-ink-500">
            <span className="font-medium text-ink-700">提示：</span>
            某些功能可能仅对品牌方或设计师角色开放。
            如果您认为这是错误，请使用相应角色的账号重新登录。
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-ink-300">
          <div className="h-px w-16 bg-ink-200" />
          <span className="font-display text-sm tracking-widest uppercase">FontLicense</span>
          <div className="h-px w-16 bg-ink-200" />
        </div>
      </div>
    </div>
  );
}
