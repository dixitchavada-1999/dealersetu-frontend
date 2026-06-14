import { useState } from 'react';
import { User, Lock, Mail, Phone, Shield, Pencil, Save, X } from 'lucide-react';
import { useAuth, extractError } from '../../../contexts/AuthContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import toast from '../../../lib/toast';

/** Editable profile info card (name, email, mobile, username + role). */
export default function ProfileInfoCard() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setEditFirstName(user?.firstName || '');
    setEditLastName(user?.lastName || '');
    setEditEmail(user?.email || '');
    setEditMobile(user?.mobileNumber || '');
    setConfirmPassword('');
    setIsEditing(true);
  };
  const cancelEditing = () => { setIsEditing(false); setConfirmPassword(''); };

  const emailChanged = editEmail.toLowerCase().trim() !== (user?.email || '').toLowerCase();
  const mobileChanged = editMobile.trim() !== (user?.mobileNumber || '');
  const needsPassword = emailChanged || mobileChanged;

  const handleSave = async () => {
    if (needsPassword && !confirmPassword) return toast.error('Password required to change email or mobile number');
    setSaving(true);
    try {
      const payload: any = {};
      if (editFirstName.trim() !== (user?.firstName || '')) payload.firstName = editFirstName.trim();
      if (editLastName.trim() !== (user?.lastName || '')) payload.lastName = editLastName.trim();
      if (emailChanged) payload.email = editEmail.trim();
      if (mobileChanged) payload.mobileNumber = editMobile.trim();
      if (confirmPassword) payload.password = confirmPassword;

      if (Object.keys(payload).length === 0 || (Object.keys(payload).length === 1 && payload.password)) {
        toast('No changes to save');
        setIsEditing(false);
        return;
      }
      await updateProfile(payload);
      toast.success('Profile updated');
      setIsEditing(false);
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = user?.isAdmin ? 'Administrator' : user?.isDispatch ? 'Dispatch' : user?.isProduction ? 'Production' : user?.isMarketing ? 'Marketing' : 'User';

  return (
    <Card padding="lg" className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
            {(isEditing ? editFirstName : user?.firstName)?.[0]}{(isEditing ? editLastName : user?.lastName)?.[0]}
          </div>
          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} placeholder="First Name" className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold w-32 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} placeholder="Last Name" className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold w-32 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
              </div>
            ) : (
              <h2 className="text-xl font-bold text-slate-900">{user?.firstName} {user?.lastName}</h2>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 mt-1"><Shield size={12} />{roleLabel}</span>
          </div>
        </div>
        {!isEditing ? (
          <Button variant="secondary" size="sm" icon={Pencil} onClick={startEditing}>Edit</Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={X} onClick={cancelEditing}>Cancel</Button>
            <Button size="sm" icon={Save} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <Mail size={18} className="text-slate-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-400">Email</p>
            {isEditing ? (
              <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full text-sm font-medium text-slate-700 bg-transparent border-none outline-none p-0 mt-0.5" placeholder="email@example.com" />
            ) : (
              <p className="text-sm font-medium text-slate-700">{user?.email || '-'}</p>
            )}
          </div>
          {isEditing && emailChanged && <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium">Changed</span>}
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <Phone size={18} className="text-slate-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-slate-400">Mobile Number</p>
            {isEditing ? (
              <input value={editMobile} onChange={(e) => setEditMobile(e.target.value)} className="w-full text-sm font-medium text-slate-700 bg-transparent border-none outline-none p-0 mt-0.5" placeholder="+919876543210" />
            ) : (
              <p className="text-sm font-medium text-slate-700">{user?.mobileNumber || '-'}</p>
            )}
          </div>
          {isEditing && mobileChanged && <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium">Changed</span>}
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <User size={18} className="text-slate-400" />
          <div><p className="text-xs text-slate-400">Username</p><p className="text-sm font-medium text-slate-700">{user?.userName}</p></div>
        </div>

        {isEditing && needsPassword && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700 font-medium mb-2">Password required to change email or mobile number</p>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Enter your password" className="w-full pl-9 pr-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-sm bg-card" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
