import { useState } from 'react';
import { Lock } from 'lucide-react';
import { authApi, extractError } from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import FormField, { TextInput } from '../../../components/ui/FormField';
import toast from '../../../lib/toast';

/** Self-contained "change password" card. */
export default function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changing, setChanging] = useState(false);

  const handleChange = async () => {
    if (!currentPassword || !newPassword) return toast.error('Both fields are required');
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setChanging(true);
    try {
      await authApi.updatePassword(currentPassword, newPassword);
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setChanging(false);
    }
  };

  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><Lock size={20} className="text-slate-600" /></div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
          <p className="text-sm text-slate-500">Update your account password</p>
        </div>
      </div>
      <div className="space-y-4">
        <FormField label="Current Password"><TextInput type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></FormField>
        <FormField label="New Password"><TextInput type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></FormField>
        <Button icon={Lock} onClick={handleChange} disabled={changing}>{changing ? 'Changing...' : 'Change Password'}</Button>
      </div>
    </Card>
  );
}
