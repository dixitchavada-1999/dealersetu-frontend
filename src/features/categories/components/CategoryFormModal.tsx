import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { categoriesApi, extractError } from '../../../lib/api';
import type { Category, VariantAttribute } from '../../../lib/types';
import Modal from '../../../components/Modal';
import FormField, { TextInput, TextArea } from '../../../components/ui/FormField';
import Button from '../../../components/ui/Button';
import ImageUploader from '../../../components/ui/ImageUploader';
import toast from '../../../lib/toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editing: Category | null;
  onSaved: () => void;
};

/** Create / edit a category — name, description, image, variant attributes. */
export default function CategoryFormModal({ isOpen, onClose, editing, onSaved }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [variantAttributes, setVariantAttributes] = useState<VariantAttribute[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(editing?.name ?? '');
    setDescription(editing?.description ?? '');
    setImageUrl(editing?.imageUrl ?? '');
    setVariantAttributes(editing?.variantAttributes ?? []);
  }, [isOpen, editing]);

  const addAttribute = () => setVariantAttributes((p) => [...p, { name: '', values: [] }]);
  const updateAttribute = (idx: number, field: 'name' | 'values', value: string | string[]) =>
    setVariantAttributes((p) => p.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  const removeAttribute = (idx: number) => setVariantAttributes((p) => p.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const data = { name, description, imageUrl, variantAttributes };
      if (editing) {
        await categoriesApi.update(editing.id, data);
        toast.success('Category updated');
      } else {
        await categoriesApi.create(data);
        toast.success('Category created');
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
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Category' : 'Add Category'} wide>
      <div className="space-y-4">
        <FormField label="Name" required>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="Description">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </FormField>

        <ImageUploader value={imageUrl} onChange={setImageUrl} folder="categories" />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Variant Attributes</label>
            <button type="button" onClick={addAttribute} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Add</button>
          </div>
          {variantAttributes.map((attr, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-start">
              <TextInput placeholder="Name (e.g. Size)" value={attr.name} onChange={(e) => updateAttribute(idx, 'name', e.target.value)} className="flex-1" />
              <TextInput placeholder="Values (comma-separated)" value={attr.values.join(', ')} onChange={(e) => updateAttribute(idx, 'values', e.target.value.split(',').map((v) => v.trim()).filter(Boolean))} className="flex-1" />
              <button onClick={() => removeAttribute(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </div>
      </div>
    </Modal>
  );
}
