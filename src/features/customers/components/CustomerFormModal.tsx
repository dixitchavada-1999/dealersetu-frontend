import { useEffect, useState } from 'react';
import { userApi, extractError } from '../../../lib/api';
import type { UserMember } from '../../../lib/types';
import Modal from '../../../components/Modal';
import Button from '../../../components/ui/Button';
import FormField, { TextInput } from '../../../components/ui/FormField';
import toast from '../../../lib/toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editing: UserMember | null;
  onSaved: () => void;
};

/** Create / edit a customer — contact, shop, address, discount. */
export default function CustomerFormModal({ isOpen, onClose, editing, onSaved }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [discount, setDiscount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFirstName(editing?.firstName ?? '');
    setLastName(editing?.lastName ?? '');
    setMobileNumber(editing?.mobileNumber ?? '');
    setEmail(editing?.email ?? '');
    setShopName(editing?.shopName ?? '');
    setGstNumber(editing?.gstNumber ?? '');
    setAddressLine1(editing?.address?.line1 ?? '');
    setCity(editing?.address?.city ?? '');
    setState(editing?.address?.state ?? '');
    setPincode(editing?.address?.pincode ?? '');
    setDiscount(editing?.discount ? String(editing.discount) : '');
  }, [isOpen, editing]);

  const handleSave = async () => {
    if (!firstName.trim() || !mobileNumber.trim()) return toast.error('First name and mobile number are required');
    setSaving(true);
    try {
      const data: any = { firstName, lastName, mobileNumber, email, shopName, gstNumber, discount: Number(discount) || 0, address: { line1: addressLine1, city, state, pincode } };
      if (editing) {
        await userApi.updateMember(editing.id, data);
        toast.success('Customer updated');
      } else {
        await userApi.createMember(data);
        toast.success('Customer created');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Customer' : 'Add Customer'} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First Name" required><TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} /></FormField>
          <FormField label="Last Name"><TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Mobile Number" required><TextInput type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} /></FormField>
          <FormField label="Email"><TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Shop Name"><TextInput value={shopName} onChange={(e) => setShopName(e.target.value)} /></FormField>
          <FormField label="GST Number"><TextInput value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} /></FormField>
          <FormField label="Discount (%)">
            <TextInput type="number" min={0} max={100} value={discount} placeholder="0" onChange={(e) => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && Number(v) <= 100)) setDiscount(v); }} />
            <p className="text-[10px] text-slate-400 mt-1">Customer-specific discount</p>
          </FormField>
        </div>
        <FormField label="Address Line 1"><TextInput value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} /></FormField>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="City"><TextInput value={city} onChange={(e) => setCity(e.target.value)} /></FormField>
          <FormField label="State"><TextInput value={state} onChange={(e) => setState(e.target.value)} /></FormField>
          <FormField label="Pincode"><TextInput value={pincode} onChange={(e) => setPincode(e.target.value)} /></FormField>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </div>
      </div>
    </Modal>
  );
}
