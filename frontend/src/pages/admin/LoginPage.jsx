import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Landmark, Loader2, AlertCircle, Shield, ArrowLeft, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@punefestival.com', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080c14] relative overflow-hidden font-['Plus_Jakarta_Sans']">
      
      {/* Background ambient lighting */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 50% at 50% 30%, rgba(245, 158, 11, 0.1) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 80% 80%, rgba(217, 119, 6, 0.05) 0%, transparent 60%)
          `
        }}
      />

      <div className="w-full max-w-md relative z-10">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Public Gallery
        </Link>

        {/* Login Card */}
        <div className="dark-panel rounded-3xl p-8 sm:p-10 shadow-2xl border border-amber-500/30 relative">
          
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <img
              src="/logo.png"
              alt="Pune Festival Official Logo"
              className="w-20 h-20 object-contain mx-auto mb-4 bg-white/5 border border-amber-500/30 p-1.5 rounded-2xl shadow-xl shadow-amber-500/20"
            />
            
            <h1 className="font-['Cinzel'] text-2xl font-extrabold text-white tracking-wide">
              ADMIN PORTAL
            </h1>
            <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mt-1">
              Pune Festival Gallery
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-300 text-xs">
              <AlertCircle size={16} className="flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-dark pl-10 text-xs"
                  placeholder="admin@punefestival.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input-dark pl-10 text-xs"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center !py-3 mt-4 text-xs font-extrabold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Authenticating...</>
              ) : (
                <><Shield size={16} className="stroke-[2.5]" /> Sign In</>
              )}
            </button>
          </form>

          {/* Default Credentials Hint */}
          <div className="mt-8 pt-5 border-t border-white/5 text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              Default credentials: <span className="text-amber-400/90 font-mono">admin@punefestival.com</span> / <span className="text-amber-400/90 font-mono">Admin@123</span>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
