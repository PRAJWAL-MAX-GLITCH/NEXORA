import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChallans } from '../services/challan.service';
import { useToast } from '../context/useToast';
import { useAuth } from '../context/useAuth';
import Button from '../components/Button';
import Pagination from '../components/Pagination';
import { StatusBadge } from '../components/Badge';
import { formatDate } from '../utils/helpers';
import { Search, Plus, Filter, FileText, ArrowRight, X, Package } from 'lucide-react';

export default function ChallansPage() {
  const { hasRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState({ challans: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getChallans(params);
      setData(res);
    } catch {
      toast.error('Failed to load challans');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, toast]);

  useEffect(() => {
    const delay = setTimeout(() => fetchChallans(), search ? 300 : 0);
    return () => clearTimeout(delay);
  }, [fetchChallans, search]);

  const confirmedCount = data.challans.filter(c => c.status === 'CONFIRMED').length;
  const draftCount = data.challans.filter(c => c.status === 'DRAFT').length;
  const cancelledCount = data.challans.filter(c => c.status === 'CANCELLED').length;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Operations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage dispatch documents and order fulfillment.</p>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <Button icon={Plus} onClick={() => navigate('/challans/new')}>Create Challan</Button>
        )}
      </div>

      {/* Summary Strip */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {[
            { label: 'Total', value: data.pagination.total || 0, color: 'text-gray-900' },
            { label: 'Confirmed', value: confirmedCount, color: 'text-green-600' },
            { label: 'Drafts', value: draftCount, color: 'text-amber-600' },
            { label: 'Cancelled', value: cancelledCount, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="px-6 py-4">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{loading ? '–' : s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by challan # or customer..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-2.5">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          {(search || statusFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}
              className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 bg-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Challan</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Items</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan="5" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : data.challans.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">No challans found</p>
                  <p className="text-xs text-gray-400">{search || statusFilter ? 'Try adjusting your filters.' : 'Create your first challan to get started.'}</p>
                </td>
              </tr>
            ) : data.challans.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 cursor-pointer transition-colors group" onClick={() => navigate(`/challans/${r.id}`)}>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-brand flex-shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-brand text-sm">{r.challanNumber}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{formatDate(r.createdAt)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <div className="font-semibold text-gray-900 text-sm">{r.customer?.name}</div>
                  <div className="text-xs text-gray-400">{r.customer?.businessName}</div>
                </td>
                <td className="px-6 py-3.5 hidden md:table-cell">
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                    <Package className="h-3 w-3" /> {r._count?.items || 0} SKUs
                  </span>
                </td>
                <td className="px-6 py-3.5"><StatusBadge status={r.status} /></td>
                <td className="px-6 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/challans/${r.id}`)}
                    className="text-xs text-brand hover:text-brand-hover font-semibold px-3 py-1.5 rounded-lg hover:bg-brand/5 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto"
                  >
                    Open <ArrowRight className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && data.challans.length > 0 && (
        <Pagination pagination={data.pagination} onPageChange={setPage} />
      )}
    </div>
  );
}
