import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, Palette, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/Toast';
import { cn } from '@/lib/utils';
import type { UserRole } from '../../shared/types';

const sampleFonts = [
  { name: 'Playfair Display', text: '优雅的衬线字体', weight: 'font-display' },
  { name: 'Inter', text: '现代无衬线字体', weight: 'font-sans' },
  { name: 'JetBrains Mono', text: '精致的等宽字体', weight: 'font-mono' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'brand' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentFontIndex, setCurrentFontIndex] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFontIndex((prev) => (prev + 1) % sampleFonts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少6位';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const success = await login(formData);
      if (success) {
        toast.success('登录成功！欢迎回来');
        const from = (location.state as { from?: string })?.from || '/dashboard';
        navigate(from, { replace: true });
      } else {
        toast.error('登录失败，请检查邮箱或密码');
      }
    } catch (error) {
      toast.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email: string, role: UserRole) => {
    setFormData({ email, password: 'password123', role });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 relative overflow-hidden">
        <div className="absolute inset-0 grain opacity-30" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-gold-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl animate-pulse-slow animate-delay-500" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-gold-500/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-gold-500/10 rounded-full" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="text-center mb-12 animate-fade-in-down">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold">
              <span className="font-display font-bold text-4xl text-ink-900">F</span>
            </div>
            <h1 className="font-display text-5xl font-bold text-white mb-3">
              Font<span className="text-gradient-gold">License</span>
            </h1>
            <p className="text-ink-400 text-lg">专业的字体授权管理平台</p>
          </div>

          <div className="relative w-full max-w-md h-48 animate-fade-in-up">
            <div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out">
              <div
                key={currentFontIndex}
                className={cn(
                  'text-center transition-all duration-500 animate-fade-in-up'
                )}
              >
                <p className={cn('text-4xl font-bold text-white mb-2', sampleFonts[currentFontIndex].weight)}>
                  {sampleFonts[currentFontIndex].text}
                </p>
                <p className="text-gold-400 text-sm tracking-widest uppercase">
                  {sampleFonts[currentFontIndex].name}
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2">
              {sampleFonts.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    index === currentFontIndex ? 'bg-gold-500 w-6' : 'bg-ink-600'
                  )}
                  onClick={() => setCurrentFontIndex(index)}
                />
              ))}
            </div>
          </div>

          <div className="mt-16 flex items-center gap-3 text-ink-500 animate-fade-in animate-delay-300">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span className="text-sm">让每一个字都闪耀价值</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-ink-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8 animate-fade-in-down">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold">
              <span className="font-display font-bold text-3xl text-ink-900">F</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-ink-900">
              Font<span className="text-gradient-gold">License</span>
            </h1>
          </div>

          <div className="card p-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-ink-900 mb-2">欢迎回来</h2>
            <p className="text-ink-500 mb-6">请登录您的账户以继续</p>

            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'brand' })}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all duration-200',
                  formData.role === 'brand'
                    ? 'border-gold-500 bg-gold-50 text-gold-700'
                    : 'border-ink-200 text-ink-600 hover:border-ink-300'
                )}
              >
                <Building2 className="w-5 h-5" />
                <span className="font-medium">品牌方</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'designer' })}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all duration-200',
                  formData.role === 'designer'
                    ? 'border-gold-500 bg-gold-50 text-gold-700'
                    : 'border-ink-200 text-ink-600 hover:border-ink-300'
                )}
              >
                <Palette className="w-5 h-5" />
                <span className="font-medium">设计师</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">邮箱地址</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className={cn(
                      'input pl-11',
                      errors.email && 'border-coral-500 focus:ring-coral-500 focus:border-coral-500'
                    )}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-coral-600">{errors.email}</p>}
              </div>

              <div>
                <label className="label">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="请输入密码"
                    className={cn(
                      'input pl-11 pr-11',
                      errors.password && 'border-coral-500 focus:ring-coral-500 focus:border-coral-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-coral-600">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'btn-gold w-full py-3 text-base',
                  loading && 'opacity-70 cursor-not-allowed'
                )}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    登录中...
                  </span>
                ) : (
                  '登 录'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-ink-100">
              <p className="text-xs text-ink-500 mb-3">测试账号：</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('brand@example.com', 'brand')}
                  className="w-full text-left text-xs p-2 rounded-lg bg-ink-50 hover:bg-ink-100 text-ink-600 transition-colors"
                >
                  <span className="font-medium text-ink-800">品牌方：</span>
                  brand@example.com / password123
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('designer@example.com', 'designer')}
                  className="w-full text-left text-xs p-2 rounded-lg bg-ink-50 hover:bg-ink-100 text-ink-600 transition-colors"
                >
                  <span className="font-medium text-ink-800">设计师：</span>
                  designer@example.com / password123
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
