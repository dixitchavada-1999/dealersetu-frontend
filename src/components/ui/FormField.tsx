import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

const FIELD =
  'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm';

type FieldProps = {
  label?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

/** Label + control wrapper for forms. */
export default function FormField({ label, required, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}{required && ' *'}
        </label>
      )}
      {children}
    </div>
  );
}

/** Standard text input matching the app's field styling. */
export function TextInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${FIELD} ${className}`} {...props} />;
}

/** Standard textarea matching the app's field styling. */
export function TextArea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${FIELD} resize-none ${className}`} {...props} />;
}
