import { useRef, useState } from 'react';
import { Upload, Link, ImageIcon, Loader2, X } from 'lucide-react';
import { uploadApi, extractError } from '../../lib/api';
import toast from '../../lib/toast';

type Props = {
  value: string;
  onChange: (url: string) => void;
  /** Cloudinary folder bucket (e.g. 'categories', 'products'). */
  folder: string;
  maxSizeMB?: number;
};

/** Dual-mode (upload / URL) image picker with drag-drop + live preview. */
export default function ImageUploader({ value, onChange, folder, maxSizeMB = 5 }: Props) {
  const [mode, setMode] = useState<'upload' | 'url'>(value ? 'url' : 'upload');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) return toast.error(`Image must be under ${maxSizeMB}MB`);
    if (!file.type.startsWith('image/')) return toast.error('Only image files are allowed');
    setUploading(true);
    try {
      onChange(await uploadApi.uploadImage(file, folder));
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">Image</label>
        <div className="flex items-center gap-1 bg-slate-200/60 rounded-lg p-0.5">
          <button type="button" onClick={() => setMode('upload')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${mode === 'upload' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Upload size={12} /> Upload
          </button>
          <button type="button" onClick={() => setMode('url')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${mode === 'url' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Link size={12} /> URL
          </button>
        </div>
      </div>

      {value && (
        <div className="relative mb-3 inline-block">
          <img src={value} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <button type="button" onClick={() => onChange('')} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
            <X size={12} />
          </button>
        </div>
      )}

      {mode === 'upload' ? (
        <div
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${uploading ? 'border-primary-300 bg-primary-50' : 'border-slate-200 hover:border-primary-400 hover:bg-primary-50'}`}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-primary-500" />
              <p className="text-sm text-primary-600 font-medium">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-200/50">
                <ImageIcon size={20} className="text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP up to {maxSizeMB}MB</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
      )}
    </div>
  );
}
