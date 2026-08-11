import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { Menu, Bell, Search, Command, LogOut, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../components/Badge';

export default function TopBar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${showNotifications ? 'bg-gray-100 text-gray-900' : ''}`}
          >
            <Bell className="h-5 w-5" />
            {!notificationsRead && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden z-50 transform origin-top-right transition-all">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <span className="font-bold text-sm text-gray-900">Notifications</span>
                {!notificationsRead && (
                  <button 
                    onClick={() => setNotificationsRead(true)}
                    className="text-[11px] font-bold text-brand hover:text-brand/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-100">
                <div className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${notificationsRead ? 'opacity-60' : 'bg-blue-50/30'}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm text-gray-900 font-semibold">New Challan generated</p>
                    {!notificationsRead && <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5"></div>}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">CH-2026-00005 has been successfully created and is awaiting confirmation.</p>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">1 hour ago</p>
                </div>
                <div className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${notificationsRead ? 'opacity-60' : 'bg-blue-50/30'}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-sm text-gray-900 font-semibold">Inventory Alert</p>
                    {!notificationsRead && <div className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5"></div>}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">MacBook Pro is running low on stock (2 units remaining).</p>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">3 hours ago</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer opacity-60">
                  <p className="text-sm text-gray-900 font-semibold mb-0.5">System Update</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Nexora OS has been updated to version 2.4.1.</p>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">Yesterday</p>
                </div>
              </div>
              <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
                <button className="text-xs text-gray-500 font-bold uppercase tracking-wider hover:text-gray-900 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
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
