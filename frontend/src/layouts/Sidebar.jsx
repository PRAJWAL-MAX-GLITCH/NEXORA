import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { 
  LayoutDashboard, Users, PackageSearch, 
  Warehouse, FileText, ShieldAlert 
} from 'lucide-react';

const getNavGroups = (role) => {
  const groups = [
    {
      label: 'Workspace',
      items: [{ path: '/dashboard', label: 'Overview', icon: LayoutDashboard }],
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']
    },
    {
      label: 'CRM',
      items: [{ path: '/customers', label: 'Customers', icon: Users }],
      roles: ['ADMIN', 'SALES']
    },
    {
      label: 'Inventory',
      items: [
        { path: '/products', label: 'Catalog', icon: PackageSearch },
        { path: '/inventory', label: 'Health & Movements', icon: Warehouse },
      ],
      roles: ['ADMIN', 'WAREHOUSE']
    },
    {
      label: 'Sales',
      items: [{ path: '/challans', label: 'Challans', icon: FileText }],
      roles: ['ADMIN', 'SALES']
    },
    {
      label: 'Sales Records',
      items: [{ path: '/challans', label: 'Challans', icon: FileText }],
      roles: ['ACCOUNTS']
    },
    {
      label: 'Operations',
      items: [{ path: '/customers', label: 'Customers', icon: Users }],
      roles: ['ACCOUNTS']
    }
  ];

  return groups.filter(g => g.roles.includes(role));
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, hasRole } = useAuth();

  return (
    <aside className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 flex flex-col print:hidden
      ${collapsed ? 'w-16 -translate-x-full md:translate-x-0' : 'w-64 translate-x-0'}`}>
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100 flex-shrink-0">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white flex-shrink-0">
          <div className="w-3 h-3 border-2 border-white rounded-sm" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-gray-900 leading-tight tracking-wide">NEXORA</div>
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">Operations OS</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 overflow-y-auto px-3 space-y-8">
        {getNavGroups(user?.role?.toUpperCase()).map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-brand/10 text-brand font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && !collapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand rounded-r-full" />
                      )}
                      <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-brand' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className={`border-t border-gray-100 p-4 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-gray-50 transition-colors cursor-pointer w-full">
          <div className="w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border border-gray-200">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden pr-2 flex-1">
              <div className="text-sm font-semibold text-gray-900 truncate">{user?.name}</div>
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user?.role}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
