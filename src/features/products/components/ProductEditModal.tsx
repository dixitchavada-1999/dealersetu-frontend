import Modal from '../../../components/Modal';
import type { Category } from '../../../lib/types';
import type { useProductEditForm } from '../hooks/useProductEditForm';
import ImageUploadField from './ImageUploadField';
import VariantAttributesEditor from './VariantAttributesEditor';

const FIELD = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm';

type Props = {
  form: ReturnType<typeof useProductEditForm>;
  categories: Category[];
};

/** Edit-product modal on the product detail page (no variant toggle). */
export default function ProductEditModal({ form: f, categories }: Props) {
  return (
    <Modal isOpen={f.open} onClose={() => f.setOpen(false)} title="Edit Product" wide>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
          <input value={f.name} onChange={e => f.setName(e.target.value)} className={FIELD} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
          <select value={f.categoryId} onChange={e => f.setCategoryId(e.target.value)} className={`${FIELD} bg-card`}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Code</label>
            <input value={f.productCode} onChange={e => f.setProductCode(e.target.value)} className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand</label>
            <input value={f.brand} onChange={e => f.setBrand(e.target.value)} className={FIELD} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Cost Price</label>
            <input type="number" value={f.costPrice} onChange={e => f.setCostPrice(e.target.value)} className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax %</label>
            <input type="number" min="0" max="100" value={f.taxPercentage} onChange={e => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && Number(v) <= 100)) f.setTaxPercentage(v); }} placeholder="0" className={FIELD} />
            <p className="text-[10px] text-slate-400 mt-1">Default tax for variants</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
            <input value={f.unit} onChange={e => f.setUnit(e.target.value)} className={FIELD} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea value={f.description} onChange={e => f.setDescription(e.target.value)} rows={3} className={`${FIELD} resize-none`} />
        </div>

        <ImageUploadField
          imageUrls={f.imageUrls}
          uploading={f.uploading}
          mode={f.imageMode}
          urlInput={f.urlInput}
          fileInputRef={f.fileInputRef}
          onSetMode={f.setImageMode}
          onSetUrlInput={f.setUrlInput}
          onUpload={f.handleImageUpload}
          onRemove={f.removeImage}
          onAddUrl={f.addUrlImage}
        />

        <VariantAttributesEditor
          attributes={f.variantAttributes}
          categoryAttrs={f.categoryAttrs}
          categoryName={f.selectedCategory?.name}
          onAdd={f.addAttribute}
          onUpdate={f.updateAttribute}
          onRemove={f.removeAttribute}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button onClick={() => f.setOpen(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm">Cancel</button>
          <button onClick={f.handleSave} disabled={f.saving} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium text-sm shadow-sm">
            {f.saving ? 'Saving...' : 'Update Product'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
