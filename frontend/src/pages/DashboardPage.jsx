import { useAuth } from '../context/useAuth';
import { PageLoader } from '../components/Spinner';

import AdminDashboard from './dashboard/AdminDashboard';
import SalesDashboard from './dashboard/SalesDashboard';
import WarehouseDashboard from './dashboard/WarehouseDashboard';
import AccountsDashboard from './dashboard/AccountsDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return <PageLoader />;

  const role = user.role?.toUpperCase();

  switch (role) {
    case 'ADMIN': return <AdminDashboard />;
    case 'SALES': return <SalesDashboard />;
    case 'WAREHOUSE': return <WarehouseDashboard />;
    case 'ACCOUNTS': return <AccountsDashboard />;
    default: return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 font-medium">Unable to determine your workspace</p>
        <p className="text-xs text-gray-400 mt-2">Detected role: {user.role || 'undefined'}</p>
      </div>
    );
  }
}
