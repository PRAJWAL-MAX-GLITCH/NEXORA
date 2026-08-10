import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../services/customer.service';
import { getProducts } from '../services/product.service';
import { createChallan } from '../services/challan.service';
import { useToast } from '../context/useToast';
import { PageLoader } from '../components/Spinner';
import { formatCurrency } from '../utils/helpers';
import { ArrowLeft, ArrowRight, UserCircle, Package, Trash2, Plus, CheckCircle2, AlertCircle, ShoppingCart, FileEdit } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Customer', icon: UserCircle },
  { num: 2, label: 'Products', icon: Package },
  { num: 3, label: 'Review', icon: CheckCircle2 },
];

export default function ChallanFormPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    Promise.all([
      getCustomers({ limit: 1000, status: 'ACTIVE' }),
      getProducts({ limit: 1000 })
    ]).then(([cust, prod]) => {
      setCustomers(cust.customers);
      setProducts(prod.products);
    }).catch((err) => {
      if (err.isForbidden) {
        toast.error('You do not have permission to create challans');
        navigate('/challans');
      } else {
        toast.error('Failed to load form data');
      }
    }).finally(() => setLoading(false));
  }, [toast, navigate]);

  const handleAddItem = () => setItems([...items, { productId: '', quantity: 1 }]);
  const handleRemoveItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const handleItemChange = (i, field, value) => {
    const next = [...items];
    next[i][field] = value;
    setItems(next);
  };

  const totalQty = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
  const totalValue = items.reduce((s, i) => {
    const p = products.find(x => x.id === i.productId);
    return s + Number(i.quantity || 0) * (p?.unitPrice || 0);
  }, 0);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error('Add at least one product');
    if (items.some(i => !i.productId || i.quantity <= 0)) return toast.error('Fill out all item details');
    setSaving(true);
    try {
      const res = await createChallan({
        customerId: selectedCustomerId,
        items: items.map(i => ({ productId: i.productId, quantity: Number(i.quantity) }))
      });
      toast.success('Draft challan created');
      navigate(`/challans/${res.id}`);
    } catch (err) {
      toast.error(err.isForbidden ? err.friendlyMessage : (err.response?.data?.message || 'Failed to create challan'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/challans')}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create Sales Challan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Select customer and configure line items.</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-10 right-10 h-px bg-gray-200 -z-10" />
          {STEPS.map(s => {
            const isActive = step === s.num;
            const isPast = step > s.num;
            return (
              <div key={s.num} className="flex flex-col items-center gap-2 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all shadow-sm
                  ${isActive ? 'bg-brand text-white shadow-[0_0_0_3px_rgba(49,87,213,0.2)]' : isPast ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {isPast ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs font-semibold ${isActive ? 'text-brand' : isPast ? 'text-green-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Step 1: Customer Selection */}
        {step === 1 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gray-50">
              <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-brand">
                <UserCircle className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Select Customer</h2>
                <p className="text-xs text-gray-400">Choose an active account to bill.</p>
              </div>
            </div>
            <div className="p-8 max-w-md">
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Customer Account *</label>
                <select
                  required
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                >
                  <option value="" disabled>Choose a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}{c.businessName ? ` — ${c.businessName}` : ''}</option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <div className="font-semibold text-gray-900 text-sm">{selectedCustomer.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{selectedCustomer.businessName || 'Individual'} · {selectedCustomer.mobile}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => selectedCustomerId ? setStep(2) : toast.error('Select a customer first')}
                className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                Continue to Products <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Line Items */}
        {step === 2 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-brand">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Line Items</h2>
                  <p className="text-xs text-gray-400">Add products and quantities.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-2/5">Product</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">In Stock</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subtotal</th>
                    <th className="px-6 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-14 text-center">
                        <ShoppingCart className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">No products yet. Click "Add Item" to start.</p>
                      </td>
                    </tr>
                  ) : items.map((item, idx) => {
                    const product = products.find(p => p.id === item.productId);
                    const isInsufficient = product && Number(item.quantity) > product.currentStock;
                    return (
                      <tr key={idx} className={`hover:bg-gray-50/50 transition-colors ${isInsufficient ? 'bg-red-50/50' : ''}`}>
                        <td className="px-6 py-4">
                          <select
                            required
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                            value={item.productId}
                            onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                          >
                            <option value="" disabled>Select product...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          {product ? (
                            <span className={`text-sm font-semibold tabular-nums ${product.currentStock <= product.minimumStock ? 'text-amber-600' : 'text-green-600'}`}>
                              {product.currentStock}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative w-24">
                            <input
                              type="number" min="1" required
                              className={`w-full border rounded-lg px-3 py-2 text-sm font-semibold text-center outline-none focus:ring-2 transition-all
                                ${isInsufficient ? 'border-red-300 bg-red-50 text-red-700 focus:ring-red-200' : 'border-gray-300 bg-white text-gray-900 focus:ring-brand/20 focus:border-brand'}`}
                              value={item.quantity}
                              onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                            />
                            {isInsufficient && (
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-red-600 font-semibold whitespace-nowrap">
                                <AlertCircle className="h-3 w-3" /> Insufficient
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {product ? formatCurrency(product.unitPrice * Number(item.quantity || 0)) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <button type="button" onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button type="button" onClick={() => setStep(1)}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                ← Back
              </button>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{items.length} items · {totalQty} units</div>
                  <div className="text-xl font-bold text-brand mt-0.5">{formatCurrency(totalValue)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (items.length === 0) return toast.error('Add at least one item');
                    if (items.some(i => !i.productId || i.quantity <= 0)) return toast.error('Check item details');
                    setStep(3);
                  }}
                  className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Review Order <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-gray-50">
              <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-brand">
                <FileEdit className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Order Review</h2>
                <p className="text-xs text-gray-400">Confirm details before creating the draft.</p>
              </div>
            </div>
            <div className="p-8">
              {/* Customer summary */}
              {selectedCustomer && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Billing To</div>
                  <div className="font-semibold text-gray-900">{selectedCustomer.name}</div>
                  <div className="text-sm text-gray-500">{selectedCustomer.businessName} · {selectedCustomer.mobile}</div>
                </div>
              )}

              {/* Items summary */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, idx) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <tr key={idx}>
                          <td className="px-5 py-3 font-medium text-gray-900">{product?.name}</td>
                          <td className="px-5 py-3 text-center text-gray-600">{item.quantity}</td>
                          <td className="px-5 py-3 text-right font-semibold text-gray-900">
                            {product ? formatCurrency(product.unitPrice * Number(item.quantity)) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan="2" className="px-5 py-3 text-sm font-bold text-gray-700">Total</td>
                      <td className="px-5 py-3 text-right font-bold text-brand">{formatCurrency(totalValue)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Inventory notice */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  <strong>Note:</strong> Saving as draft will <strong>NOT</strong> deduct inventory. You must confirm the challan on the next screen to deduct stock.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors bg-white">
                  ← Edit Items
                </button>
                <button
                  type="submit" disabled={saving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {saving ? 'Creating...' : 'Create Draft Challan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
