import { KeyRound, Lock, ArrowRight } from 'lucide-react';
import AuthField from './AuthField';
import AuthButton from './AuthButton';
import type { useLogin } from '../hooks/useLogin';

type Props = {
  form: ReturnType<typeof useLogin>;
  onBack: () => void;
};

/** First-time customer account activation (code + set password). */
export default function CustomerActivate({ form, onBack }: Props) {
  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-1">Activate Account</h2>
      <p className="text-slate-400 mb-6">Enter the code from your admin and set your password</p>

      <form onSubmit={form.submitActivate} className="space-y-5">
        <AuthField
          label="Activation Code"
          icon={KeyRound}
          type="text"
          value={form.activationCode}
          onChange={e => form.setActivationCode(e.target.value.toUpperCase())}
          placeholder="ABCD1234"
          autoComplete="off"
          maxLength={8}
          className="tracking-wider font-mono"
          helper="8-character code provided by your admin via email or SMS"
        />
        <AuthField label="Set Password" icon={Lock} type="password" value={form.newPassword} onChange={e => form.setNewPassword(e.target.value)} placeholder="Min. 6 characters" />
        <AuthField label="Confirm Password" icon={Lock} type="password" value={form.confirmPassword} onChange={e => form.setConfirmPassword(e.target.value)} placeholder="••••••••" />
        <AuthButton loading={form.loading}>Activate & Sign In <ArrowRight size={18} /></AuthButton>
      </form>

      <p className="mt-4 text-center text-sm">
        Already have a password?{' '}
        <button onClick={onBack} className="text-[#00C9A7] hover:text-[#14b8a6] font-semibold transition-colors">Sign In</button>
      </p>
    </>
  );
}
