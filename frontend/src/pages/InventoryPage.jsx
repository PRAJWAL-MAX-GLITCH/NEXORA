import { useState, useEffect, useCallback } from 'react';
import { getMovements, stockIn, stockOut, getLowStock } from '../services/inventory.service';
import { getProducts } from '../services/product.service';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import Button from '../components/Button';
import Input from '../components/Input';
import Pagination from '../components/Pagination';
import { StatusBadge } from '../components/Badge';
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle, History, X, CheckCircle, Package } from 'lucide-react';

export default function InventoryPage() {
  const { hasRole } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState('movements');
  const [data, setData] = useState({ movements: [], pagination: {} });
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [drawerType, setDrawerType] = useState(null);
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (typeFilter) params.type = typeFilter;
      const res = await getMovements(params);
      setData(res);
    } catch {
      toast.error('Failed to load movements');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, toast]);

  const fetchLowStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLowStock();
      setLowStock(res.products);
    } catch {
      toast.error('Failed to load low stock');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (tab === 'movements') fetchMovements();
    else fetchLowStock();
  }, [tab, fetchMovements, fetchLowStock]);

  const handleOpenDrawer = async (type) => {
    setDrawerType(type);
    try {
      const res = await getProducts({ limit: 1000 });
      setProducts(res.products);
    } catch {
      toast.error('Failed to load products');
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      productId: formData.get('productId'),
      quantity: Number(formData.get('quantity')),
      reason: formData.get('reason'),
    };
    setSaving(true);
    try {
      if (drawerType === 'IN') await stockIn(payload);
      else await stockOut(payload);
      toast.success(`Stock ${drawerType} recorded`);
      setDrawerType(null);
      if (tab === 'movements') fetchMovements();
      else fetchLowStock();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to record stock ${drawerType}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor stock levels across your operation.</p>
        </div>
        {hasRole('ADMIN', 'WAREHOUSE') && (
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenDrawer('OUT')}
              className="flex items-center gap-2 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <ArrowUpFromLine className="h-4 w-4" /> Stock Out
            </button>
            <button
              onClick={() => handleOpenDrawer('IN')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <ArrowDownToLine className="h-4 w-4" /> Stock In
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors relative
              ${tab === 'movements' ? 'text-brand border-b-2 border-brand bg-blue-50/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            onClick={() => { setTab('movements'); setPage(1); }}
          >
            <History className="h-4 w-4" /> Movement History
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors relative
              ${tab === 'low-stock' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            onClick={() => { setTab('low-stock'); setPage(1); }}
          >
            <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
            {lowStock.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">{lowStock.length}</span>
            )}
          </button>

          {tab === 'movements' && (
            <div className="ml-auto flex items-center px-4">
              <select
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Movements</option>
                <option value="IN">Stock In (+)</option>
                <option value="OUT">Stock Out (−)</option>
              </select>
            </div>
          )}
        </div>

        {/* Table */}
        {tab === 'movements' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Reason</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan="6" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : data.movements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <History className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No stock movements found.</p>
                    </td>
                  </tr>
                ) : data.movements.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{new Date(r.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm">{r.product?.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono uppercase">{r.product?.sku}</div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={r.type} /></td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-base tabular-nums ${r.type === 'IN' ? 'text-green-600' : 'text-amber-600'}`}>
                        {r.type === 'IN' ? '+' : '−'}{r.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{r.reason}</td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{r.user?.name}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}><td colSpan="4" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : lowStock.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">All inventory healthy</p>
                      <p className="text-xs text-gray-400">All products are above their minimum thresholds.</p>
                    </td>
                  </tr>
                ) : lowStock.map(r => (
                  <tr key={r.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{r.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono uppercase">{r.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{r.category}</td>
                    <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">{r.warehouseLocation || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-amber-600 tabular-nums">{r.currentStock}</span>
                        <span className="text-xs text-gray-400">/ min {r.minimumStock}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'movements' && !loading && data.movements.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100">
            <Pagination pagination={data.pagination} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Slide-over Drawer */}
      {drawerType && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerType(null)} />
          <div className="relative w-full max-w-md h-full bg-white border-l border-gray-200 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${drawerType === 'IN' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {drawerType === 'IN' ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Record Stock {drawerType}</h2>
                  <p className="text-xs text-gray-500">{drawerType === 'IN' ? 'Inventory addition' : 'Inventory deduction'}</p>
                </div>
              </div>
              <button onClick={() => setDrawerType(null)} className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="stockForm" onSubmit={handleStockSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Select Product *</label>
                  <select
                    name="productId" required
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  >
                    <option value="" disabled>Choose a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Current: {p.currentStock})</option>
                    ))}
                  </select>
                </div>
                <Input label="Quantity *" name="quantity" type="number" min="1" required placeholder="e.g. 50" />
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1.5">Reason / Reference *</label>
                  <textarea
                    name="reason" required rows={3}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                    placeholder={drawerType === 'IN' ? 'e.g. Received from Supplier PO-1234' : 'e.g. Damaged during transit'}
                  />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setDrawerType(null)}>Cancel</Button>
              <button
                type="submit" form="stockForm" disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm disabled:opacity-50
                  ${drawerType === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}`}
              >
                {saving ? 'Saving...' : `Confirm Stock ${drawerType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
