import { useAuth } from '../context/useAuth';
import { Menu, Bell, Search, Command, LogOut } from 'lucide-react';
import { StatusBadge } from '../components/Badge';

export default function TopBar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-20 print:hidden">
      <div className="flex items-center gap-6">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Hint */}
        <div 
          className="hidden md:flex items-center gap-3 bg-gray-50 border border-gray-200 hover:border-brand/50 hover:bg-white transition-colors rounded-xl px-4 py-1.5 cursor-text text-sm w-80 group"
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        >
          <Search className="h-4 w-4 text-gray-400 group-hover:text-brand transition-colors" />
          <span className="text-gray-500 flex-1">Search or jump to...</span>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
            <Command className="h-3 w-3" /> K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="h-6 w-px bg-gray-200"></div>

        <div className="flex items-center gap-4">
          <StatusBadge status={user?.role} />
          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
