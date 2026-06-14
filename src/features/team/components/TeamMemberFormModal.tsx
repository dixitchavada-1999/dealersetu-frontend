import { useEffect, useState } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/ui/Button';
import FormField, { TextInput } from '../../../components/ui/FormField';
import toast from '../../../lib/toast';
import { extractError } from '../../../lib/api';
import type { TeamMember, TeamMemberInput } from '../types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editing: TeamMember | null;
  noun: string;
  onSubmit: (data: TeamMemberInput) => Promise<void>;
};

/** Create / edit form for a team member (shared by all team modules). */
export default function TeamMemberFormModal({ isOpen, onClose, editing, noun, onSubmit }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFirstName(editing?.firstName ?? '');
    setLastName(editing?.lastName ?? '');
    setEmail(editing?.email ?? '');
    setMobileNumber(editing?.mobileNumber ?? '');
    setPassword('');
  }, [isOpen, editing]);

  const handleSave = async () => {
    if (!firstName.trim() || !email.trim()) return toast.error('First name and email are required');
    if (!editing && !password.trim()) return toast.error(`Password is required for new ${noun.toLowerCase()}s`);
    setSaving(true);
    try {
      const data: TeamMemberInput = { firstName, lastName, email, mobileNumber };
      if (password) data.password = password;
      await onSubmit(data);
      onClose();
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? `Edit ${noun}` : `Add ${noun}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First Name" required>
            <TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </FormField>
          <FormField label="Last Name">
            <TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Email" required>
          <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label={editing ? 'Password (leave empty to keep)' : 'Password'} required={!editing}>
          <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>
        <FormField label="Mobile Number">
          <TextInput type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
        </FormField>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </div>
      </div>
    </Modal>
  );
}
