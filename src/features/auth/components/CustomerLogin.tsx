import { User, Lock, ArrowRight, KeyRound } from 'lucide-react';
import AuthField from './AuthField';
import AuthButton from './AuthButton';
import type { useLogin } from '../hooks/useLogin';

type Props = {
  form: ReturnType<typeof useLogin>;
  onForgot: () => void;
  onActivate: () => void;
};

/** Customer portal sign-in (phone/email + password) with activation entry point. */
export default function CustomerLogin({ form, onForgot, onActivate }: Props) {
  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Customer Portal</h2>
      <p className="text-slate-600 mb-6">Sign in with your phone number or email</p>

      <form onSubmit={e => form.submitCustomer(e, onActivate)} className="space-y-5">
        <AuthField label="Phone Number or Email" icon={User} type="text" value={form.customerIdentifier} onChange={e => form.setCustomerIdentifier(e.target.value)} placeholder="9876543210 or email@example.com" autoComplete="username" />
        <AuthField label="Password" icon={Lock} type="password" value={form.customerPassword} onChange={e => form.setCustomerPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        <AuthButton loading={form.loading}>Sign In <ArrowRight size={18} /></AuthButton>
      </form>

      <p className="mt-4 text-center text-sm">
        <button onClick={onForgot} className="text-[#0F52BA] hover:text-[#0A3D8F] font-semibold transition-colors">Forgot Password?</button>
      </p>

      <div className="mt-6 pt-6 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-600 mb-2">First time here?</p>
        <button onClick={onActivate} className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors">
          <KeyRound size={16} /> Activate Your Account
        </button>
      </div>
    </>
  );
}
