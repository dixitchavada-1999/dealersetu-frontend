import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UnderDevelopment({ label }: { label?: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-6">
        <Construction size={40} className="text-amber-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        {label ? `${label} is under development` : 'Module under development'}
      </h1>
      <p className="text-slate-500 max-w-md mb-8">
        This module isn't ready yet — we're still building it. Please check back soon.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>
    </div>
  );
}
