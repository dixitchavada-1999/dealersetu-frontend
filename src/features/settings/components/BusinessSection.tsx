import { Card, FormField, TextInput, TextArea } from '../../../components/ui';
import SaveButton from './SaveButton';
import type { useSettings } from '../hooks/useSettings';

type Props = {
  business: ReturnType<typeof useSettings>['business'];
  saving: boolean;
  onSave: () => void;
};

/** Business info, compliance, bank, and pricing defaults form. */
export default function BusinessSection({ business: b, saving, onSave }: Props) {
  return (
    <Card padding="lg">
      <div className="space-y-4">
        <FormField label="Business Name" required>
          <TextInput value={b.name} onChange={e => b.setName(e.target.value)} />
        </FormField>
        <FormField label="Business Type">
          <TextInput value={b.businessType} onChange={e => b.setBusinessType(e.target.value)} placeholder="e.g., Retail, Wholesale" />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone"><TextInput type="tel" value={b.phone} onChange={e => b.setPhone(e.target.value)} /></FormField>
          <FormField label="Email"><TextInput type="email" value={b.email} onChange={e => b.setEmail(e.target.value)} /></FormField>
        </div>
        <FormField label="Address">
          <TextArea value={b.address} onChange={e => b.setAddress(e.target.value)} rows={3} />
        </FormField>
        <FormField label="Logo URL">
          <TextInput value={b.logo} onChange={e => b.setLogo(e.target.value)} />
        </FormField>

        <div className="border-t border-slate-100 pt-4 mt-2">
          <p className="text-sm font-semibold text-slate-600 mb-3">Registration & Compliance</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="GST Number"><TextInput value={b.gstNumber} onChange={e => b.setGstNumber(e.target.value)} placeholder="e.g., 22AAAAA0000A1Z5" /></FormField>
          <FormField label="UDYAM Number"><TextInput value={b.udyamNumber} onChange={e => b.setUdyamNumber(e.target.value)} placeholder="e.g., UDYAM-XX-00-0000000" /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Aadhar Number"><TextInput value={b.aadharNumber} onChange={e => b.setAadharNumber(e.target.value)} placeholder="e.g., 1234 5678 9012" /></FormField>
          <FormField label="PAN Number"><TextInput value={b.panNumber} onChange={e => b.setPanNumber(e.target.value)} placeholder="e.g., ABCDE1234F" className="uppercase" /></FormField>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-2">
          <p className="text-sm font-semibold text-slate-600 mb-3">Bank Details</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Account Number"><TextInput value={b.accountNumber} onChange={e => b.setAccountNumber(e.target.value)} placeholder="Bank account number" /></FormField>
          <FormField label="IFSC Code"><TextInput value={b.ifscCode} onChange={e => b.setIfscCode(e.target.value)} placeholder="e.g., SBIN0001234" className="uppercase" /></FormField>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-2">
          <p className="text-sm font-semibold text-slate-600 mb-3">Pricing & Stock Defaults</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Common Discount (%)">
            <TextInput type="number" min={0} max={100} value={b.commonDiscount} onChange={e => b.setCommonDiscount(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} placeholder="0" />
            <p className="text-[10px] text-slate-400 mt-1">Applied to all products unless overridden by product or customer discount</p>
          </FormField>
          <FormField label="Default Restock Quantity">
            <TextInput type="number" min={1} value={b.defaultRestockQuantity} onChange={e => b.setDefaultRestockQuantity(Math.max(1, Number(e.target.value) || 1))} placeholder="10" />
            <p className="text-[10px] text-slate-400 mt-1">Quick restock button quantity for product variants</p>
          </FormField>
        </div>

        <div className="pt-4"><SaveButton onClick={onSave} saving={saving} /></div>
      </div>
    </Card>
  );
}
