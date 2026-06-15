import type { RefObject } from 'react';
import { Loader2, Upload, Link as LinkIcon, ImageIcon, X } from 'lucide-react';

const FIELD = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm';

type Props = {
  imageUrls: string[];
  uploading: boolean;
  mode: 'upload' | 'url';
  urlInput: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onSetMode: (m: 'upload' | 'url') => void;
  onSetUrlInput: (v: string) => void;
  onUpload: (files: FileList | File[]) => void;
  onRemove: (idx: number) => void;
  onAddUrl: () => void;
};

/** Multi-image picker with drag/drop upload and URL modes, used in product forms. */
export default function ImageUploadField({
  imageUrls, uploading, mode, urlInput, fileInputRef,
  onSetMode, onSetUrlInput, onUpload, onRemove, onAddUrl,
}: Props) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) onUpload(e.dataTransfer.files);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">Images {imageUrls.length > 0 && <span className="text-slate-400">({imageUrls.length})</span>}</label>
        <div className="flex items-center gap-1 bg-slate-200/60 rounded-lg p-0.5">
          <button type="button" onClick={() => onSetMode('upload')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${mode === 'upload' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Upload size={12} /> Upload
          </button>
          <button type="button" onClick={() => onSetMode('url')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${mode === 'url' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <LinkIcon size={12} /> URL
          </button>
        </div>
      </div>

      {imageUrls.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="relative group">
              <img src={url} alt={`Image ${idx + 1}`} className="w-20 h-20 object-cover rounded-xl border border-slate-200" onError={e => { e.currentTarget.src = ''; e.currentTarget.className = 'w-20 h-20 rounded-xl border border-slate-200 bg-red-50'; }} />
              {idx === 0 && <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary-600 text-white text-[9px] font-bold rounded-md">Main</span>}
              <button type="button" onClick={() => onRemove(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {mode === 'upload' ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${uploading ? 'border-primary-300 bg-primary-50' : 'border-slate-200 hover:border-primary-400 hover:bg-primary-50'}`}
        >
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files?.length) onUpload(e.target.files); e.target.value = ''; }} />
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
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB &middot; Multiple files supported</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={e => onSetUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddUrl(); } }}
            placeholder="https://example.com/image.jpg"
            className={`flex-1 ${FIELD}`}
          />
          <button type="button" onClick={onAddUrl} className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium shrink-0">Add</button>
        </div>
      )}
    </div>
  );
}
