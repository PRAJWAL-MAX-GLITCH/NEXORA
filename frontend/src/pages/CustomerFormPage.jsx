import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomer, createCustomer, updateCustomer } from '../services/customer.service';
import { useToast } from '../context/useToast';
import { PageLoader } from '../components/Spinner';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { UserCircle, Briefcase, Tags, Save, ArrowLeft, History, Building2, CheckCircle } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';
import { StatusBadge } from '../components/Badge';

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <Icon className="h-4 w-4 text-brand" />
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', businessName: '',
    customerType: 'RETAIL', status: 'ACTIVE',
    followUpDate: '', notes: ''
  });
  const [createdAt, setCreatedAt] = useState(null);

  useEffect(() => {
    if (isEdit) {
      getCustomer(id)
        .then(data => {
          const date = data.followUpDate ? new Date(data.followUpDate).toISOString().split('T')[0] : '';
          setForm({ ...data, email: data.email || '', followUpDate: date, notes: data.notes || '' });
          setCreatedAt(data.createdAt);
        })
        .catch(() => { toast.error('Customer not found'); navigate('/customers'); })
        .finally(() => setLoading(false));
    }
  }, [id, navigate, toast, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : null };
      if (isEdit) await updateCustomer(id, payload);
      else await createCustomer(payload);
      toast.success(isEdit ? 'Profile updated' : 'Customer created');
      navigate('/customers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/customers')}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          {isEdit ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                {form.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{form.name}</h1>
                <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                  <Building2 className="h-3.5 w-3.5" />
                  {form.businessName || 'Individual'}
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <StatusBadge status={form.status} />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-bold text-gray-900">Add New Customer</h1>
              <p className="text-sm text-gray-500 mt-0.5">Create a new CRM profile.</p>
            </div>
          )}
        </div>
        {isEdit && (
          <Button icon={Save} onClick={handleSubmit} loading={saving}>Save Profile</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-5">
          <form id="customerForm" onSubmit={handleSubmit} className="space-y-5">
            <SectionCard icon={UserCircle} title="Contact Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
                </div>
                <Input label="Mobile Number" name="mobile" value={form.mobile} onChange={handleChange} required placeholder="9876543210" pattern="^\d{10}$" />
                <Input label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
              </div>
            </SectionCard>

            <SectionCard icon={Briefcase} title="Business Classification">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Input label="Business / Company Name" name="businessName" value={form.businessName} onChange={handleChange} placeholder="ABC Traders Ltd." />
                </div>
                <Select label="Customer Type" name="customerType" value={form.customerType} onChange={handleChange} required
                  options={[
                    { label: 'Retail', value: 'RETAIL' },
                    { label: 'Wholesale', value: 'WHOLESALE' },
                    { label: 'Distributor', value: 'DISTRIBUTOR' },
                  ]}
                />
                <Select label="Account Status" name="status" value={form.status} onChange={handleChange} required
                  options={[
                    { label: 'Active', value: 'ACTIVE' },
                    { label: 'Lead', value: 'LEAD' },
                    { label: 'Inactive', value: 'INACTIVE' },
                  ]}
                />
              </div>
            </SectionCard>

            {!isEdit && (
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => navigate('/customers')} disabled={saving}>Cancel</Button>
                <Button type="submit" loading={saving} icon={Save}>Create Customer</Button>
              </div>
            )}
          </form>
        </div>

        {/* Right: CRM Panel */}
        <div className="space-y-5">
          <SectionCard icon={Tags} title="CRM Notes & Follow-up">
            <div className="space-y-5">
              <Input label="Next Follow-up Date" type="date" name="followUpDate" value={form.followUpDate} onChange={handleChange} />
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Internal Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={5}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                  placeholder="Add context, conversation history, or requirements..."
                />
              </div>
              {isEdit && (
                <Button variant="secondary" className="w-full" onClick={handleSubmit} loading={saving}>
                  Save Notes
                </Button>
              )}
            </div>
          </SectionCard>

          {isEdit && createdAt && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50">
                <History className="h-4 w-4 text-gray-400" />
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Timeline</h2>
              </div>
              <div className="p-5">
                <div className="relative border-l-2 border-gray-100 ml-2 space-y-4">
                  <div className="pl-5 relative">
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
                      {formatDateTime(createdAt)}
                    </div>
                    <div className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Account Created
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Profile added to CRM.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
