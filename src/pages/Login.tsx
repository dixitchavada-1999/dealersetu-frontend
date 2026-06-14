import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, extractError } from '../contexts/AuthContext';
import { authApi } from '../lib/api';
import { Mail, Lock, ArrowRight, KeyRound, RotateCcw, ShieldCheck, CheckCircle, User } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import toast from '../lib/toast';

export default function Login() {
  const [loginMode, setLoginMode] = useState<'admin' | 'customer'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, activateAccount } = useAuth();
  const navigate = useNavigate();

  // Customer states
  const [customerView, setCustomerView] = useState<'login' | 'activate' | 'forgot'>('login');
  const [customerIdentifier, setCustomerIdentifier] = useState(''); // phone or email
  const [customerPassword, setCustomerPassword] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password states (shared between admin and customer)
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'done'>('email');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier) return toast.error('Please enter your email');
    setResetLoading(true);
    try {
      await authApi.forgotPassword(resetIdentifier);
      toast.success('If an account exists, an OTP has been sent to your email.');
      setResetStep('otp');
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetOtp || !resetPassword) return toast.error('Please fill in all fields');
    if (resetPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setResetLoading(true);
    try {
      await authApi.resetPassword(resetIdentifier, resetOtp, resetPassword);
      toast.success('Password reset successfully!');
      setResetStep('done');
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setResetLoading(false);
    }
  };

  const exitForgotMode = () => {
    setForgotMode(false);
    setCustomerView('login');
    setResetStep('email');
    setResetIdentifier('');
    setResetOtp('');
    setResetPassword('');
  };

  const handleAdminSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(email, password);
      const stored = localStorage.getItem('user');
      const u = stored ? JSON.parse(stored) : null;
      navigate(u?.isSuperAdmin ? '/super-admin/tenants' : '/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerIdentifier.trim() || !customerPassword) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(customerIdentifier.trim(), customerPassword);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = extractError(err);
      // Check if backend says account needs activation
      if (err?.response?.data?.data?.needsActivation) {
        toast.error('Account not activated. Please enter your activation code first.');
        setCustomerView('activate');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) return toast.error('Please enter your activation code');
    if (!newPassword || newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await activateAccount(activationCode.trim(), newPassword, confirmPassword);
      toast.success('Account activated successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerForgot = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier) return toast.error('Please enter your email or phone number');
    setResetLoading(true);
    try {
      await authApi.forgotPassword(resetIdentifier);
      toast.success('If an account exists, an OTP has been sent to your email.');
      setResetStep('otp');
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <AuthLayout
      tagline={loginMode === 'admin' ? 'Manage your business with confidence' : 'Shop smarter, order faster'}
      description={loginMode === 'admin'
        ? 'A powerful admin panel to manage your products, orders, customers, and team all in one place.'
        : 'Browse products, place orders, and track deliveries all from one convenient portal.'}
    >
          {/* Login Mode Tabs */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setLoginMode('admin'); setForgotMode(false); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                loginMode === 'admin'
                  ? 'bg-card text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Login
            </button>
            <button
              onClick={() => { setLoginMode('customer'); setForgotMode(false); setCustomerView('login'); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                loginMode === 'customer'
                  ? 'bg-card text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Customer Login
            </button>
          </div>

          {loginMode === 'admin' ? (
            forgotMode ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
                <p className="text-slate-400 mb-8">
                  {resetStep === 'email' && 'Enter your email to receive a reset OTP'}
                  {resetStep === 'otp' && 'Enter the OTP sent to your email and your new password'}
                  {resetStep === 'done' && 'Your password has been reset successfully'}
                </p>

                {resetStep === 'email' && (
                  <form onSubmit={handleForgotSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Email address</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" value={resetIdentifier} onChange={e => setResetIdentifier(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all" placeholder="admin@example.com" />
                      </div>
                    </div>
                    <button type="submit" disabled={resetLoading} className="w-full py-2.5 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3)' }}>
                      {resetLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send OTP <ArrowRight size={18} /></>}
                    </button>
                  </form>
                )}

                {resetStep === 'otp' && (
                  <form onSubmit={handleResetSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">OTP Code</label>
                      <div className="relative">
                        <ShieldCheck size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={resetOtp} onChange={e => setResetOtp(e.target.value)} maxLength={6} className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all tracking-widest font-mono text-lg" placeholder="000000" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">New Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all" placeholder="Min. 6 characters" />
                      </div>
                    </div>
                    <button type="submit" disabled={resetLoading} className="w-full py-2.5 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3)' }}>
                      {resetLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Reset Password <RotateCcw size={18} /></>}
                    </button>
                  </form>
                )}

                {resetStep === 'done' && (
                  <div className="text-center">
                    <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                    <p className="text-slate-300 mb-6">Password has been reset. You can now log in with your new password.</p>
                    <button onClick={exitForgotMode} className="w-full py-2.5 text-white rounded-xl font-semibold transition-all" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)' }}>Back to Login</button>
                  </div>
                )}

                {resetStep !== 'done' && (
                  <p className="mt-4 text-center text-sm">
                    <button onClick={exitForgotMode} className="text-[#00C9A7] hover:text-[#14b8a6] font-semibold transition-colors">Back to Login</button>
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
                <p className="text-slate-400 mb-8">Sign in to your admin account</p>
                <form onSubmit={handleAdminSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">Email or Username</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all" placeholder="email@example.com or username" autoComplete="email" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all" placeholder="••••••••" autoComplete="current-password" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-2.5 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3)' }}>
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm">
                  <button onClick={() => { setForgotMode(true); setResetIdentifier(''); }} className="text-[#00C9A7] hover:text-[#14b8a6] font-semibold transition-colors">Forgot Password?</button>
                </p>

                <p className="mt-4 text-center text-sm text-slate-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-[#00C9A7] hover:text-[#14b8a6] font-semibold transition-colors">Create account</Link>
                </p>
              </>
            )
          ) : (
            /* ── Customer Login Section ── */
            <>
              {customerView === 'login' && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-1">Customer Portal</h2>
                  <p className="text-slate-400 mb-6">Sign in with your phone number or email</p>

                  <form onSubmit={handleCustomerLogin} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Phone Number or Email</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={customerIdentifier}
                          onChange={e => setCustomerIdentifier(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all"
                          placeholder="9876543210 or email@example.com"
                          autoComplete="username"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          value={customerPassword}
                          onChange={e => setCustomerPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all"
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-2.5 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3)' }}>
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
                    </button>
                  </form>

                  <p className="mt-4 text-center text-sm">
                    <button onClick={() => { setCustomerView('forgot'); setResetStep('email'); setResetIdentifier(''); }} className="text-[#00C9A7] hover:text-[#14b8a6] font-semibold transition-colors">Forgot Password?</button>
                  </p>

                  <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <p className="text-sm text-slate-400 mb-2">First time here?</p>
                    <button
                      onClick={() => setCustomerView('activate')}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-200 transition-colors"
                    >
                      <KeyRound size={16} /> Activate Your Account
                    </button>
                  </div>
                </>
              )}

              {customerView === 'activate' && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-1">Activate Account</h2>
                  <p className="text-slate-400 mb-6">Enter the code from your admin and set your password</p>

                  <form onSubmit={handleActivate} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Activation Code</label>
                      <div className="relative">
                        <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={activationCode}
                          onChange={e => setActivationCode(e.target.value.toUpperCase())}
                          className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all tracking-wider font-mono"
                          placeholder="ABCD1234"
                          autoComplete="off"
                          maxLength={8}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">8-character code provided by your admin via email or SMS</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Set Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all"
                          placeholder="Min. 6 characters"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-2.5 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3)' }}>
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Activate & Sign In <ArrowRight size={18} /></>}
                    </button>
                  </form>

                  <p className="mt-4 text-center text-sm">
                    Already have a password?{' '}
                    <button onClick={() => setCustomerView('login')} className="text-[#00C9A7] hover:text-[#14b8a6] font-semibold transition-colors">Sign In</button>
                  </p>
                </>
              )}

              {customerView === 'forgot' && (
                <>
                  <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
                  <p className="text-slate-400 mb-6">
                    {resetStep === 'email' && 'Enter your email or phone number'}
                    {resetStep === 'otp' && 'Enter the OTP sent to your email and your new password'}
                    {resetStep === 'done' && 'Your password has been reset successfully'}
                  </p>

                  {resetStep === 'email' && (
                    <form onSubmit={handleCustomerForgot} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1.5">Email or Phone Number</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" value={resetIdentifier} onChange={e => setResetIdentifier(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all" placeholder="email@example.com or 9876543210" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">OTP will be sent to your email address on file</p>
                      </div>
                      <button type="submit" disabled={resetLoading} className="w-full py-2.5 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3)' }}>
                        {resetLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send OTP <ArrowRight size={18} /></>}
                      </button>
                    </form>
                  )}

                  {resetStep === 'otp' && (
                    <form onSubmit={handleResetSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1.5">OTP Code</label>
                        <div className="relative">
                          <ShieldCheck size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" inputMode="numeric" value={resetOtp} onChange={e => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all tracking-widest font-mono text-lg" placeholder="000000" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1.5">New Password</label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] outline-none text-sm transition-all" placeholder="Min. 6 characters" />
                        </div>
                      </div>
                      <button type="submit" disabled={resetLoading} className="w-full py-2.5 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3)' }}>
                        {resetLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Reset Password <RotateCcw size={18} /></>}
                      </button>
                    </form>
                  )}

                  {resetStep === 'done' && (
                    <div className="text-center">
                      <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                      <p className="text-slate-300 mb-6">Password has been reset. You can now log in.</p>
                      <button onClick={exitForgotMode} className="w-full py-2.5 text-white rounded-xl font-semibold transition-all" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)' }}>Back to Login</button>
                    </div>
                  )}

                  {resetStep !== 'done' && (
                    <p className="mt-4 text-center text-sm">
                      <button onClick={() => setCustomerView('login')} className="text-[#00C9A7] hover:text-[#14b8a6] font-semibold transition-colors">Back to Login</button>
                    </p>
                  )}
                </>
              )}

              {customerView !== 'forgot' && (
                <p className="mt-8 text-center text-sm text-slate-400">
                  Are you an admin?{' '}
                  <button onClick={() => setLoginMode('admin')} className="text-[#00C9A7] hover:text-[#14b8a6] font-semibold transition-colors">Sign in here</button>
                </p>
              )}
            </>
          )}
    </AuthLayout>
  );
}
