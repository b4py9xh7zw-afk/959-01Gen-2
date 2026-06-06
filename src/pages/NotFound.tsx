import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-50 to-ink-100 p-6">
      <div className="text-center max-w-md animate-fade-in-up">
        <div className="relative mb-8">
          <h1 className="font-display text-[120px] font-bold text-ink-200 leading-none animate-float">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold animate-pulse-slow">
              <span className="font-display text-4xl font-bold text-ink-900">?</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-ink-900 mb-3">页面未找到</h2>
        <p className="text-ink-500 mb-8">
          抱歉，您访问的页面不存在或已被移除。请检查URL是否正确，或返回首页继续浏览。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="btn-outline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回上一页
          </button>
          <Link to="/" className="btn-gold flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            返回首页
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-ink-300">
          <div className="h-px w-16 bg-ink-200" />
          <span className="font-display text-sm tracking-widest uppercase">FontLicense</span>
          <div className="h-px w-16 bg-ink-200" />
        </div>
      </div>
    </div>
  );
}
