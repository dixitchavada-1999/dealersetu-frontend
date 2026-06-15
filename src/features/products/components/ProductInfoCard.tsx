import { Pencil, Hash, IndianRupee, Package, Tag, Layers, Box, Star } from 'lucide-react';
import type { Product, Category, VariantAttribute } from '../../../lib/types';

type Props = {
  product: Product;
  category: Category | null;
  variantAttributes: VariantAttribute[];
  activeImageIdx: number;
  setActiveImageIdx: (i: number) => void;
  onEdit: () => void;
};

/** Hero product card — image gallery, title, rating, and the key attribute grid. */
export default function ProductInfoCard({ product, category, variantAttributes, activeImageIdx, setActiveImageIdx, onEdit }: Props) {
  const productImages = product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [];
  const activeImage = productImages[activeImageIdx] || null;

  const stats = [
    { icon: Tag, bg: 'bg-primary-50', color: 'text-primary-600', label: 'Category', value: category?.name || '-' },
    { icon: Hash, bg: 'bg-violet-50', color: 'text-violet-600', label: 'Code', value: product.productCode || '-', mono: true },
    { icon: Layers, bg: 'bg-amber-50', color: 'text-amber-600', label: 'Brand', value: product.brand || '-' },
    { icon: IndianRupee, bg: 'bg-orange-50', color: 'text-orange-500', label: 'Tax', value: `${product.taxPercentage || 0}%` },
    { icon: Box, bg: 'bg-cyan-50', color: 'text-cyan-500', label: 'Unit', value: product.unit || 'Piece' },
  ];

  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-56 md:w-64 shrink-0 bg-slate-50 flex flex-col">
          {activeImage ? (
            <img src={activeImage} alt={product.name} className="w-full h-48 sm:flex-1 object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-10 flex-1">
              <div className="w-16 h-16 rounded-xl bg-slate-200/60 flex items-center justify-center"><Package size={28} className="text-slate-400" /></div>
              <p className="text-xs text-slate-400">No image</p>
            </div>
          )}
          {productImages.length > 1 && (
            <div className="flex gap-1.5 p-2 overflow-x-auto">
              {productImages.map((url, idx) => (
                <button key={idx} onClick={() => setActiveImageIdx(idx)} className={`w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${idx === activeImageIdx ? 'border-primary-500' : 'border-transparent hover:border-slate-300'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
                {(product.effectiveDiscount ?? 0) > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 text-xs font-bold text-red-600">{product.effectiveDiscount}% OFF</span>
                )}
              </div>
              {product.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{product.description}</p>}
            </div>
            <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors shrink-0">
              <Pencil size={14} /> Edit
            </button>
          </div>

          {(product.averageRating ?? 0) > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 text-white text-base font-bold leading-none">
                {product.averageRating!.toFixed(1)}<Star size={14} className="fill-white text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-700">{product.reviewCount} Ratings &amp; Reviews</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={11} className={i <= Math.round(product.averageRating!) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}><s.icon size={16} className={s.color} /></div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">{s.label}</p>
                  <p className={`text-sm font-semibold text-slate-900 truncate ${s.mono ? 'font-mono' : ''}`}>{s.value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${product.isActive ? 'bg-emerald-50' : 'bg-red-50'} flex items-center justify-center shrink-0`}>
                <span className={`w-2.5 h-2.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Status</p>
                <p className={`text-sm font-semibold ${product.isActive ? 'text-emerald-700' : 'text-red-700'}`}>{product.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>

          {product.hasVariants !== false && variantAttributes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">Variant Attributes</p>
              <div className="flex flex-wrap gap-2">
                {variantAttributes.map((attr, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-xs font-medium text-primary-700">{attr.name}: {attr.values.join(', ')}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
