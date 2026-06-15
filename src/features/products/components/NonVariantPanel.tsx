import { ShoppingCart } from 'lucide-react';
import type { Product } from '../../../lib/types';
import { formatCurrencyExact as fmt } from '../../../lib/format';
import { addToCart } from '../../cart/cartStorage';
import { getStockStatus } from '../utils';
import toast from '../../../lib/toast';

type Props = {
  product: Product;
  isCustomer: boolean;
  lowStockThreshold: number;
  defaultRestockQty: number;
  onStockUpdate: (qty: number) => void;
};

/** Direct pricing/stock panel for products without variants. */
export default function NonVariantPanel({ product, isCustomer, lowStockThreshold, defaultRestockQty, onStockUpdate }: Props) {
  const stock = getStockStatus(product.stockQty ?? 0, lowStockThreshold);

  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Product Details</h2>
          <p className="text-sm text-slate-500">Direct pricing &amp; stock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">Price</p>
          <p className="text-2xl font-extrabold text-primary-600 leading-none">
            {product.finalPrice != null ? fmt(product.finalPrice) : product.price != null ? fmt(product.price) : '-'}
          </p>
          {(product.taxPercentage ?? 0) > 0 && product.price != null && (
            <p className="text-[10px] text-slate-400 mt-1.5">incl. {product.taxPercentage}% tax &middot; Base: {fmt(product.price)}</p>
          )}
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">SKU</p>
          <p className="text-sm font-semibold text-slate-900 font-mono">{product.sku || product.productCode || '-'}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">Stock</p>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${stock.bg} ${stock.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />{stock.label}
            </span>
            <span className="text-sm font-semibold text-slate-900">{product.stockQty ?? 0} {product.unit || 'Piece'}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        {isCustomer ? (
          <button
            onClick={() => {
              addToCart({
                productId: product.id, productName: product.name, variantSku: product.sku || product.productCode || '',
                price: product.finalPrice ?? product.price ?? 0, quantity: 1, unit: product.unit || 'Piece',
                tenantId: product.tenantId || '', tenantName: product.tenantName || '',
              });
              toast.success(`Added ${product.name} to cart`);
            }}
            disabled={(product.stockQty ?? 0) === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-lg transition-colors"
          >
            <ShoppingCart size={16} />
            {(product.stockQty ?? 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        ) : (
          <>
            <button
              onClick={() => onStockUpdate((product.stockQty ?? 0) + defaultRestockQty)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
              title={`Quick restock +${defaultRestockQty}`}
            >
              +{defaultRestockQty}
            </button>
            <input
              type="number"
              defaultValue={product.stockQty ?? 0}
              min={0}
              onBlur={e => { const val = Number(e.target.value); if (val !== (product.stockQty ?? 0)) onStockUpdate(val); }}
              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              className="w-20 px-2 py-2 border border-slate-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
              title="Update stock"
            />
          </>
        )}
      </div>
    </div>
  );
}
