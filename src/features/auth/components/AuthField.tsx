import type { InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: LucideIcon;
  helper?: string;
};

const BASE =
  'w-full py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F52BA]/20 focus:border-[#0F52BA] outline-none text-sm text-slate-900 transition-all';

/** Light-themed labelled input for the auth screens, with an optional leading icon. */
export default function AuthField({ label, icon: Icon, helper, className = '', ...props }: AuthFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input className={`${BASE} ${Icon ? 'pl-11 pr-4' : 'px-3.5'} ${className}`} {...props} />
      </div>
      {helper && <p className="text-xs text-slate-500 mt-1.5">{helper}</p>}
    </div>
  );
}
