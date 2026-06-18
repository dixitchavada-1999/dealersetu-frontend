import { useState } from 'react';
import type { FormEvent } from 'react';
import { authApi } from '../../../lib/api';
import { extractError } from '../../../contexts/AuthContext';
import toast from '../../../lib/toast';

export type ResetStep = 'email' | 'otp' | 'done';

/** Shared forgot/reset-password flow (email → OTP → done) for admin and customer. */
export function usePasswordReset() {
  const [step, setStep] = useState<ResetStep>('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep('email');
    setIdentifier('');
    setOtp('');
    setPassword('');
    setConfirmPassword('');
  };

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!identifier) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authApi.forgotPassword(identifier);
      toast.success('If an account exists, an OTP has been sent to your email.');
      setStep('otp');
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp || !password) return toast.error('Please fill in all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authApi.resetPassword(identifier, otp, password);
      toast.success('Password reset successfully!');
      setStep('done');
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    step, identifier, setIdentifier, otp, setOtp, password, setPassword,
    confirmPassword, setConfirmPassword,
    loading, reset, submitEmail, submitReset,
  };
}
