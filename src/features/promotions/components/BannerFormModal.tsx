import { useEffect, useRef, useState } from 'react';
import { Upload, Video, Loader2, X } from 'lucide-react';
import { bannersApi, uploadApi, extractError } from '../../../lib/api';
import type { Banner } from '../../../lib/types';
import Modal from '../../../components/Modal';
import Button from '../../../components/ui/Button';
import FormField, { TextInput, TextArea } from '../../../components/ui/FormField';
import toast from '../../../lib/toast';

type FormData = {
  title: string; description: string; imageUrl: string; mediaType: 'image' | 'video';
  linkType: 'none' | 'product' | 'category' | 'external'; linkId: string; linkUrl: string;
  priority: number; startDate: string; endDate: string; isActive: boolean;
};

const emptyForm: FormData = { title: '', description: '', imageUrl: '', mediaType: 'image', linkType: 'none', linkId: '', linkUrl: '', priority: 0, startDate: '', endDate: '', isActive: true };

const SELECT = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card text-slate-900';

type Props = { isOpen: boolean; onClose: () => void; editing: Banner | null; onSaved: () => void };

/** Create / edit a promotional banner — image/video upload, link, schedule. */
export default function BannerFormModal({ isOpen, onClose, editing, onSaved }: Props) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm(editing ? {
      title: editing.title, description: editing.description || '', imageUrl: editing.imageUrl,
      mediaType: editing.mediaType === 'video' ? 'video' : 'image',
      linkType: editing.linkType, linkId: editing.linkId || '', linkUrl: editing.linkUrl || '',
      priority: editing.priority, startDate: editing.startDate ? editing.startDate.slice(0, 10) : '',
      endDate: editing.endDate ? editing.endDate.slice(0, 10) : '', isActive: editing.isActive,
    } : emptyForm);
  }, [isOpen, editing]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const url = await uploadApi.uploadImage(file, 'banners'); setForm((f) => ({ ...f, imageUrl: url, mediaType: 'image' })); toast.success('Image uploaded'); }
    catch (err) { toast.error(extractError(err)); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error('Video must be under 50MB'); if (videoInputRef.current) videoInputRef.current.value = ''; return; }
    setUploading(true);
    try { const url = await uploadApi.uploadVideo(file, 'banners'); setForm((f) => ({ ...f, imageUrl: url, mediaType: 'video' })); toast.success('Video uploaded'); }
    catch (err) { toast.error(extractError(err)); }
    finally { setUploading(false); if (videoInputRef.current) videoInputRef.current.value = ''; }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.imageUrl.trim()) return toast.error(`${form.mediaType === 'video' ? 'Video' : 'Image'} is required`);
    setSaving(true);
    try {
      const payload: any = {
        title: form.title.trim(), description: form.description.trim() || undefined, imageUrl: form.imageUrl.trim(),
        mediaType: form.mediaType, linkType: form.linkType, priority: form.priority, isActive: form.isActive,
        startDate: form.startDate || undefined, endDate: form.endDate || undefined,
      };
      if (form.linkType === 'product' || form.linkType === 'category') payload.linkId = form.linkId.trim() || undefined;
      if (form.linkType === 'external') payload.linkUrl = form.linkUrl.trim() || undefined;
      if (editing) { await bannersApi.update(editing.id, payload); toast.success('Banner updated'); }
      else { await bannersApi.create(payload); toast.success('Banner created'); }
      onSaved(); onClose();
    } catch (err) { toast.error(extractError(err)); }
    finally { setSaving(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Banner' : 'Add Banner'}>
      <div className="space-y-4">
        <FormField label="Title" required><TextInput value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Banner title" /></FormField>
        <FormField label="Description"><TextArea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} placeholder="Optional" /></FormField>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Media *</label>
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-400 hover:bg-primary-50/50 transition-colors text-sm font-medium text-slate-600">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload Image
            </button>
            <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-400 hover:bg-primary-50/50 transition-colors text-sm font-medium text-slate-600">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />} Upload Video
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
          <div className="flex items-center gap-2 my-2"><div className="flex-1 h-px bg-slate-200" /><span className="text-xs text-slate-400">or paste URL</span><div className="flex-1 h-px bg-slate-200" /></div>
          <div className="flex gap-2">
            <input type="url" value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-card text-slate-900" placeholder="https://..." />
            <select value={form.mediaType} onChange={(e) => set('mediaType', e.target.value as 'image' | 'video')} className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-card text-slate-900"><option value="image">Image</option><option value="video">Video</option></select>
          </div>
          {form.imageUrl && (
            <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 h-40 bg-slate-900">
              {form.mediaType === 'video' ? <video src={form.imageUrl} className="w-full h-full object-contain" controls muted /> : <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />}
              <button type="button" onClick={() => set('imageUrl', '')} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-lg"><X size={14} className="text-white" /></button>
            </div>
          )}
        </div>

        <FormField label="Link Type">
          <select value={form.linkType} onChange={(e) => set('linkType', e.target.value as FormData['linkType'])} className={SELECT}>
            <option value="none">None</option><option value="product">Product</option><option value="category">Category</option><option value="external">External</option>
          </select>
        </FormField>
        {(form.linkType === 'product' || form.linkType === 'category') && (
          <FormField label={`${form.linkType === 'product' ? 'Product' : 'Category'} ID`}><TextInput value={form.linkId} onChange={(e) => set('linkId', e.target.value)} /></FormField>
        )}
        {form.linkType === 'external' && <FormField label="URL"><TextInput type="url" value={form.linkUrl} onChange={(e) => set('linkUrl', e.target.value)} /></FormField>}

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Priority"><TextInput type="number" min={0} value={form.priority} onChange={(e) => set('priority', Number(e.target.value))} /></FormField>
          <div className="flex items-center justify-between pt-6">
            <label className="text-sm font-medium text-slate-700">Active</label>
            <button type="button" onClick={() => set('isActive', !form.isActive)} className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-primary-600' : 'bg-slate-300'}`}><span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'left-[22px]' : 'left-0.5'}`} /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Start Date"><TextInput type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} /></FormField>
          <FormField label="End Date"><TextInput type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} /></FormField>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </div>
      </div>
    </Modal>
  );
}
