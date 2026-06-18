import { Mail, Lock, ArrowRight, RotateCcw, ShieldCheck, CheckCircle } from 'lucide-react';
import AuthField from './AuthField';
import AuthButton from './AuthButton';
import type { usePasswordReset } from '../hooks/usePasswordReset';

type Props = {
  reset: ReturnType<typeof usePasswordReset>;
  /** Allow email or phone (customer) vs email-only (admin). */
  allowPhone?: boolean;
  onBack: () => void;
};

/** Email → OTP → done password reset UI, driven by the usePasswordReset hook. */
export default function ResetPasswordFlow({ reset, allowPhone, onBack }: Props) {
  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset Password</h2>
      <p className="text-slate-600 mb-8">
        {reset.step === 'email' && (allowPhone ? 'Enter your email or phone number' : 'Enter your email to receive a reset OTP')}
        {reset.step === 'otp' && 'Enter the OTP sent to your email and your new password'}
        {reset.step === 'done' && 'Your password has been reset successfully'}
      </p>

      {reset.step === 'email' && (
        <form onSubmit={reset.submitEmail} className="space-y-5">
          <AuthField
            label={allowPhone ? 'Email or Phone Number' : 'Email address'}
            icon={Mail}
            type="text"
            value={reset.identifier}
            onChange={e => reset.setIdentifier(e.target.value)}
            placeholder={allowPhone ? 'email@example.com or 9876543210' : 'admin@example.com'}
            helper={allowPhone ? 'OTP will be sent to your email address on file' : undefined}
          />
          <AuthButton loading={reset.loading}>Send OTP <ArrowRight size={18} /></AuthButton>
        </form>
      )}

      {reset.step === 'otp' && (
        <form onSubmit={reset.submitReset} className="space-y-5">
          <AuthField
            label="OTP Code"
            icon={ShieldCheck}
            type="text"
            inputMode="numeric"
            value={reset.otp}
            onChange={e => reset.setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="tracking-widest font-mono text-lg"
            placeholder="000000"
          />
          <AuthField
            label="New Password"
            icon={Lock}
            type="password"
            value={reset.password}
            onChange={e => reset.setPassword(e.target.value)}
            placeholder="Min. 6 characters"
          />
          <AuthField
            label="Confirm Password"
            icon={Lock}
            type="password"
            value={reset.confirmPassword}
            onChange={e => reset.setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
          />
          <AuthButton loading={reset.loading}>Reset Password <RotateCcw size={18} /></AuthButton>
        </form>
      )}

      {reset.step === 'done' && (
        <div className="text-center">
          <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-6">Password has been reset. You can now log in with your new password.</p>
          <AuthButton type="button" onClick={onBack}>Back to Login</AuthButton>
        </div>
      )}

      {reset.step !== 'done' && (
        <p className="mt-4 text-center text-sm">
          <button onClick={onBack} className="text-[#0F52BA] hover:text-[#0A3D8F] font-semibold transition-colors">Back to Login</button>
        </p>
      )}
    </>
  );
}
