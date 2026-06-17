import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import AuthField from './AuthField';
import AuthButton from './AuthButton';
import type { useLogin } from '../hooks/useLogin';

type Props = {
  form: ReturnType<typeof useLogin>;
  onForgot: () => void;
};

/** Admin/owner email + password sign-in form. */
export default function AdminLogin({ form, onForgot }: Props) {
  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
      <p className="text-slate-600 mb-8">Sign in to your admin account</p>
      <form onSubmit={form.submitAdmin} className="space-y-5">
        <AuthField label="Email or Username" icon={Mail} type="text" value={form.email} onChange={e => form.setEmail(e.target.value)} placeholder="email@example.com or username" autoComplete="email" />
        <AuthField label="Password" icon={Lock} type="password" value={form.password} onChange={e => form.setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        <AuthButton loading={form.loading}>Sign In <ArrowRight size={18} /></AuthButton>
      </form>

      <p className="mt-4 text-center text-sm">
        <button onClick={onForgot} className="text-[#0F52BA] hover:text-[#0A3D8F] font-semibold transition-colors">Forgot Password?</button>
      </p>
      <p className="mt-4 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#0F52BA] hover:text-[#0A3D8F] font-semibold transition-colors">Create account</Link>
      </p>
    </>
  );
}
