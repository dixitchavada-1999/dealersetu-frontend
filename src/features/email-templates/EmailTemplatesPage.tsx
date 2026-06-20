import { useEffect, useState, useCallback, useRef } from 'react';
import { Mail, Save, RotateCcw, Loader2, Plus, Trash2, Upload, X, Variable } from 'lucide-react';
import { emailTemplatesApi, uploadApi } from '../../lib/api';
import type { EmailTemplate, EmailVariable } from '../../lib/api';
import toast from '../../lib/toast';

type Tab = 'templates' | 'variables';

/** Super-admin: manage dynamic email templates + global variables. */
export default function EmailTemplatesPage() {
  const [tab, setTab] = useState<Tab>('templates');
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#0F52BA]/10 flex items-center justify-center">
          <Mail className="text-[#0F52BA]" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Email Templates</h1>
          <p className="text-sm text-slate-500">Edit the emails the platform sends. Changes apply immediately.</p>
        </div>
      </div>

      <div className="flex gap-1 mb-5 bg-surface border border-slate-200 rounded-xl p-1 w-fit">
        {(['templates', 'variables'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${tab === t ? 'bg-[#0F52BA] text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t === 'templates' ? 'Templates' : 'Global Variables'}
          </button>
        ))}
      </div>

      {tab === 'templates' ? <TemplatesTab /> : <VariablesTab />}
    </div>
  );
}

