import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', variant = 'danger', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Confirm Action" size="sm">
      <div className="flex flex-col items-center text-center pb-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-sm border
          ${variant === 'danger' ? 'bg-red-50 text-red-600 border-red-100' : 
            variant === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 
            'bg-blue-50 text-brand border-blue-100'}`}
        >
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-8">{message}</p>
        
        <div className="flex justify-center gap-3 w-full">
          <Button variant="secondary" onClick={onCancel} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
