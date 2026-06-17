import { useState } from 'react';
import AuthLayout from '../../components/AuthLayout';
import { useLogin } from './hooks/useLogin';
import { usePasswordReset } from './hooks/usePasswordReset';
import AdminLogin from './components/AdminLogin';
import CustomerLogin from './components/CustomerLogin';
import CustomerActivate from './components/CustomerActivate';
import ResetPasswordFlow from './components/ResetPasswordFlow';

type LoginMode = 'admin' | 'customer';
type CustomerView = 'login' | 'activate' | 'forgot';

/** Auth entry — admin + customer sign-in, activation, and password reset. */
export default function LoginPage() {
  const form = useLogin();
  const reset = usePasswordReset();
  const [mode, setMode] = useState<LoginMode>('admin');
  const [adminForgot, setAdminForgot] = useState(false);
  const [customerView, setCustomerView] = useState<CustomerView>('login');

  const selectMode = (m: LoginMode) => {
    setMode(m);
    setAdminForgot(false);
    if (m === 'customer') setCustomerView('login');
  };

  const startReset = () => { reset.reset(); };

  const exitAdminForgot = () => { setAdminForgot(false); reset.reset(); };
  const exitCustomerForgot = () => { setCustomerView('login'); reset.reset(); };

  return (
    <AuthLayout
      tagline={mode === 'admin' ? 'Manage your business with confidence' : 'Shop smarter, order faster'}
      description={mode === 'admin'
        ? 'A powerful admin panel to manage your products, orders, customers, and team all in one place.'
        : 'Browse products, place orders, and track deliveries all from one convenient portal.'}
    >
      {/* Login Mode Tabs */}
      <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 mb-8">
        <button
          onClick={() => selectMode('admin')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Admin Login
        </button>
        <button
          onClick={() => selectMode('customer')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'customer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Customer Login
        </button>
      </div>

      {mode === 'admin' ? (
        adminForgot ? (
          <ResetPasswordFlow reset={reset} onBack={exitAdminForgot} />
        ) : (
          <AdminLogin form={form} onForgot={() => { setAdminForgot(true); startReset(); }} />
        )
      ) : (
        <>
          {customerView === 'login' && (
            <CustomerLogin
              form={form}
              onForgot={() => { setCustomerView('forgot'); startReset(); }}
              onActivate={() => setCustomerView('activate')}
            />
          )}
          {customerView === 'activate' && <CustomerActivate form={form} onBack={() => setCustomerView('login')} />}
          {customerView === 'forgot' && <ResetPasswordFlow reset={reset} allowPhone onBack={exitCustomerForgot} />}

          {customerView !== 'forgot' && (
            <p className="mt-8 text-center text-sm text-slate-600">
              Are you an admin?{' '}
              <button onClick={() => selectMode('admin')} className="text-[#0F52BA] hover:text-[#0A3D8F] font-semibold transition-colors">Sign in here</button>
            </p>
          )}
        </>
      )}
    </AuthLayout>
  );
}