// ── Templates tab ─────────────────────────────────────────────
function TemplatesTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [draft, setDraft] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [newPh, setNewPh] = useState('');
  const [creating, setCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (selectKey?: string) => {
    try {
      const list = await emailTemplatesApi.getAll();
      setTemplates(list);
      const sel = selectKey ? list.find((t) => t.key === selectKey) : list[0];
      if (sel) setDraft({ ...sel });
    } catch {
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!draft) return;
    const id = setTimeout(async () => {
      try { setPreviewHtml((await emailTemplatesApi.preview(draft)).html); } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(id);
  }, [draft]);

  const setField = useCallback(
    (field: keyof EmailTemplate, value: string | boolean | string[]) => setDraft((d) => (d ? { ...d, [field]: value } : d)),
    []
  );

  const save = async () => {
    if (!draft) return;
    if (!draft.subject?.trim()) return toast.error('Subject is required');
    setSaving(true);
    try {
      const updated = await emailTemplatesApi.update(draft.key, draft);
      setTemplates((ts) => ts.map((t) => (t.key === updated.key ? updated : t)));
      setDraft({ ...updated });
      toast.success('Template saved');
    } catch { toast.error('Failed to save template'); }
    finally { setSaving(false); }
  };

  const resetDefault = async () => {
    if (!draft || !window.confirm('Reset this template to the built-in default? Your edits will be lost.')) return;
    try {
      const def = await emailTemplatesApi.reset(draft.key);
      setTemplates((ts) => ts.map((t) => (t.key === def.key ? def : t)));
      setDraft({ ...def });
      toast.success('Reset to default');
    } catch { toast.error('Failed to reset template'); }
  };

  const removeTemplate = async () => {
    if (!draft || !window.confirm(`Delete template "${draft.name}"? This cannot be undone.`)) return;
    try {
      await emailTemplatesApi.remove(draft.key);
      toast.success('Template deleted');
      setDraft(null);
      load();
    } catch { toast.error('Failed to delete template'); }
  };

  const onLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draft) return;
    setUploading(true);
    try {
      const url = await uploadApi.uploadImage(file, 'logos');
      setField('logoUrl', url);
      toast.success('Logo uploaded');
    } catch { toast.error('Logo upload failed'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const addPlaceholder = () => {
    const v = newPh.trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (!v || !draft) return;
    if ((draft.placeholders || []).includes(v)) { setNewPh(''); return; }
    setField('placeholders', [...(draft.placeholders || []), v]);
    setNewPh('');
  };
  const removePlaceholder = (p: string) => draft && setField('placeholders', (draft.placeholders || []).filter((x) => x !== p));

  const createTemplate = async (data: { key: string; name: string; subject: string }) => {
    try {
      const t = await emailTemplatesApi.create({ ...data, heading: data.name, bodyTop: 'Hello {{name}},' });
      toast.success('Template created');
      setCreating(false);
      load(t.key);
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to create template'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400"><Loader2 className="animate-spin" size={28} /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* List */}
      <div className="lg:col-span-3 space-y-3">
        <button onClick={() => setCreating(true)} className="w-full flex items-center justify-center gap-2 bg-[#0F52BA] hover:bg-[#0A3D8F] text-white text-sm font-semibold py-2 rounded-xl transition-colors">
          <Plus size={16} /> New Template
        </button>
        <div className="bg-card border border-slate-200 rounded-2xl overflow-hidden">
          {templates.map((t) => (
            <button key={t.key} onClick={() => setDraft({ ...t })}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 transition-colors ${draft?.key === t.key ? 'bg-[#0F52BA]/5 border-l-2 border-l-[#0F52BA]' : 'hover:bg-slate-50'}`}>
              <p className="text-sm font-semibold text-slate-800">{t.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{t.key}</p>
            </button>
          ))}
          {templates.length === 0 && <p className="px-4 py-6 text-sm text-slate-400 text-center">No templates yet.</p>}
        </div>
      </div>

      {/* Editor */}
      {draft && (
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-slate-200 rounded-2xl p-5 space-y-4">
            {draft.description && <p className="text-xs text-slate-500 -mt-1">{draft.description}</p>}

            {/* Editable placeholders */}
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-medium text-slate-600 mb-1.5">Available variables (use anywhere with {`{{ }}`}):</p>
              <div className="flex flex-wrap gap-1.5 items-center">
                {(draft.placeholders || []).map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 text-xs bg-card border border-slate-200 rounded-md pl-2 pr-1 py-0.5 text-[#0F52BA]">
                    {`{{${p}}}`}
                    <button onClick={() => removePlaceholder(p)} className="hover:text-red-500"><X size={12} /></button>
                  </span>
                ))}
                <input value={newPh} onChange={(e) => setNewPh(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPlaceholder())}
                  placeholder="add var" className="text-xs bg-card border border-slate-200 rounded-md px-2 py-0.5 w-20 outline-none focus:border-[#0F52BA]" />
                <button onClick={addPlaceholder} className="text-xs text-[#0F52BA] hover:underline">+ add</button>
              </div>
            </div>

            <Field label="Subject"><input className={inputCls} value={draft.subject || ''} onChange={(e) => setField('subject', e.target.value)} /></Field>
            <Field label="Heading"><input className={inputCls} value={draft.heading || ''} onChange={(e) => setField('heading', e.target.value)} /></Field>
            <Field label="Body (top)" hint="Above the code box. Blank line = new paragraph."><textarea rows={3} className={inputCls} value={draft.bodyTop || ''} onChange={(e) => setField('bodyTop', e.target.value)} /></Field>
            <Field label="Highlight field" hint="Variable shown in the big code box (e.g. otp). Blank = none."><input className={inputCls} value={draft.highlightKey || ''} onChange={(e) => setField('highlightKey', e.target.value)} /></Field>
            <Field label="Body (bottom)" hint="Below the code box (e.g. expiry note)."><textarea rows={2} className={inputCls} value={draft.bodyBottom || ''} onChange={(e) => setField('bodyBottom', e.target.value)} /></Field>
            <Field label="Footer"><input className={inputCls} value={draft.footerText || ''} onChange={(e) => setField('footerText', e.target.value)} /></Field>

            <Field label="Brand color">
              <div className="flex items-center gap-2">
                <input type="color" className="w-10 h-9 rounded border border-slate-200 cursor-pointer" value={draft.brandColor || '#0F52BA'} onChange={(e) => setField('brandColor', e.target.value)} />
                <input className={inputCls} value={draft.brandColor || ''} onChange={(e) => setField('brandColor', e.target.value)} />
              </div>
            </Field>

            {/* Logo: upload or URL */}
            <Field label="Logo">
              <div className="flex items-center gap-2">
                <input className={inputCls} value={draft.logoUrl || ''} onChange={(e) => setField('logoUrl', e.target.value)} placeholder="https://... or upload" />
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onLogoFile} />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 whitespace-nowrap disabled:opacity-60">
                  {uploading ? <Loader2 className="animate-spin" size={15} /> : <Upload size={15} />} Upload
                </button>
              </div>
            </Field>
          </div>

          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-[#0F52BA] hover:bg-[#0A3D8F] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save
            </button>
            <button onClick={resetDefault} className="flex items-center gap-2 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2.5 rounded-xl transition-colors"><RotateCcw size={16} /> Reset</button>
            <button onClick={removeTemplate} className="flex items-center gap-2 px-4 border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-2.5 rounded-xl transition-colors"><Trash2 size={16} /></button>
          </div>
        </div>
      )}

      {/* Live preview */}
      <div className="lg:col-span-4">
        <p className="text-xs font-medium text-slate-500 mb-2">Live preview</p>
        <div className="bg-card border border-slate-200 rounded-2xl overflow-hidden" style={{ height: 560 }}>
          <iframe title="email-preview" srcDoc={previewHtml} className="w-full h-full border-0" />
        </div>
      </div>

      {creating && <NewTemplateModal onClose={() => setCreating(false)} onCreate={createTemplate} />}
    </div>
  );
}

function NewTemplateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (d: { key: string; name: string; subject: string }) => void }) {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-900">New Email Template</h2>
        <Field label="Key (slug)" hint="Used in code, e.g. order_confirmation. Lowercase, no spaces."><input className={inputCls} value={key} onChange={(e) => setKey(e.target.value)} placeholder="order_confirmation" /></Field>
        <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Order Confirmation" /></Field>
        <Field label="Subject"><input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your order is confirmed" /></Field>
        <div className="flex gap-3 pt-1">
          <button onClick={() => key && name && subject ? onCreate({ key, name, subject }) : toast.error('All fields required')} className="flex-1 bg-[#0F52BA] hover:bg-[#0A3D8F] text-white font-semibold py-2.5 rounded-xl">Create</button>
          <button onClick={onClose} className="px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2.5 rounded-xl">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Global Variables tab ──────────────────────────────────────
function VariablesTab() {
  const [vars, setVars] = useState<EmailVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [desc, setDesc] = useState('');

  const load = useCallback(async () => {
    try { setVars(await emailTemplatesApi.getVariables()); }
    catch { toast.error('Failed to load variables'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!key.trim()) return toast.error('Variable name is required');
    try {
      await emailTemplatesApi.saveVariable({ key: key.trim(), value, description: desc });
      toast.success('Variable saved');
      setKey(''); setValue(''); setDesc('');
      load();
    } catch { toast.error('Failed to save variable'); }
  };
  const remove = async (k: string) => {
    if (!window.confirm(`Delete variable {{${k}}}?`)) return;
    try { await emailTemplatesApi.deleteVariable(k); load(); } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400"><Loader2 className="animate-spin" size={28} /></div>;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="bg-card border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Variable size={18} className="text-[#0F52BA]" />
          <h2 className="font-semibold text-slate-800">Add / update a global variable</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">These fixed values can be used in any template, e.g. <code className="text-[#0F52BA]">{'{{companyName}}'}</code>.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Name"><input className={inputCls} value={key} onChange={(e) => setKey(e.target.value)} placeholder="companyName" /></Field>
          <Field label="Value"><input className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} placeholder="DealerSetu Pvt Ltd" /></Field>
          <Field label="Description (optional)"><input className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        </div>
        <button onClick={add} className="mt-4 flex items-center gap-2 bg-[#0F52BA] hover:bg-[#0A3D8F] text-white font-semibold px-5 py-2 rounded-xl text-sm"><Plus size={16} /> Save variable</button>
      </div>

      <div className="bg-card border border-slate-200 rounded-2xl overflow-hidden">
        {vars.length === 0 && <p className="px-4 py-6 text-sm text-slate-400 text-center">No global variables yet.</p>}
        {vars.map((v) => (
          <div key={v.key} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
            <code className="text-sm text-[#0F52BA] font-mono">{`{{${v.key}}}`}</code>
            <span className="text-sm text-slate-700 flex-1 truncate">{v.value}</span>
            {v.description && <span className="text-xs text-slate-400 hidden sm:block truncate max-w-[150px]">{v.description}</span>}
            <button onClick={() => remove(v.key)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 bg-surface border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#0F52BA]/20 focus:border-[#0F52BA] outline-none transition-all';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
