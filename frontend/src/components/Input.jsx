export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>}
      <input
        className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all
          ${error ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 focus:ring-2 focus:ring-brand/20 focus:border-brand'}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 mt-0.5">{error}</span>}
    </div>
  );
}
