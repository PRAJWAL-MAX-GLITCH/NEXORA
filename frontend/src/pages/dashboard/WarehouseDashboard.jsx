import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { getProducts } from '../../services/product.service';
import { getLowStock, getMovements } from '../../services/inventory.service';
import { Plus, ArrowRight, AlertTriangle, CheckCircle, Package, History, TrendingUp, TrendingDown, Minus, Layers } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getGreeting } from '../../utils/helpers';

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

// Compact segmented health bar
function InventoryHealthBar({ healthy, low, out, total }) {
  if (total === 0) return null;
  const healthyPct = (healthy / total) * 100;
  const lowPct = (low / total) * 100;
  const outPct = (out / total) * 100;

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-4">
        {healthy > 0 && (
          <div className="bg-emerald-500 rounded-l-full transition-all duration-700" style={{ width: `${healthyPct}%` }} />
        )}
        {low > 0 && (
          <div className="bg-amber-400 transition-all duration-700" style={{ width: `${lowPct}%` }} />
        )}
        {out > 0 && (
          <div className="bg-red-400 rounded-r-full transition-all duration-700" style={{ width: `${outPct}%` }} />
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Healthy', count: healthy, dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Low Stock', count: low, dot: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Out of Stock', count: out, dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50' },
        ].map(item => (
          <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
            <div className={`text-2xl font-bold ${item.text}`}>{item.count}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WarehouseDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalProducts: 0,
    totalUnits: 0,
    healthyCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    lowStock: [],
    recentMovements: [],
    movementIn: 0,
    movementOut: 0,
    allProducts: [],
  });

  useEffect(() => {
    Promise.all([
      getProducts({ limit: 1000 }),
      getLowStock(),
      getMovements({ limit: 20 })
    ]).then(([prod, low, moves]) => {
      const allProducts = prod.products;
      const totalUnits = allProducts.reduce((sum, p) => sum + p.currentStock, 0);
      const outOfStockCount = allProducts.filter(p => p.currentStock === 0).length;
      const lowStockCount = allProducts.filter(p => p.currentStock > 0 && p.currentStock <= p.minimumStock).length;
      const healthyCount = allProducts.filter(p => p.currentStock > p.minimumStock).length;

      const allMovements = moves.movements;
      const movementIn = allMovements.filter(m => m.type === 'IN').reduce((s, m) => s + m.quantity, 0);
      const movementOut = allMovements.filter(m => m.type === 'OUT').reduce((s, m) => s + m.quantity, 0);

      setData({
        totalProducts: prod.pagination.total,
        totalUnits,
        healthyCount,
        lowStockCount,
        outOfStockCount,
        lowStock: low.products,
        recentMovements: allMovements.slice(0, 10),
        movementIn,
        movementOut,
        allProducts,
      });
      setLoading(false);
    }).catch(err => {
      if (!err.isForbidden) console.error(err);
      setLoading(false);
    });
  }, []);

  const kpis = [
    {
      label: 'Total Products',
      value: data.totalProducts,
      sub: 'Active catalog',
      icon: Package,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valColor: 'text-gray-900',
      link: '/products',
    },
    {
      label: 'Total Units',
      value: data.totalUnits,
      sub: 'Current inventory',
      icon: Layers,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      valColor: 'text-gray-900',
      link: '/inventory',
    },
    {
      label: 'Low Stock',
      value: data.lowStockCount,
      sub: data.lowStockCount > 0 ? 'Needs attention' : 'All clear',
      icon: AlertTriangle,
      iconBg: data.lowStockCount > 0 ? 'bg-amber-50' : 'bg-gray-50',
      iconColor: data.lowStockCount > 0 ? 'text-amber-600' : 'text-gray-400',
      valColor: data.lowStockCount > 0 ? 'text-amber-700' : 'text-gray-900',
      link: '/inventory',
    },
    {
      label: 'Out of Stock',
      value: data.outOfStockCount,
      sub: data.outOfStockCount > 0 ? 'Immediate action' : 'All in stock',
      icon: AlertTriangle,
      iconBg: data.outOfStockCount > 0 ? 'bg-red-50' : 'bg-gray-50',
      iconColor: data.outOfStockCount > 0 ? 'text-red-500' : 'text-gray-400',
      valColor: data.outOfStockCount > 0 ? 'text-red-700' : 'text-gray-900',
      link: '/inventory',
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor stock levels and warehouse movements.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Stock In
          </button>
          <button onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <History className="h-4 w-4" /> View Movements
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="flex-shrink-0 grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {kpis.map((k, i) => (
          <Link key={i} to={k.link}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${k.iconBg} flex items-center justify-center`}>
                <k.icon className={`h-4 w-4 ${k.iconColor}`} />
              </div>
            </div>
            <div className={`text-3xl font-bold ${k.valColor} mb-1`}>
              {loading ? <Skeleton className="h-8 w-12" /> : k.value}
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{k.label}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{k.sub}</div>
          </Link>
        ))}
      </div>

      {/* Main Body — Two Columns */}
      <div className="flex-1 min-h-0 flex flex-col xl:flex-row gap-5 pb-6">

        {/* LEFT — Main inventory panels */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-5">

          {/* Inventory Health + Stock Movement Summary — side by side */}
          <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Inventory Health */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Inventory Health</h2>
                <Link to="/inventory" className="text-[10px] text-brand font-semibold hover:underline">Details</Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                </div>
              ) : (
                <InventoryHealthBar
                  healthy={data.healthyCount}
                  low={data.lowStockCount}
                  out={data.outOfStockCount}
                  total={data.totalProducts}
                />
              )}
            </div>

            {/* Stock Movement Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Stock Movement</h2>
                <Link to="/inventory" className="text-[10px] text-brand font-semibold hover:underline">History</Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : data.recentMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                  <Package className="h-8 w-8 text-gray-200 mb-2" />
                  <p className="text-xs">No movements recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Stock In</div>
                      <div className="text-xl font-bold text-emerald-700">+{data.movementIn}</div>
                    </div>
                    <div className="ml-auto text-[10px] text-emerald-500 font-medium">units</div>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Stock Out</div>
                      <div className="text-xl font-bold text-amber-700">-{data.movementOut}</div>
                    </div>
                    <div className="ml-auto text-[10px] text-amber-500 font-medium">units</div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Minus className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Net</div>
                      <div className={`text-xl font-bold ${data.movementIn - data.movementOut >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {data.movementIn - data.movementOut >= 0 ? '+' : ''}{data.movementIn - data.movementOut}
                      </div>
                    </div>
                    <div className="ml-auto text-[10px] text-gray-400 font-medium">units</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts Table */}
          <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-gray-900">Low Stock Alerts</h2>
                {!loading && data.lowStock.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {data.lowStock.length}
                  </span>
                )}
              </div>
              <Link to="/inventory" className="text-xs text-brand hover:text-brand-hover font-semibold flex items-center gap-1 transition-colors">
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-5 space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : data.lowStock.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <CheckCircle className="h-10 w-10 text-emerald-400 mb-3" />
                  <p className="text-sm font-semibold text-gray-700">All products are well stocked</p>
                  <p className="text-xs text-gray-400 mt-1">No products are below minimum stock level.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product / SKU</th>
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock / Min</th>
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.lowStock.map(p => {
                      const isOut = p.currentStock === 0;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="text-xs font-semibold text-gray-900">{p.name}</div>
                            <div className="font-mono text-[10px] text-gray-400 mt-0.5">{p.sku}</div>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                              {p.warehouseLocation || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <div className="inline-flex items-center gap-1">
                              <span className={`text-xs font-bold ${isOut ? 'text-red-600' : 'text-amber-600'}`}>
                                {p.currentStock}
                              </span>
                              <span className="text-gray-300">/</span>
                              <span className="text-xs text-gray-500">{p.minimumStock}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                              ${isOut ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-red-500' : 'bg-amber-500'}`} />
                              {isOut ? 'Out of Stock' : 'Low Stock'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Recent Movements Timeline + Needs Attention */}
        <div className="xl:w-80 flex-shrink-0 flex flex-col gap-5">

          {/* Needs Attention */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Needs Attention</h2>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : data.lowStock.length === 0 ? (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-emerald-800">Inventory is healthy</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">No items need immediate attention.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {data.lowStock.slice(0, 5).map(p => {
                  const isOut = p.currentStock === 0;
                  return (
                    <Link key={p.id} to="/inventory"
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isOut ? 'bg-red-500' : 'bg-amber-400'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-gray-900 truncate group-hover:text-brand transition-colors">{p.name}</div>
                        <div className={`text-[10px] font-bold mt-0.5 ${isOut ? 'text-red-600' : 'text-amber-600'}`}>
                          {isOut ? 'Out of stock' : 'Low stock'} · {p.currentStock} / {p.minimumStock}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {data.lowStock.length > 5 && (
                  <Link to="/inventory" className="block text-center text-[10px] text-brand font-semibold hover:underline pt-1">
                    +{data.lowStock.length - 5} more items
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Recent Movements Timeline */}
          <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Recent Movements</h2>
              <Link to="/inventory" className="text-xs text-brand hover:text-brand-hover font-semibold transition-colors">History</Link>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : data.recentMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <History className="h-8 w-8 text-gray-200 mb-2" />
                  <p className="text-xs font-medium">No movements yet.</p>
                  <p className="text-[10px] mt-1">Stock activity will appear here.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-gray-100 ml-2 space-y-5">
                  {data.recentMovements.map(m => (
                    <div key={m.id} className="pl-5 relative">
                      <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${m.type === 'IN' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      <div className="text-[10px] text-gray-400 font-medium mb-1">
                        {new Date(m.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-xs font-semibold text-gray-900 leading-snug">{m.product?.name}</div>
                          <div className={`text-xs font-bold tabular-nums whitespace-nowrap flex-shrink-0 ${m.type === 'IN' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {m.type === 'IN' ? '+' : '-'}{m.quantity}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${m.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {m.type === 'IN' ? 'Stock In' : 'Stock Out'}
                          </span>
                          {m.reason && (
                            <span className="text-[10px] text-gray-400 italic truncate ml-2 max-w-[100px]">{m.reason}</span>
                          )}
                        </div>
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
