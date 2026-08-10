import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { getChallans } from '../../services/challan.service';
import { ArrowRight, FileText, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

// Compact donut chart for status distribution
function StatusDonut({ confirmed, draft, cancelled, total }) {
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
        <FileText className="h-8 w-8 mb-2 text-gray-300" />
        <span className="text-xs font-medium">No challans yet</span>
      </div>
    );
  }
  const chartData = [
    { name: 'Confirmed', value: confirmed, color: '#10b981' },
    { name: 'Draft', value: draft, color: '#f59e0b' },
    { name: 'Cancelled', value: cancelled, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={28} outerRadius={42}
              dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, padding: '4px 8px' }}
              formatter={(val, name) => [val, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-lg font-bold text-gray-900">{total}</div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Total</div>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
        {[
          { label: 'Confirmed', value: confirmed, color: 'bg-emerald-500' },
          { label: 'Draft', value: draft, color: 'bg-amber-400' },
          { label: 'Cancelled', value: cancelled, color: 'bg-red-400' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                <span className="text-xs font-bold text-gray-900 tabular-nums">{item.value}</span>
              </div>
              <div className="mt-0.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: total > 0 ? `${(item.value / total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AccountsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalChallans: 0,
    draftChallans: 0,
    confirmedChallans: 0,
    cancelledChallans: 0,
    recentChallans: [],
    allChallans: []
  });

  useEffect(() => {
    getChallans({ limit: 50 }).then(res => {
      const all = res.challans;
      setData({
        totalChallans: res.pagination.total,
        draftChallans: all.filter(c => c.status === 'DRAFT').length,
        confirmedChallans: all.filter(c => c.status === 'CONFIRMED').length,
        cancelledChallans: all.filter(c => c.status === 'CANCELLED').length,
        recentChallans: all.slice(0, 12),
        allChallans: all,
      });
      setLoading(false);
    }).catch(err => {
      if (!err.isForbidden) console.error(err);
      setLoading(false);
    });
  }, []);

  const confirmedPct = data.totalChallans > 0
    ? ((data.confirmedChallans / data.totalChallans) * 100).toFixed(0)
    : 0;
  const currentDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const kpis = [
    {
      label: 'Total Challans',
      value: data.totalChallans,
      sub: 'All records',
      icon: FileText,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valColor: 'text-gray-900',
    },
    {
      label: 'Confirmed',
      value: data.confirmedChallans,
      sub: data.totalChallans > 0 ? `${confirmedPct}% of total` : 'No data yet',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valColor: 'text-emerald-700',
    },
    {
      label: 'Drafts',
      value: data.draftChallans,
      sub: 'Awaiting confirmation',
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valColor: 'text-amber-700',
    },
    {
      label: 'Cancelled',
      value: data.cancelledChallans,
      sub: 'Closed records',
      icon: XCircle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      valColor: 'text-red-600',
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review operational records and challans.</p>
          <p className="text-xs text-gray-400 mt-1">{currentDate}</p>
        </div>
        <Link
          to="/challans"
          className="flex items-center gap-2 self-start bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
        >
          <FileText className="h-4 w-4" /> View Challans
        </Link>
      </div>

      {/* KPI Row */}
      <div className="flex-shrink-0 grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {kpis.map((k, i) => (
          <Link key={i} to="/challans"
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
          >
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

      {/* Main Body */}
      <div className="flex-1 min-h-0 flex flex-col xl:flex-row gap-5 pb-6">

        {/* LEFT — Challan Ledger */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-5">
          <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Recent Challan Ledger</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">Latest operational records</p>
              </div>
              <Link to="/challans" className="text-xs text-brand hover:text-brand-hover font-semibold flex items-center gap-1 transition-colors">
                All records <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : data.recentChallans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <FileText className="h-10 w-10 mb-3 text-gray-200" />
                  <p className="text-sm font-medium">No challans found in the system.</p>
                  <p className="text-xs mt-1">Challans created by Sales will appear here.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Challan / Date</th>
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.recentChallans.map(r => (
                      <tr key={r.id}
                        className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/challans/${r.id}`)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-xs font-bold text-brand">{r.challanNumber}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(r.createdAt)}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-xs font-semibold text-gray-900">{r.customer?.name}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{r.customer?.businessName || '—'}</div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="text-xs font-semibold text-gray-900">{r._count?.items ?? 0} products</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{r.totalQuantity} units</div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap
                            ${r.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : r.status === 'DRAFT' ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center gap-1 text-xs text-brand font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            View <Eye className="h-3 w-3" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Status Distribution + Workflow */}
        <div className="xl:w-80 flex-shrink-0 flex flex-col gap-5">

          {/* Status Distribution Donut */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Challan Status</h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <StatusDonut
                confirmed={data.confirmedChallans}
                draft={data.draftChallans}
                cancelled={data.cancelledChallans}
                total={data.totalChallans}
              />
            )}
          </div>

          {/* Workflow Overview */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-5">Workflow Overview</h2>
            <div className="space-y-4">

              {[
                {
                  label: 'Confirmed',
                  count: data.confirmedChallans,
                  total: data.totalChallans,
                  barColor: 'bg-emerald-500',
                  dotColor: 'bg-emerald-500',
                  note: 'Processed & closed',
                },
                {
                  label: 'Draft',
                  count: data.draftChallans,
                  total: data.totalChallans,
                  barColor: 'bg-amber-400',
                  dotColor: 'bg-amber-400',
                  note: 'Inventory not yet deducted',
                },
                {
                  label: 'Cancelled',
                  count: data.cancelledChallans,
                  total: data.totalChallans,
                  barColor: 'bg-red-400',
                  dotColor: 'bg-red-400',
                  note: 'Void records',
                },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                      <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 tabular-nums">
                      {loading ? '—' : item.count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${item.barColor}`}
                      style={{ width: !loading && item.total > 0 ? `${(item.count / item.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity derived from challans */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Recent Activity</h2>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : data.allChallans.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No activity yet.</p>
            ) : (
              <div className="relative border-l-2 border-gray-100 ml-2 space-y-4">
                {data.allChallans.slice(0, 5).map(c => {
                  const isConfirmed = c.status === 'CONFIRMED';
                  const isCancelled = c.status === 'CANCELLED';
                  return (
                    <div key={c.id} className="pl-5 relative cursor-pointer group"
                      onClick={() => navigate(`/challans/${c.id}`)}>
                      <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white
                        ${isConfirmed ? 'bg-emerald-500' : isCancelled ? 'bg-red-400' : 'bg-amber-400'}`} />
                      <div className="text-[10px] text-gray-400 font-medium mb-0.5">{formatDate(c.createdAt)}</div>
                      <div className="text-xs font-semibold text-gray-900 group-hover:text-brand transition-colors">{c.challanNumber}</div>
                      <div className="text-[10px] text-gray-500">{c.customer?.name} · {c.status}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
