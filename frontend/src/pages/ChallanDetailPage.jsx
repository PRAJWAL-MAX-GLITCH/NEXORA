import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChallan, confirmChallan, cancelChallan } from '../services/challan.service';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { PageLoader } from '../components/Spinner';
import Button from '../components/Button';
import { StatusBadge } from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import { ArrowLeft, Printer, CheckCircle2, XCircle, Building2, User, Phone, AlertTriangle } from 'lucide-react';

export default function ChallanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { hasRole } = useAuth();

  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadChallan(); }, [id]);

  const loadChallan = () => {
    setLoading(true);
    getChallan(id)
      .then(data => setChallan(data))
      .catch(() => { toast.error('Challan not found'); navigate('/challans'); })
      .finally(() => setLoading(false));
  };

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      await confirmChallan(id);
      toast.success('Challan confirmed and inventory updated!');
      setConfirmModal(false);
      loadChallan();
    } catch (err) {
      toast.error(err.isForbidden ? err.friendlyMessage : (err.response?.data?.message || 'Failed to confirm challan'));
      setConfirmModal(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    setProcessing(true);
    try {
      await cancelChallan(id);
      toast.success('Challan cancelled');
      setCancelModal(false);
      loadChallan();
    } catch (err) {
      toast.error(err.isForbidden ? err.friendlyMessage : (err.response?.data?.message || 'Failed to cancel challan'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !challan) return <PageLoader />;

  const isDraft = challan.status === 'DRAFT';
  const totalValue = challan.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.priceAtTime || 0), 0);
  const totalQty = challan.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 print:hidden">
        <button
          onClick={() => navigate('/challans')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors w-max"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Challans
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
          {isDraft && hasRole('ADMIN') && (
            <button
              onClick={() => setCancelModal(true)}
              className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <XCircle className="h-4 w-4" /> Cancel Order
            </button>
          )}
          {isDraft && hasRole('ADMIN', 'WAREHOUSE') && (
            <button
              onClick={() => setConfirmModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" /> Confirm & Deduct Stock
            </button>
          )}
        </div>
      </div>

      {/* Draft Warning Banner */}
      {isDraft && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 print:hidden">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800">Draft — inventory not yet deducted</h4>
            <p className="text-xs text-amber-600 mt-0.5">Click "Confirm & Deduct Stock" to finalize this order.</p>
          </div>
        </div>
      )}

      {/* Main Document */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10 print:p-0 print:border-none print:shadow-none">

        {/* Doc Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3 print:hidden">
              <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
                <div className="w-2.5 h-2.5 border-2 border-white rounded-sm" />
              </div>
              <span className="text-sm font-bold text-gray-900">MINI ERP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Sales Order</h1>
            <div className="text-brand font-bold text-lg mt-1 font-mono">{challan.challanNumber}</div>
            <div className="flex items-center gap-3 mt-3">
              <StatusBadge status={challan.status} />
              <span className="text-xs text-gray-400">{formatDateTime(challan.createdAt)}</span>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="font-semibold text-gray-900 mb-1">Issued by</div>
            <div>{challan.user?.name}</div>
          </div>
        </div>

        {/* Customer Block */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mb-8">
          <h3 className="text-[10px] font-bold text-brand uppercase tracking-widest mb-4">Billed To</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                {challan.customer?.businessName || challan.customer?.name}
              </div>
              {challan.customer?.businessName && (
                <div className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                  <User className="h-3.5 w-3.5 text-gray-400" /> Attn: {challan.customer?.name}
                </div>
              )}
            </div>
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gray-400" /> {challan.customer?.mobile}
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {challan.customer?.customerType}
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="pb-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Item</th>
              <th className="pb-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="pb-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unit Price</th>
              <th className="pb-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {challan.items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4">
                  <div className="font-semibold text-gray-900">{item.product?.name}</div>
                  <div className="text-[10px] font-mono text-gray-400 uppercase mt-0.5">SKU: {item.product?.sku}</div>
                </td>
                <td className="py-4 text-center font-bold text-gray-900">{Number(item.quantity || 0)}</td>
                <td className="py-4 text-right text-gray-500">{formatCurrency(Number(item.priceAtTime || 0))}</td>
                <td className="py-4 text-right font-bold text-brand">{formatCurrency(Number(item.quantity || 0) * Number(item.priceAtTime || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end border-t border-gray-200 pt-6">
          <div className="w-56 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Items</span>
              <span className="font-semibold text-gray-900">{totalQty} units</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>Grand Total</span>
              <span className="text-brand">{formatCurrency(totalValue)}</span>
            </div>
          </div>
        </div>

        {/* Print footer */}
        <div className="hidden print:block mt-16 pt-6 border-t border-gray-200 text-[10px] text-gray-400 text-center uppercase tracking-widest">
          Mini ERP — Operations OS · Computer Generated Document
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmModal}
        title="Confirm & Deduct Stock?"
        message="This will finalize the order and permanently deduct the items from inventory. This cannot be undone."
        confirmLabel="Confirm & Deduct Stock"
        variant="success"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal(false)}
        loading={processing}
      />
      <ConfirmDialog
        isOpen={cancelModal}
        title="Cancel Challan?"
        message="Are you sure you want to cancel this draft? This cannot be undone."
        confirmLabel="Cancel Order"
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setCancelModal(false)}
        loading={processing}
      />
    </div>
  );
}
