import { useEffect, useState, useRef } from 'react';
import { Settings as SettingsIcon, Upload, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { platformSettingsApi, uploadApi } from '../../lib/api';
import type { PlatformSettings } from '../../lib/api';
import toast from '../../lib/toast';

/** Super-admin: platform branding (DealerSetu logo, name, color). */
export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({ logoUrl: '', logoLightUrl: '', brandName: 'DealerSetu', brandColor: '#0F52BA' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'logoUrl' | 'logoLightUrl' | null>(null);

  useEffect(() => {
    (async () => {
      try { setSettings(await platformSettingsApi.get()); }
      catch { toast.error('Failed to load settings'); }
      finally { setLoading(false); }
    })();
  }, []);

  const set = (k: keyof PlatformSettings, v: string) => setSettings((s) => ({ ...s, [k]: v }));

  const onLogoFile = async (field: 'logoUrl' | 'logoLightUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(field);
    try {
      const url = await uploadApi.uploadImage(file, 'logos');
      set(field, url);
      toast.success('Logo uploaded — remember to Save');
    } catch { toast.error('Logo upload failed'); }
    finally { setUploadingField(null); e.target.value = ''; }
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await platformSettingsApi.update(settings);
      setSettings(updated);
      toast.success('Platform settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400"><Loader2 className="animate-spin" size={28} /></div>;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#0F52BA]/10 flex items-center justify-center">
          <SettingsIcon className="text-[#0F52BA]" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Platform Settings</h1>
          <p className="text-sm text-slate-500">Branding used across the platform and in all emails.</p>
        </div>
      </div>

      <div className="bg-card border border-slate-200 rounded-2xl p-6 space-y-6">
        {/* Dark-bg logo */}
        <LogoField
          label="Logo — for dark backgrounds"
          hint="Use a white / light-text logo. Shows on the landing header and in all emails (blue header)."
          previewDark
          value={settings.logoUrl}
          uploading={uploadingField === 'logoUrl'}
          onUpload={(e) => onLogoFile('logoUrl', e)}
          onChange={(v) => set('logoUrl', v)}
        />

        {/* Light-bg logo */}
        <LogoField
          label="Logo — for light backgrounds"
          hint="Use a dark / colored-text logo. Shows on the footer, login and register pages."
          value={settings.logoLightUrl}
          uploading={uploadingField === 'logoLightUrl'}
          onUpload={(e) => onLogoFile('logoLightUrl', e)}
          onChange={(v) => set('logoLightUrl', v)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand name</label>
            <input className={inputCls} value={settings.brandName} onChange={(e) => set('brandName', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand color</label>
            <div className="flex items-center gap-2">
              <input type="color" className="w-10 h-9 rounded border border-slate-200 cursor-pointer" value={settings.brandColor || '#0F52BA'} onChange={(e) => set('brandColor', e.target.value)} />
              <input className={inputCls} value={settings.brandColor} onChange={(e) => set('brandColor', e.target.value)} />
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="flex items-center justify-center gap-2 bg-[#0F52BA] hover:bg-[#0A3D8F] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save changes
        </button>
      </div>
    </div>
  );
}

function LogoField({ label, hint, value, uploading, previewDark, onUpload, onChange }: {
  label: string; hint: string; value: string; uploading: boolean; previewDark?: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <div className={`w-40 h-24 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 ${previewDark ? 'border-slate-700' : 'border-slate-200 bg-surface'}`}
          style={previewDark ? { backgroundImage: 'linear-gradient(135deg,#0F52BA,#0A3D8F)' } : undefined}>
          {value
            ? <img src={value} alt="logo" className="max-w-full max-h-full object-contain p-2" />
            : <ImageIcon className={previewDark ? 'text-white/40' : 'text-slate-300'} size={28} />}
        </div>
        <div className="flex-1 space-y-2">
          <input ref={ref} type="file" accept="image/*" hidden onChange={onUpload} />
          <button onClick={() => ref.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60">
            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} Upload
          </button>
          <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://... (or upload)" />
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 bg-surface border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#0F52BA]/20 focus:border-[#0F52BA] outline-none transition-all';
