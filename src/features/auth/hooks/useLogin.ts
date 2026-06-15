import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, extractError } from '../../../contexts/AuthContext';
import toast from '../../../lib/toast';

type OnNeedsActivation = () => void;

/** Admin + customer sign-in and account-activation logic. */
export function useLogin() {
  const { login, activateAccount } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Customer login
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');

  // Customer activation
  const [activationCode, setActivationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const submitAdmin = async (e: FormEvent) => {
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

  const submitCustomer = async (e: FormEvent, onNeedsActivation: OnNeedsActivation) => {
    e.preventDefault();
    if (!customerIdentifier.trim() || !customerPassword) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(customerIdentifier.trim(), customerPassword);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      if (err?.response?.data?.data?.needsActivation) {
        toast.error('Account not activated. Please enter your activation code first.');
        onNeedsActivation();
      } else {
        toast.error(extractError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const submitActivate = async (e: FormEvent) => {
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

  return {
    loading,
    email, setEmail, password, setPassword, submitAdmin,
    customerIdentifier, setCustomerIdentifier, customerPassword, setCustomerPassword, submitCustomer,
    activationCode, setActivationCode, newPassword, setNewPassword, confirmPassword, setConfirmPassword, submitActivate,
  };
}
