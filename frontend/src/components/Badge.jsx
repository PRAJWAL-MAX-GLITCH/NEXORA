import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export function StatusBadge({ status }) {
  if (!status) return null;
  const s = status.toUpperCase();
  
  const getStyles = () => {
    switch (s) {
      case 'ACTIVE':
      case 'CONFIRMED':
      case 'IN':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'LEAD':
      case 'DRAFT':
      case 'OUT':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'INACTIVE':
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${getStyles()}`}>
      {status}
    </span>
  );
}
