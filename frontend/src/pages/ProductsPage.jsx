import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/product.service';
import { useToast } from '../context/useToast';
import { useAuth } from '../context/useAuth';
import Input from '../components/Input';
import Button from '../components/Button';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency } from '../utils/helpers';
import { Search, Plus, X, Package, Edit2, Trash2, AlertTriangle, Box } from 'lucide-react';

function StockBar({ current, minimum }) {
  const isLow = current <= minimum;
  const max = Math.max(minimum * 4, 1);
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div className="w-28">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm font-bold tabular-nums ${isLow ? 'text-amber-600' : 'text-gray-900'}`}>{current}</span>
        <span className="text-[10px] text-gray-400">min {minimum}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isLow ? 'bg-amber-400' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { hasRole } = useAuth();
  const toast = useToast();

  const [data, setData] = useState({ products: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await getProducts(params);
      setData(res);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    const delay = setTimeout(() => fetchProducts(), search ? 300 : 0);
    return () => clearTimeout(delay);
  }, [fetchProducts, search]);

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    payload.unitPrice = Number(payload.unitPrice);
    payload.minimumStock = Number(payload.minimumStock);
    if (!editData) payload.currentStock = Number(payload.currentStock || 0);
    setSaving(true);
    try {
      if (editData) await updateProduct(editData.id, payload);
      else await createProduct(payload);
      toast.success(editData ? 'Product updated' : 'Product created');
      setIsDrawerOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete — product has stock history');
    }
  };

  const openDrawer = (product = null) => { setEditData(product); setIsDrawerOpen(true); };

  const totalValue = data.products.reduce((s, p) => s + p.currentStock * p.unitPrice, 0);
  const lowCount = data.products.filter(p => p.currentStock <= p.minimumStock).length;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage inventory items, SKUs, and pricing.</p>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <Button icon={Plus} onClick={() => openDrawer()}>Add Product</Button>
        )}
      </div>

      {/* Summary Strip */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="px-6 py-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Products</div>
            <div className="text-2xl font-bold text-gray-900">{data.pagination.total || 0}</div>
          </div>
          <div className="px-6 py-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Catalog Value</div>
            <div className="text-2xl font-bold text-green-600">{loading ? '–' : formatCurrency(totalValue)}</div>
          </div>
          <div className="px-6 py-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Low Stock</div>
            <div className={`text-2xl font-bold ${lowCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{loading ? '–' : lowCount}</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {search && (
          <button onClick={() => { setSearch(''); setPage(1); }}
            className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 bg-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock Level</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan="5" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : data.products.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Box className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Catalog is empty</p>
                  <p className="text-xs text-gray-400">{search ? 'No products match your search.' : 'Add your first product to get started.'}</p>
                </td>
              </tr>
            ) : data.products.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{r.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mt-0.5">{r.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">{r.category}</span>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(r.unitPrice)}</td>
                <td className="px-6 py-4"><StockBar current={r.currentStock} minimum={r.minimumStock} /></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {hasRole('ADMIN', 'SALES') && (
                      <button onClick={() => openDrawer(r)}
                        className="p-1.5 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    {hasRole('ADMIN') && (
                      <button onClick={() => setDeleteId(r.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && data.products.length > 0 && (
        <Pagination pagination={data.pagination} onPageChange={setPage} />
      )}

      {/* Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-white border-l border-gray-200 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">{editData ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="productForm" onSubmit={handleSave} className="space-y-5">
                <Input label="Product Name" name="name" defaultValue={editData?.name} required placeholder="Wireless Mouse" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="SKU" name="sku" defaultValue={editData?.sku} required placeholder="MOU-001" disabled={!!editData} />
                  <Input label="Category" name="category" defaultValue={editData?.category} required placeholder="Electronics" />
                </div>
                <Input label="Unit Price (₹)" name="unitPrice" type="number" step="0.01" min="0" defaultValue={editData?.unitPrice} required />
                <Input label="Warehouse Location" name="warehouseLocation" defaultValue={editData?.warehouseLocation} placeholder="Aisle 4, Shelf B" />
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-4">
                  <h3 className="text-xs font-bold text-brand uppercase tracking-wider">Inventory Rules</h3>
                  {!editData && (
                    <Input label="Initial Stock Qty" name="currentStock" type="number" min="0" defaultValue="0" required />
                  )}
                  <Input label="Minimum Stock Alert" name="minimumStock" type="number" min="0" defaultValue={editData?.minimumStock ?? 10} required />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
              <Button type="submit" form="productForm" loading={saving}>
                {editData ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Product"
        message="Are you sure? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
