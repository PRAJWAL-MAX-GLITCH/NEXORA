import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, variant = 'primary', size = 'md', 
  loading, icon: Icon, className = '', ...props 
}) {
  const baseStyle = "inline-flex items-center justify-center font-bold transition-all rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-hover shadow-sm border border-transparent",
    secondary: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm",
    danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm border border-transparent",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
  };

  const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading} {...props}>
      {loading ? (
        <Loader2 className="animate-spin h-4 w-4 mr-2" />
      ) : Icon ? (
        <Icon className={`h-4 w-4 ${children ? 'mr-2' : ''}`} />
      ) : null}
      {children}
    </button>
  );
}
