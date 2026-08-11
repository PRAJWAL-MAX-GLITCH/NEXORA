import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { getCustomers } from '../../services/customer.service';
import { getProducts } from '../../services/product.service';
import { getLowStock, getMovements } from '../../services/inventory.service';
import { getChallans } from '../../services/challan.service';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Plus, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, getGreeting } from '../../utils/helpers';
import { StatusBadge } from '../../components/Badge';

const CHART_DATA = [
  { name: 'Mon', value: 12 }, { name: 'Tue', value: 19 },
  { name: 'Wed', value: 8 },  { name: 'Thu', value: 25 },
  { name: 'Fri', value: 17 }, { name: 'Sat', value: 6 },
  { name: 'Sun', value: 22 },
];

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    customers: 0, products: 0, lowStock: [],
    recentChallans: [], recentMovements: [],
    totalChallans: 0, draftChallans: 0, confirmedChallans: 0
  });

  useEffect(() => {
    Promise.all([
      getCustomers({ limit: 1 }),
      getProducts({ limit: 1 }),
      getLowStock(),
      getChallans({ limit: 5 }), // For recent list
      getChallans({ limit: 100 }), // To get counts
      getMovements({ limit: 6 }),
    ]).then(([cust, prod, low, challans, allChallans, moves]) => {
      setData({
        customers: cust.pagination.total,
        products: prod.pagination.total,
        lowStock: low.products,
        recentChallans: challans.challans,
        recentMovements: moves.movements,
        totalChallans: allChallans.pagination.total,
        draftChallans: allChallans.challans.filter(c => c.status === 'DRAFT').length,
        confirmedChallans: allChallans.challans.filter(c => c.status === 'CONFIRMED').length,
      });
      setLoading(false);
    }).catch(console.error);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening across your operations.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/customers/new')} className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Add Customer
          </button>
          <button onClick={() => navigate('/challans/new')} className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Create Challan
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col xl:flex-row gap-6 pb-6">
        {/* LEFT: Main content */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-6">
          {/* Operations Snapshot */}
          <div className="flex-shrink-0 bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operations Snapshot</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-gray-100">
              {[
                { label: 'Total Customers', value: data.customers, link: '/customers', color: 'text-gray-900' },
                { label: 'Total Products', value: data.products, link: '/products', color: 'text-gray-900' },
                { label: 'Low Stock', value: data.lowStock.length, link: '/inventory', color: data.lowStock.length > 0 ? 'text-amber-600' : 'text-green-600' },
                { label: 'Draft Orders', value: data.draftChallans, link: '/challans', color: 'text-gray-900' },
                { label: 'Confirmed', value: data.confirmedChallans, link: '/challans', color: 'text-green-600' },
              ].map(stat => (
                <Link key={stat.label} to={stat.link} className="px-5 py-5 hover:bg-gray-50 transition-colors group">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</div>
                  {loading ? <Skeleton className="h-8 w-12" /> : <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>}
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Chart */}
          <div className="flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-brand" /> Operational Activity
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">7-day stock movement volume</p>
              </div>
            </div>
            <div className="h-[140px] xl:h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3157D5" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#3157D5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                  <Area type="monotone" dataKey="value" stroke="#3157D5" strokeWidth={2} fillOpacity={1} fill="url(#areaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Recent Sales Operations</h2>
              <Link to="/challans" className="text-xs text-brand hover:text-brand-hover font-semibold flex items-center gap-1 transition-colors">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Challan</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i}><td colSpan="4" className="px-6 py-4"><Skeleton className="h-4 w-full" /></td></tr>
                    ))
                  ) : data.recentChallans.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-400">No recent challans.</td></tr>
                  ) : data.recentChallans.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/challans/${r.id}`)}>
                      <td className="px-6 py-3.5">
                        <div className="font-mono text-xs font-bold text-brand">{r.challanNumber}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(r.createdAt)}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-gray-900 text-xs">{r.customer?.name}</div>
                        <div className="text-[10px] text-gray-400">{r.customer?.businessName}</div>
                      </td>
                      <td className="px-6 py-3.5 text-right font-medium text-gray-600 text-xs">{r._count?.items}</td>
                      <td className="px-6 py-3.5"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="xl:w-80 flex-shrink-0 flex flex-col gap-6">
          {/* Inventory Health */}
          <div className="flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inventory Health</h2>
            </div>
            {loading ? (
              <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-16 w-full" /></div>
            ) : (
              <>
                <div className="flex justify-between text-[10px] font-semibold text-gray-500 mb-1.5">
                  <span>Healthy</span><span>Low</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex mb-5">
                  {data.lowStock.length === 0
                    ? <div className="h-full bg-green-500 w-full rounded-full" />
                    : <><div className="h-full bg-green-500 rounded-l-full" style={{ width: '85%' }} /><div className="h-full bg-amber-400" style={{ width: '15%' }} /></>
                  }
                </div>
                {data.lowStock.length === 0 ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-semibold text-green-700">All stock levels healthy</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      <span className="text-xs font-semibold text-amber-700">{data.lowStock.length} items below minimum</span>
                    </div>
                    {data.lowStock.slice(0, 4).map(p => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="text-xs text-gray-700 truncate pr-2 font-medium">{p.name}</div>
                        <div className="text-xs font-bold text-amber-600 tabular-nums">{p.currentStock}</div>
                      </div>
                    ))}
                    {data.lowStock.length > 4 && (
                      <Link to="/inventory" className="text-[10px] text-brand font-semibold block text-center pt-1 hover:underline">
                        +{data.lowStock.length - 4} more
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Recent Stock Movements */}
          <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Movements</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : data.recentMovements.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No recent activity.</p>
              ) : (
                <div className="relative border-l-2 border-gray-100 ml-2 space-y-6">
                  {data.recentMovements.map(m => (
                    <div key={m.id} className="pl-6 relative">
                      <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${m.type === 'IN' ? 'bg-green-500' : 'bg-amber-400'}`} />
                      <div className="text-[10px] text-gray-400 font-semibold mb-0.5 uppercase tracking-wider">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex justify-between items-center mt-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-700 font-medium truncate">{m.product?.name}</span>
                        <span className={`text-xs font-bold tabular-nums ${m.type === 'IN' ? 'text-green-600' : 'text-amber-600'}`}>
                          {m.type === 'IN' ? '+' : '-'}{m.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
