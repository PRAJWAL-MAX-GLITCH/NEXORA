import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Users, Package, FileText, LayoutDashboard } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const commands = [
    { label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { label: 'Search Customers', icon: Users, action: () => navigate('/customers') },
    { label: 'Add New Customer', icon: Users, action: () => navigate('/customers/new') },
    { label: 'Search Products', icon: Package, action: () => navigate('/products') },
    { label: 'Inventory Overview', icon: Package, action: () => navigate('/inventory') },
    { label: 'Create Challan', icon: FileText, action: () => navigate('/challans/new') },
    { label: 'View All Challans', icon: FileText, action: () => navigate('/challans') },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (action) => {
    action();
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-xl bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-5 py-4 border-b border-white/8">
          <Search className="h-4 w-4 text-white/40 mr-3 flex-shrink-0" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-sm"
            placeholder="Search commands or navigate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd className="text-[10px] text-white/30 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono">esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/30 text-sm">No commands found.</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={i}
                onClick={() => handleSelect(cmd.action)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/8 text-white/60 hover:text-white transition-colors group text-left"
              >
                <cmd.icon className="h-4 w-4 text-white/25 group-hover:text-white/70 flex-shrink-0" />
                <span className="text-sm font-medium">{cmd.label}</span>
              </button>
            ))
          )}
        </div>
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">MINI ERP · Command Palette</span>
          <div className="flex items-center gap-3 text-[10px] text-white/25">
            <span><kbd className="font-mono">↵</kbd> Select</span>
            <span><kbd className="font-mono">esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
