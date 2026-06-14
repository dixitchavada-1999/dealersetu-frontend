import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, extractError } from '../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import toast from '../lib/toast';

export default function Register() {
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

  const fields = [
    { key: 'firstName', label: 'First Name *', type: 'text', half: true },
    { key: 'lastName', label: 'Last Name', type: 'text', half: true },
    { key: 'email', label: 'Email *', type: 'email' },
    { key: 'userName', label: 'Username *', type: 'text' },
    { key: 'password', label: 'Password *', type: 'password' },
    { key: 'mobileNumber', label: 'Mobile Number *', type: 'tel' },
    { key: 'businessName', label: 'Business Name', type: 'text' },
  ];

  return (
    <AuthLayout
      tagline="Start growing your B2B business"
      description="Create your account in seconds and get instant access to products, orders, dispatch, marketing — everything in one platform."
    >
      <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
      <p className="text-slate-400 mb-6 text-sm">Register your admin account to get started</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {fields.filter(f => f.half).map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={set(f.key)} className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm text-white transition-all" />
            </div>
          ))}
        </div>
        {fields.filter(f => !f.half).map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">{f.label}</label>
            <input type={f.type} value={(form as any)[f.key]} onChange={set(f.key)} className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm text-white transition-all" />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          style={{
            background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
            boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3)',
          }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Create Account <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-[#00C9A7] hover:text-[#14b8a6] font-semibold transition-colors">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
