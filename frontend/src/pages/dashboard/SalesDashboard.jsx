import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { getCustomers } from '../../services/customer.service';
import { getChallans } from '../../services/challan.service';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, getGreeting } from '../../utils/helpers';
import { StatusBadge } from '../../components/Badge';
import { 
  Users, UserCheck, Target, CalendarDays, FileText, CheckCircle2, 
  AlertCircle, Phone, ArrowRight, Activity, Plus, FileEdit
} from 'lucide-react';

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export default function SalesDashboard() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [data, setData] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    leads: 0,
    openChallans: 0,
    confirmedChallans: 0,
    overdueFollowUps: [],
    todayFollowUps: [],
    upcomingFollowUps: [],
    recentChallans: [],
    activities: [],
    attentionCustomers: []
  });

  useEffect(() => {
    Promise.all([
      getCustomers({ limit: 100 }), 
      getChallans({ limit: 20 })
    ]).then(([cust, allChall]) => {
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const tomorrow = today + 86400000;

      const customers = cust.customers;
      const challans = allChall.challans;

      // Group Follow-ups
      const overdue = [];
      const todayArr = [];
      const upcoming = [];
      
      customers.forEach(c => {
        if (c.followUpDate) {
          const fDate = new Date(c.followUpDate).getTime();
          if (fDate < today) overdue.push(c);
          else if (fDate >= today && fDate < tomorrow) todayArr.push(c);
          else upcoming.push(c);
        }
      });

      overdue.sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
      todayArr.sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
      upcoming.sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));

      // Attention customers
      const attention = customers.filter(c => 
        (c.followUpDate && new Date(c.followUpDate).getTime() < today) || 
        c.status === 'INACTIVE' || 
        c.status === 'LEAD'
      ).slice(0, 5);

      // Activities (Derive from recent challans)
      const acts = challans.slice(0, 6).map(c => ({
        id: c.id,
        type: c.status === 'CONFIRMED' ? 'Challan confirmed' : c.status === 'CANCELLED' ? 'Challan cancelled' : 'Challan created',
        entity: `${c.challanNumber} · ${c.customer?.name}`,
        date: c.createdAt,
        status: c.status
      }));

      setData({
        totalCustomers: cust.pagination.total,
        activeCustomers: customers.filter(c => c.status === 'ACTIVE').length,
        leads: customers.filter(c => c.status === 'LEAD').length,
        openChallans: challans.filter(c => c.status === 'DRAFT').length,
        confirmedChallans: challans.filter(c => c.status === 'CONFIRMED').length,
        overdueFollowUps: overdue.slice(0, 3),
        todayFollowUps: todayArr.slice(0, 3),
        upcomingFollowUps: upcoming.slice(0, 3),
        recentChallans: challans.slice(0, 6),
        activities: acts,
        attentionCustomers: attention
      });
      
      setLoading(false);
    }).catch(console.error);
  }, []);

  const totalFollowUps = data.overdueFollowUps.length + data.todayFollowUps.length + data.upcomingFollowUps.length;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F9FAFB] font-sans">
      
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{getGreeting()}, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage customers, follow-ups and sales operations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasRole('ADMIN', 'SALES') && (
            <button onClick={() => navigate('/customers/new')} className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm">
              <Plus className="h-4 w-4" /> Add Customer
            </button>
          )}
          {hasRole('ADMIN', 'SALES') && (
            <button onClick={() => navigate('/challans/new')} className="flex items-center gap-2 bg-[#0A2540] hover:bg-[#0A2540]/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm">
              <Plus className="h-4 w-4" /> Create Challan
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-8 pr-2">
        
        {/* KPI Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Total Customers', value: data.totalCustomers, icon: Users, desc: 'All records', link: '/customers' },
            { label: 'Active', value: data.activeCustomers, icon: UserCheck, desc: 'Active accounts', link: '/customers', color: 'text-emerald-600' },
            { label: 'Leads', value: data.leads, icon: Target, desc: 'Potential clients', link: '/customers', color: 'text-blue-600' },
            { label: 'Follow-ups', value: totalFollowUps, icon: CalendarDays, desc: 'Scheduled', link: '/customers', color: data.overdueFollowUps.length > 0 ? 'text-red-600' : 'text-amber-600' },
            { label: 'Open Challans', value: data.openChallans, icon: FileEdit, desc: 'Awaiting completion', link: '/challans', color: 'text-amber-600' },
            { label: 'Confirmed', value: data.confirmedChallans, icon: CheckCircle2, desc: 'Confirmed documents', link: '/challans', color: 'text-emerald-600' },
          ].map((stat, i) => (
            <Link key={i} to={stat.link} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <stat.icon className={`h-4 w-4 ${stat.color || 'text-gray-500'}`} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{stat.label}</span>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <div className={`text-2xl font-bold tracking-tight ${stat.color || 'text-gray-900'}`}>{stat.value}</div>
              )}
              <div className="text-xs text-gray-400 mt-1 font-medium">{stat.desc}</div>
            </Link>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Pipeline */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900 tracking-tight">Follow-up Pipeline</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Customer follow-ups requiring attention.</p>
                </div>
                <Link to="/customers" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="p-2">
                {loading ? (
                  <div className="p-4 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
                ) : (totalFollowUps === 0) ? (
                  <div className="p-12 text-center flex flex-col items-center">
                    <CalendarDays className="h-8 w-8 text-gray-300 mb-3" />
                    <p className="text-sm font-semibold text-gray-900">No follow-ups scheduled</p>
                    <p className="text-xs text-gray-500 mt-1">Create a follow-up from a customer record.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 p-4">
                    
                    {/* Overdue */}
                    {data.overdueFollowUps.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Overdue &middot; {data.overdueFollowUps.length}</span>
                        </div>
                        <div className="space-y-2">
                          {data.overdueFollowUps.map(c => (
                            <FollowUpRow key={c.id} customer={c} accent="red" navigate={navigate} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Today */}
                    {data.todayFollowUps.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Today &middot; {data.todayFollowUps.length}</span>
                        </div>
                        <div className="space-y-2">
                          {data.todayFollowUps.map(c => (
                            <FollowUpRow key={c.id} customer={c} accent="amber" navigate={navigate} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming */}
                    {data.upcomingFollowUps.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 px-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Upcoming &middot; {data.upcomingFollowUps.length}</span>
                        </div>
                        <div className="space-y-2">
                          {data.upcomingFollowUps.map(c => (
                            <FollowUpRow key={c.id} customer={c} accent="blue" navigate={navigate} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sales Activity */}
            {data.activities.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" /> Sales Activity
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Recent real operations</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {data.activities.map((act, i) => (
                      <div key={i} className="flex items-start gap-4 px-2">
                        <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          act.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 
                          act.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {act.status === 'CONFIRMED' ? <CheckCircle2 className="w-3 h-3" /> : 
                           act.status === 'CANCELLED' ? <AlertCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">{act.type}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{act.entity}</div>
                        </div>
                        <div className="text-[10px] font-bold text-gray-400">{formatDate(act.date)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Recent Sales */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#FCFCFD]">
                <h2 className="text-base font-bold text-gray-900 tracking-tight">Recent Sales</h2>
                <Link to="/challans" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="p-2">
                {loading ? (
                  <div className="p-4 space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : data.recentChallans.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400 font-medium">No recent sales activity.<br/>Sales operations will appear here.</div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {data.recentChallans.map(r => (
                      <div key={r.id} onClick={() => navigate(`/challans/${r.id}`)} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-gray-100 group">
                        <div>
                          <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{r.challanNumber}</div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[140px]">{r.customer?.name}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <StatusBadge status={r.status} />
                          <div className="text-[10px] font-medium text-gray-400">{formatDate(r.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Customers Needing Attention */}
            {data.attentionCustomers.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-[#FCFCFD]">
                  <h2 className="text-sm font-bold text-gray-900 tracking-tight">Customers Needing Attention</h2>
                  <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider font-semibold">Overdue / Inactive / Lead</p>
                </div>
                <div className="p-2">
                  <div className="flex flex-col gap-1">
                    {data.attentionCustomers.map(c => (
                      <div key={c.id} onClick={() => navigate(`/customers/${c.id}/edit`)} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                              {c.status === 'INACTIVE' ? 'Inactive' : c.status === 'LEAD' ? 'Lead' : 'Follow-up overdue'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'CU';
  return (
    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

function FollowUpRow({ customer, accent, navigate }) {
  const isOverdue = accent === 'red';
  const isToday = accent === 'amber';
  
  const bgColors = {
    red: 'hover:bg-red-50/50 hover:border-red-100',
    amber: 'hover:bg-amber-50/50 hover:border-amber-100',
    blue: 'hover:bg-blue-50/50 hover:border-blue-100',
  };

  const textColors = {
    red: 'text-red-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
  };

  return (
    <div className={`flex items-center justify-between p-4 border border-gray-100 rounded-xl transition-all group bg-white shadow-sm ${bgColors[accent]}`}>
      <div className="flex items-center gap-4">
        <Avatar name={customer.name} />
        <div>
          <div className="text-sm font-bold text-gray-900 group-hover:text-[#0A2540] transition-colors">{customer.name}</div>
          <div className="text-xs text-gray-500 font-medium mt-0.5 truncate max-w-[200px]">{customer.businessName || 'Individual'} &middot; {customer.customerType}</div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${textColors[accent]}`}>
            {isOverdue ? 'Overdue' : isToday ? 'Due Today' : 'Upcoming'}
          </div>
          <div className="text-xs font-semibold text-gray-700">{isToday ? 'Today' : formatDate(customer.followUpDate)}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.open(`tel:${customer.mobile}`)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Call">
            <Phone className="w-4 h-4" />
          </button>
          <button onClick={() => navigate(`/customers/${customer.id}/edit`)} className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 rounded-lg transition-all shadow-sm">
            View
          </button>
        </div>
      </div>
    </div>
  );
}
