import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CommandPalette from '../components/CommandPalette';

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) setCollapsed(true);
  }, [location.pathname]);

  if (!user) return <Navigate to="/login" replace />;

  const sidebarWidth = collapsed ? 'md:ml-16' : 'md:ml-64';

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setCollapsed(true)}
        />
      )}
      
      <div className={`flex flex-col flex-1 min-w-0 min-h-0 transition-all duration-300 ${sidebarWidth}`}>
        <TopBar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8 w-full max-w-[1500px] mx-auto print:p-0 print:max-w-none print:overflow-visible">
          <Outlet />
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
