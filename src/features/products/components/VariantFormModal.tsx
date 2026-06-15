import { IndianRupee } from 'lucide-react';
import Modal from '../../../components/Modal';
import type { Product, VariantAttribute } from '../../../lib/types';
import { formatCurrencyExact as fmt } from '../../../lib/format';
import type { useVariantForm } from '../hooks/useVariantForm';

const FIELD = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm';
const UNIT_OPTIONS = ['Piece', 'Kg', 'Gram', 'Liter', 'Meter', 'Box', 'Dozen', 'Set', 'Pair'];

type Props = {
  form: ReturnType<typeof useVariantForm>;
  product: Product | null;
  variantAttributes: VariantAttribute[];
};

/** Add/edit variant modal — attribute selectors, pricing, stock, and final-price preview. */
export default function VariantFormModal({ form: f, product, variantAttributes }: Props) {
  return (
    <Modal isOpen={f.open} onClose={() => f.setOpen(false)} title={f.editing ? 'Edit Variant' : 'Add Variant'} wide>
      <div className="space-y-5">
        {variantAttributes.length > 0 && (
          <div className="space-y-4">
            {variantAttributes.map(attr => (
              <div key={attr.name}>
                <label className="block text-sm font-medium text-slate-700 mb-2">{attr.name}</label>
                <div className="flex flex-wrap gap-2">
                  {attr.values.map(val => {
                    const isSelected = f.selectedAttributes[attr.name] === val;
                    return (
                      <button
                        key={val} type="button"
                        onClick={() => f.toggleAttribute(attr.name, val)}
                        className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${isSelected ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="border-b border-slate-100" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">SKU *</label>
          <input
            value={f.sku}
            onChange={e => { f.setSku(e.target.value); f.setSkuManuallyEdited(true); }}
            placeholder={variantAttributes.length > 0 ? 'Auto-generated from attributes' : 'Enter SKU'}
            className={FIELD}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price *</label>
            <input type="number" value={f.price} onChange={e => f.setPrice(e.target.value)} placeholder="0" className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Cost Price</label>
            <input type="number" value={f.costPrice} onChange={e => f.setCostPrice(e.target.value)} placeholder="0" className={FIELD} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax %</label>
            <input type="number" min="0" max="100" value={f.taxPercentage} onChange={e => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && Number(v) <= 100)) f.setTaxPercentage(v); }} placeholder="0" className={FIELD} />
            {product?.taxPercentage ? <p className="text-[10px] text-slate-400 mt-1">Product default: {product.taxPercentage}%. Leave 0 to use product tax.</p> : null}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock Qty</label>
            <input type="number" value={f.stockQty} onChange={e => f.setStockQty(e.target.value)} placeholder="0" className={FIELD} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
          <div className="flex flex-wrap gap-2">
            {UNIT_OPTIONS.map(u => (
              <button key={u} type="button" onClick={() => f.setSelectedUnit(u)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${f.selectedUnit === u ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
              >{u}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Weight (g)</label>
            <input type="number" value={f.weight} onChange={e => f.setWeight(e.target.value)} placeholder="Optional" className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dimensions</label>
            <input value={f.dimensions} onChange={e => f.setDimensions(e.target.value)} placeholder="e.g. 10x5x3 cm" className={FIELD} />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center"><IndianRupee size={18} className="text-primary-600" /></div>
              <div>
                <p className="text-xs text-slate-500">Estimated Final Price</p>
                <p className="text-xl font-bold text-primary-600">{fmt(f.finalPrice)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Price + {Number(f.taxPercentage) || 0}% Tax</p>
              {f.margin !== null && (
                <p className={`text-xs font-semibold ${f.margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{f.margin >= 0 ? '+' : ''}{f.margin.toFixed(1)}% margin</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button onClick={() => f.setOpen(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors">Cancel</button>
          <button onClick={f.handleSave} disabled={f.saving} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm font-medium shadow-lg transition-colors">
            {f.saving ? 'Saving...' : f.editing ? 'Update Variant' : 'Save Variant'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
