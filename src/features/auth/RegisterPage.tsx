import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth, extractError } from '../../contexts/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import AuthField from './components/AuthField';
import AuthButton from './components/AuthButton';
import toast from '../../lib/toast';

const HALF_FIELDS = [
  { key: 'firstName', label: 'First Name *', type: 'text' },
  { key: 'lastName', label: 'Last Name', type: 'text' },
] as const;

const FULL_FIELDS = [
  { key: 'email', label: 'Email *', type: 'email' },
  { key: 'userName', label: 'Username *', type: 'text' },
  { key: 'password', label: 'Password *', type: 'password' },
  { key: 'mobileNumber', label: 'Mobile Number *', type: 'tel' },
  { key: 'businessName', label: 'Business Name', type: 'text' },
] as const;

/** Admin account self-registration. */
export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', userName: '', password: '', mobileNumber: '', businessName: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.userName || !form.password || !form.mobileNumber) {
      return toast.error('Please fill in all required fields');
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      tagline="Start growing your B2B business"
      description="Create your account in seconds and get instant access to products, orders, dispatch, marketing — everything in one platform."
    >
      <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
      <p className="text-slate-400 mb-6 text-sm">Register your admin account to get started</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {HALF_FIELDS.map(f => (
            <AuthField key={f.key} label={f.label} type={f.type} value={(form as any)[f.key]} onChange={set(f.key)} />
          ))}
        </div>
        {FULL_FIELDS.map(f => (
          <AuthField key={f.key} label={f.label} type={f.type} value={(form as any)[f.key]} onChange={set(f.key)} />
        ))}
        <div className="pt-1">
          <AuthButton loading={loading}>Create Account <ArrowRight size={18} /></AuthButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-[#00C9A7] hover:text-[#14b8a6] font-semibold transition-colors">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
