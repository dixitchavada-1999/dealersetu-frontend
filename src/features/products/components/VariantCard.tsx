import { Pencil, Trash2, Hash, Weight, ShoppingCart } from 'lucide-react';
import type { Product, ProductVariant } from '../../../lib/types';
import { formatCurrencyExact as fmt } from '../../../lib/format';
import { addToCart } from '../../cart/cartStorage';
import { getStockStatus } from '../utils';
import toast from '../../../lib/toast';

type Props = {
  variant: ProductVariant;
  product: Product;
  isCustomer: boolean;
  lowStockThreshold: number;
  defaultRestockQty: number;
  onEdit: (v: ProductVariant) => void;
  onDelete: (v: ProductVariant) => void;
  onStockUpdate: (v: ProductVariant, qty: number) => void;
};

/** Single variant card — SKU, attributes, pricing/margin, stock and cart/restock actions. */
export default function VariantCard({ variant: v, product, isCustomer, lowStockThreshold, defaultRestockQty, onEdit, onDelete, onStockUpdate }: Props) {
  const stock = getStockStatus(v.stockQty, lowStockThreshold);
  const vMargin = v.costPrice && v.price > 0 ? ((v.price - v.costPrice) / v.price * 100) : null;
  const borderAccent = v.stockQty === 0 ? 'border-l-red-500' : v.stockQty <= lowStockThreshold ? 'border-l-amber-500' : 'border-l-emerald-500';

  return (
    <div className={`bg-card rounded-xl shadow-sm border border-slate-100 border-l-[3px] ${borderAccent} overflow-hidden hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-[11px] font-bold text-primary-700 font-mono truncate max-w-[160px]">
            <Hash size={10} className="shrink-0" /><span className="truncate">{v.sku}</span>
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600 shrink-0">{v.unit}</span>
        </div>
        {!isCustomer && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={() => onEdit(v)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary-600 transition-colors" title="Edit"><Pencil size={14} /></button>
            <button onClick={() => onDelete(v)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
          </div>
        )}
      </div>

      {v.attributes && Object.keys(v.attributes).length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {Object.entries(v.attributes).map(([key, val]) => (
            <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 text-[10px] font-semibold text-teal-700 tracking-wide">{key}: {val}</span>
          ))}
        </div>
      )}

      <div className="px-4 pb-3">
        <div className="flex items-end justify-between">
          <div>
            {v.discountedPrice != null && v.discountedPrice < v.finalPrice ? (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-extrabold text-primary-600 leading-none">{fmt(v.discountedPrice)}</p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-50 text-[10px] font-bold text-red-600">{v.effectiveDiscount}% OFF</span>
                </div>
                <p className="text-[10px] text-red-400 line-through mt-0.5">{fmt(v.finalPrice)}</p>
                {(v.customerDiscount ?? 0) > 0 && <p className="text-[10px] text-blue-500">Includes {v.customerDiscount}% customer discount</p>}
              </>
            ) : (
              <p className="text-2xl font-extrabold text-primary-600 leading-none">{fmt(v.finalPrice)}</p>
            )}
            {v.taxPercentage > 0 && <p className="text-[10px] text-slate-400 mt-0.5">incl. {v.taxPercentage}% tax &middot; Base: {fmt(v.price)}</p>}
          </div>
          {vMargin !== null && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${vMargin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {vMargin >= 0 ? '+' : ''}{vMargin.toFixed(1)}%
            </span>
          )}
        </div>
        {v.costPrice != null && v.costPrice > 0 && <p className="text-[10px] text-slate-400 mt-0.5">Cost: {fmt(v.costPrice)}</p>}
      </div>

      <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${stock.bg} ${stock.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />{stock.label}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">{v.stockQty} {v.unit}</span>
          {v.weight != null && v.weight > 0 && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Weight size={10} />{v.weight}g</span>}
        </div>
        {isCustomer ? (
          <button
            onClick={() => {
              addToCart({
                variantId: v.id, productId: v.productId, productName: product.name, variantSku: v.sku, variantAttributes: v.attributes,
                price: v.discountedPrice != null && v.discountedPrice < v.finalPrice ? v.discountedPrice : v.finalPrice,
                quantity: 1, unit: v.unit, tenantId: product.tenantId || v.tenantId || '', tenantName: product.tenantName || '',
              });
              toast.success(`Added ${v.sku} to cart`);
            }}
            disabled={v.stockQty === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <ShoppingCart size={12} />
            {v.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button onClick={() => onStockUpdate(v, v.stockQty + defaultRestockQty)} className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-semibold transition-colors" title={`Quick restock +${defaultRestockQty}`}>
              +{defaultRestockQty}
            </button>
            <input
              type="number"
              defaultValue={v.stockQty}
              min={0}
              onBlur={e => { const val = Number(e.target.value); if (val !== v.stockQty) onStockUpdate(v, val); }}
              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs text-center focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
              title="Update stock"
            />
          </div>
        )}
      </div>
    </div>
  );
}
