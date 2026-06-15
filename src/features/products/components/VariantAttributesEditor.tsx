import { Trash2 } from 'lucide-react';
import type { VariantAttribute } from '../../../lib/types';

type Props = {
  attributes: VariantAttribute[];
  categoryAttrs: VariantAttribute[];
  categoryName?: string;
  onAdd: () => void;
  onUpdate: (idx: number, field: 'name' | 'values', value: any) => void;
  onRemove: (idx: number) => void;
};

/** Editor for product-level variant attributes, showing inherited category attrs as a hint. */
export default function VariantAttributesEditor({ attributes, categoryAttrs, categoryName, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-700">Variant Attributes</label>
        <button type="button" onClick={onAdd} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Add Attribute</button>
      </div>

      {categoryAttrs.length > 0 && attributes.length === 0 && (
        <div className="rounded-xl bg-primary-50 border border-primary-200/40 px-4 py-3 mb-3">
          <p className="text-xs font-medium text-primary-700 mb-2">Inherited from category "{categoryName}":</p>
          <div className="flex flex-wrap gap-2">
            {categoryAttrs.map((attr, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-100 text-xs font-medium text-primary-700">{attr.name}: {attr.values.join(', ')}</span>
            ))}
          </div>
          <p className="text-[11px] text-primary-400 mt-2">Add product-level attributes below to override these.</p>
        </div>
      )}

      {attributes.map((attr, idx) => (
        <div key={idx} className="flex gap-2 mb-2 items-start">
          <input placeholder="Name (e.g. Size)" value={attr.name} onChange={e => onUpdate(idx, 'name', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
          <input placeholder="Values (comma-separated)" value={attr.values.join(', ')} onChange={e => onUpdate(idx, 'values', e.target.value.split(',').map(v => v.replace(/^\s+/, '')))} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
          <button onClick={() => onRemove(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
        </div>
      ))}

      {attributes.length === 0 && categoryAttrs.length === 0 && (
        <p className="text-xs text-slate-400">No attributes defined. Add attributes like Size, Color, Material with their values.</p>
      )}
    </div>
  );
}
