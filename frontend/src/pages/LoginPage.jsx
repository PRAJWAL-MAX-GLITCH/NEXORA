import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, ChevronDown, Server, Activity, ArrowRight, ShieldCheck } from 'lucide-react';

const DEMO_CREDS = [
  { role: 'Admin', email: 'admin@erp.com', password: 'password123' },
  { role: 'Sales', email: 'sales@erp.com', password: 'password123' },
  { role: 'Warehouse', email: 'warehouse@erp.com', password: 'password123' },
  { role: 'Accounts', email: 'accounts@erp.com', password: 'password123' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => {
    setForm({ email: cred.email, password: cred.password });
    setShowDemo(false);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      
      {/* LEFT PANEL — Deep Navy Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#090B10] flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Background Gradients & Textures */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-[#090B10] to-[#090B10]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(49,87,213,0.15)_0%,_transparent_50%)]" />
        
        {/* Subtle Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }} 
        />

        {/* Top Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/50 group transition-transform hover:scale-105 duration-300">
            <Server className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wide">NEXORA</div>
            <div className="text-[9px] text-blue-300/80 uppercase tracking-[0.2em] font-bold">Operations OS</div>
          </div>
        </div>

        {/* Center Abstract Visualization & Copy */}
        <div className="relative z-10 max-w-lg mx-auto w-full mt-12">
          
          <div className="mb-16">
            <h1 className="text-[40px] font-bold text-white leading-[1.1] tracking-tight mb-5">
              One workspace.<br />
              <span className="text-gray-400">Every operation.</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md font-medium">
              Manage customers, inventory and sales from one connected enterprise workspace.
            </p>
          </div>

          {/* Abstract Floating UI Preview */}
          <div className="relative h-[280px] w-full rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl overflow-hidden p-6 hover:-translate-y-1 transition-transform duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80" />
            
            {/* Fake Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="w-32 h-3 bg-white/10 rounded-full" />
              <div className="w-8 h-8 bg-white/5 rounded-full" />
            </div>

            {/* Fake Chart Lines (CSS drawn) */}
            <div className="relative h-[80px] w-full mb-8 flex items-end justify-between gap-2 opacity-60">
              {[40, 70, 45, 90, 60, 85, 100, 75, 50, 80].map((h, i) => (
                <div key={i} className="w-full bg-blue-500/20 rounded-t-sm" style={{ height: `${h}%` }}>
                  <div className="w-full bg-blue-400 rounded-t-sm opacity-50 transition-all duration-1000" style={{ height: '2px' }} />
                </div>
              ))}
              {/* Overlay glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] to-transparent opacity-80" />
            </div>

            {/* Floating Decorative Cards */}
            <div className="flex gap-4">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 transform transition-transform hover:-translate-y-1 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-3 h-3 text-blue-400" />
                  <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Preview Metrics</div>
                </div>
                <div className="w-16 h-2 bg-white/10 rounded-full mb-2" />
                <div className="w-24 h-2 bg-white/5 rounded-full" />
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 transform transition-transform hover:-translate-y-1 duration-300 delay-75">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">System Status</div>
                </div>
                <div className="w-20 h-2 bg-white/10 rounded-full mb-2" />
                <div className="w-12 h-2 bg-white/5 rounded-full" />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="relative z-10 flex justify-between items-center text-xs font-medium text-gray-500">
          <span>Secure internal operations portal</span>
          <span>© 2026 Nexora</span>
        </div>
      </div>

      {/* RIGHT PANEL — Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-[400px]">
          
          {/* Mobile brand (hidden on desktop) */}
          <div className="flex items-center gap-3 mb-10 lg:hidden justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Server className="w-4 h-4 text-white" />
            </div>
            <div className="text-gray-900 font-bold text-lg tracking-wide">NEXORA</div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <p className="text-[11px] text-gray-500 uppercase tracking-[0.15em] font-bold mb-3">Welcome back</p>
            <h2 className="text-2xl lg:text-[28px] font-bold text-gray-900 tracking-tight mb-2">Sign in to your workspace</h2>
            <p className="text-sm text-gray-500">Use your company credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@company.com"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-md hover:bg-gray-100"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-red-500 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 bg-[#0A2540] hover:bg-[#0A2540]/90 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Demo Credentials Accordion */}
          <div className="mt-8 border border-gray-100 bg-gray-50/50 rounded-xl overflow-hidden transition-all duration-300">
            <button
              type="button"
              onClick={() => setShowDemo(s => !s)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm text-gray-700 hover:bg-gray-100/50 transition-colors"
            >
              <span className="font-medium text-xs">View demo credentials</span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${showDemo ? 'rotate-180' : ''}`} />
            </button>
            
            {showDemo && (
              <div className="border-t border-gray-100 divide-y divide-gray-100 bg-white">
                {DEMO_CREDS.map(cred => (
                  <button
                    key={cred.role}
                    onClick={() => fillDemo(cred)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-blue-50/50 group transition-colors text-left"
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{cred.role}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 font-mono">{cred.email}</div>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                      Use <ArrowRight className="h-3 w-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center lg:hidden">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
              Secure internal operations portal
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
