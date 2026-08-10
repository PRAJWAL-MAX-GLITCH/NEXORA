import { useState, useEffect, useCallback } from 'react';
import { getCustomers, deleteCustomer } from '../services/customer.service';
import { useToast } from '../context/useToast';
import { useAuth } from '../context/useAuth';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import Button from '../components/Button';
import { StatusBadge } from '../components/Badge';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Users, X, Phone, Building2, Calendar } from 'lucide-react';

function InitialsAvatar({ name, size = 'md' }) {
  const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700', 'bg-red-100 text-red-700', 'bg-cyan-100 text-cyan-700'];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sz} ${colors[idx]} rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
}

export default function CustomersPage() {
  const { hasRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState({ customers: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getCustomers(params);
      setData(res);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, toast]);

  useEffect(() => {
    const delay = setTimeout(() => fetchCustomers(), search ? 300 : 0);
    return () => clearTimeout(delay);
  }, [fetchCustomers, search]);

  const handleDelete = async () => {
    try {
      await deleteCustomer(deleteId);
      toast.success('Customer deleted');
      setDeleteId(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const activeCount = data.customers.filter(c => c.status === 'ACTIVE').length;
  const leadCount = data.customers.filter(c => c.status === 'LEAD').length;
  const overdueCount = data.customers.filter(c => c.followUpDate && new Date(c.followUpDate) < new Date()).length;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Relationships</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage accounts, contacts and follow-ups.</p>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <Button icon={Plus} onClick={() => navigate('/customers/new')}>Add Customer</Button>
        )}
      </div>

      {/* Summary Strip */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {[
            { label: 'Total', value: data.pagination.total || 0, color: 'text-gray-900' },
            { label: 'Active', value: activeCount, color: 'text-green-600' },
            { label: 'Leads', value: leadCount, color: 'text-amber-600' },
            { label: 'Overdue Follow-ups', value: overdueCount, color: overdueCount > 0 ? 'text-red-600' : 'text-gray-900' },
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
            placeholder="Search by name, business, or phone..."
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
              <option value="ACTIVE">Active</option>
              <option value="LEAD">Lead</option>
              <option value="INACTIVE">Inactive</option>
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
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Business</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Follow-up</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan="5" className="px-6 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                  </td>
                </tr>
              ))
            ) : data.customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">No customers found</p>
                  <p className="text-xs text-gray-400">
                    {search || statusFilter ? 'Try adjusting your filters.' : 'Add your first customer to get started.'}
                  </p>
                </td>
              </tr>
            ) : data.customers.map(r => {
              const isPast = r.followUpDate && new Date(r.followUpDate) < new Date();
              return (
                <tr key={r.id} className="hover:bg-gray-50 cursor-pointer transition-colors group" onClick={() => navigate(`/customers/${r.id}`)}>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={r.name} />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-brand transition-colors">{r.name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {r.mobile}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />
                      {r.businessName || <span className="text-gray-400 italic">Individual</span>}
                    </div>
                    <div className="mt-1"><StatusBadge status={r.customerType} /></div>
                  </td>
                  <td className="px-6 py-3.5"><StatusBadge status={r.status} /></td>
                  <td className="px-6 py-3.5 hidden lg:table-cell">
                    {r.followUpDate ? (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${isPast ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
                        <Calendar className="h-3 w-3" />
                        {new Date(r.followUpDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {hasRole('ADMIN', 'SALES') && (
                        <button onClick={() => navigate(`/customers/${r.id}`)}
                          className="text-xs text-brand hover:text-brand-hover font-semibold px-3 py-1.5 rounded-lg hover:bg-brand/5 transition-colors">
                          Edit
                        </button>
                      )}
                      {hasRole('ADMIN') && (
                        <button onClick={() => setDeleteId(r.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!loading && data.customers.length > 0 && (
        <Pagination pagination={data.pagination} onPageChange={setPage} />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Customer"
        message="This will permanently remove the customer and all associated data. This action cannot be undone."
        confirmLabel="Delete Customer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
