import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, ChevronDown, Server, Activity, ShieldCheck, Mail, Lock } from 'lucide-react';

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
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; opacity: 0; }
      `}</style>
      
      {/* LEFT PANEL — Visual Showcase */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 bg-[#0A0F1C]">
        
        {/* Background Image & Overlays */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1C]/95 via-[#0A0F1C]/80 to-[#112240]/60" />
        
        {/* Ambient Glow */}
        <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_rgba(49,87,213,0.12)_0%,_transparent_50%)] animate-pulse" style={{ animationDuration: '6s' }} />

        {/* Subtle Grid */}
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }} 
        />

        {/* Top Brand */}
        <div className="relative z-10 flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-base tracking-wide leading-none">NEXORA</div>
            <div className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-bold mt-1.5">Operations OS</div>
          </div>
        </div>

        {/* Center Copy & Visuals */}
        <div className="relative z-10 max-w-lg mt-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          
          <div className="flex items-center gap-2 mb-8 inline-flex px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-gray-300 font-semibold uppercase tracking-widest">Operations Control Center</span>
          </div>

          <h1 className="text-[44px] xl:text-[56px] font-bold text-white leading-[1.05] tracking-tight mb-6">
            One workspace.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Every operation.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed font-medium mb-12 max-w-md">
            Manage customers, inventory, sales, and operations from one connected enterprise workspace.
          </p>

          {/* Abstract Operational Cards */}
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex-1 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Real-time Sync</span>
              </div>
              <div className="w-3/4 h-1.5 bg-white/20 rounded-full mb-2.5" />
              <div className="w-1/2 h-1.5 bg-white/10 rounded-full" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex-1 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Secure Access</span>
              </div>
              <div className="w-2/3 h-1.5 bg-white/20 rounded-full mb-2.5" />
              <div className="w-1/3 h-1.5 bg-white/10 rounded-full" />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="relative z-10 flex justify-between items-center text-xs font-medium text-gray-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <span>Enterprise Grade Architecture</span>
          <span>© 2026 Nexora</span>
        </div>
      </div>

      {/* RIGHT PANEL — Authentication Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative w-full bg-[#FBFBFA]">
        {/* Subtle grid texture */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '32px 32px' 
          }} 
        />

        <div className="w-full max-w-[420px] relative z-10 flex flex-col h-full justify-center">
          
          {/* Header Context */}
          <div className="flex items-center justify-between mb-10 animate-fade-in">
            <div>
              <div className="text-gray-900 font-bold text-sm tracking-wide leading-none">NEXORA</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-semibold mt-1.5">Operations OS</div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-gray-200/80 bg-white">
              <div className="w-1.5 h-1.5 rounded-full bg-[#65795F]" />
              <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Workspace available</span>
            </div>
          </div>
          
          <div className="bg-white rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-200/60 p-8 lg:p-10 mb-8 animate-fade-in-up">
            
            <div className="mb-8">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-3">Welcome back</p>
              <h2 className="text-[22px] font-semibold text-gray-900 tracking-tight mb-2">Sign in to your workspace</h2>
              <p className="text-[13px] text-gray-500 font-medium">Use your company credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Email address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-gray-900">
                    <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-gray-700 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@company.com"
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-[13px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-gray-900">
                    <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-gray-700 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-[#F8F9FA] border border-gray-200 rounded-lg pl-10 pr-10 py-3 text-[13px] text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-md hover:bg-gray-200/50"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#B91C1C] rounded-lg px-4 py-3 text-[12px] flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-[#EF4444] shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-3 bg-[#1C1F26] hover:bg-[#2D3139] text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-sm shadow-[0_2px_4px_rgba(28,31,38,0.08)] hover:shadow-[0_4px_8px_rgba(28,31,38,0.12)] flex items-center justify-center active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </form>
          </div>
          
          <div className="flex items-center gap-3 px-2 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-6 h-6 rounded flex items-center justify-center border border-gray-200 bg-white shadow-sm">
              <Server className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div>
              <div className="text-[10px] text-gray-600 uppercase tracking-widest font-bold leading-none mb-1">Internal Operations Portal</div>
              <div className="text-[10px] text-gray-400 font-medium">Role-based workspace access</div>
            </div>
          </div>

          {/* Demo Credentials Accordion */}
          <div className="border border-gray-200/80 bg-white rounded-xl overflow-hidden animate-fade-in-up shadow-[0_2px_8px_rgba(0,0,0,0.02)]" style={{ animationDelay: '0.2s' }}>
            <button
              type="button"
              onClick={() => setShowDemo(s => !s)}
              className="w-full flex items-center justify-between p-4.5 lg:p-5 text-gray-700 hover:bg-gray-50 transition-colors group"
            >
              <div className="text-left">
                <div className="font-bold text-[10px] uppercase tracking-[0.15em] text-gray-900 mb-1">Demo Access</div>
                <div className="text-[11px] text-gray-500 font-medium">Preconfigured workspace roles</div>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${showDemo ? 'rotate-180' : ''}`} />
            </button>
            
            {showDemo && (
              <div className="border-t border-gray-100 divide-y divide-gray-100 bg-[#FAFAFA]">
                {DEMO_CREDS.map(cred => (
                  <button
                    key={cred.role}
                    onClick={() => fillDemo(cred)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-400 group-hover:text-gray-900 transition-colors shadow-sm">
                        <span className="text-[11px] font-bold">{cred.role.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors uppercase tracking-widest mb-0.5">{cred.role}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{cred.email}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Footer */}
          <div className="mt-12 text-center text-gray-400">
             <div className="text-[9px] font-bold uppercase tracking-widest mb-1.5 text-gray-500">NEXORA • Operations OS</div>
             <div className="text-[10px] font-medium">Secure internal operations portal</div>
          </div>

        </div>
      </div>
    </div>
  );
}

