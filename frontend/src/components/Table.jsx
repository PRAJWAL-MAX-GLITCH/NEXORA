import { Loader2 } from 'lucide-react';

export default function Table({ columns, data, loading, emptyState }) {
  if (loading && data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-xl border border-gray-200">
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return <div className="p-8 border border-gray-200 rounded-xl bg-white text-gray-500 text-center">{emptyState || 'No records found'}</div>;
  }

  return (
    <div className="overflow-x-auto w-full border border-gray-200 bg-white rounded-xl shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col, i) => (
              <th 
                key={i} 
                className={`px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors group">
              {columns.map((col, j) => (
                <td key={j} className={`px-6 py-4 text-sm text-gray-700 ${col.align === 'right' ? 'text-right' : ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
