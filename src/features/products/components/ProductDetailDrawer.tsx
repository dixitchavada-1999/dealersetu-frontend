import { Link } from 'react-router-dom';
import { Pencil, Tag, Hash, Weight, Layers, Box, ArrowRight, Package, Star, ShoppingCart } from 'lucide-react';
import type { Product, Category, ProductVariant, VariantAttribute } from '../../../lib/types';
import { formatCurrencyExact as fmt, formatShortDate } from '../../../lib/format';
import { addToCart } from '../../cart/cartStorage';
import { getStockStatus, type PurchaseStat } from '../utils';
import toast from '../../../lib/toast';

type Props = {
  product: Product;
  category: Category | null;
  variants: ProductVariant[];
  activeImageIdx: number;
  setActiveImageIdx: (i: number) => void;
  onEditProduct: () => void;
  onStockUpdate: (v: ProductVariant, qty: number) => void;
  lowStockThreshold?: number;
  defaultRestockQty?: number;
  isCustomer?: boolean;
  /** When set (My Products view), annotate each variant with the customer's purchase history. */
  purchaseByVariant?: Record<string, PurchaseStat>;
};

/** Full product detail body shown inside the drawer — gallery, info, variants, cart/stock actions. */
export default function ProductDetailDrawer({
  product, category, variants, activeImageIdx, setActiveImageIdx, onEditProduct, onStockUpdate,
  lowStockThreshold = 10, defaultRestockQty = 10, isCustomer = false, purchaseByVariant,
}: Props) {
  const productImages = product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [];
  const activeImage = productImages[activeImageIdx] || null;
  const variantAttrs: VariantAttribute[] = product.variantAttributes?.length
    ? product.variantAttributes
    : category?.variantAttributes || [];

  return (
    <div className="p-6 space-y-5">
      {/* Image Gallery */}
      {productImages.length > 0 ? (
        <div>
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img src={activeImage!} alt={product.name} className="w-full h-56 object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          </div>
          {productImages.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {productImages.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${idx === activeImageIdx ? 'border-primary-500' : 'border-transparent hover:border-slate-300'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center py-10">
          <div className="w-16 h-16 rounded-xl bg-slate-200/60 flex items-center justify-center mb-2">
            <Package size={28} className="text-slate-400" />
          </div>
          <p className="text-xs text-slate-400">No images</p>
        </div>
      )}

      {/* Product Info */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
              {(product.effectiveDiscount ?? 0) > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 text-xs font-bold text-red-600">{product.effectiveDiscount}% OFF</span>
              )}
            </div>
            {product.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{product.description}</p>}
          </div>
          {!isCustomer && (
            <button onClick={onEditProduct} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors shrink-0">
              <Pencil size={12} /> Edit
            </button>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1"><Tag size={12} className="text-primary-600" /><span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Category</span></div>
            <p className="text-sm font-semibold text-slate-900">{category?.name || '-'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1"><Hash size={12} className="text-violet-600" /><span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Code</span></div>
            <p className="text-sm font-semibold text-slate-900 font-mono">{product.productCode || '-'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1"><Layers size={12} className="text-amber-600" /><span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Brand</span></div>
            <p className="text-sm font-semibold text-slate-900">{product.brand || '-'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1"><Box size={12} className="text-cyan-500" /><span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Unit</span></div>
            <p className="text-sm font-semibold text-slate-900">{product.unit || 'Piece'}</p>
          </div>
        </div>

        {/* Status Badge + Rating */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {product.isActive ? 'Active' : 'Inactive'}
          </span>
          {(product.averageRating ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 text-white text-sm font-bold">
                {product.averageRating!.toFixed(1)}<Star size={12} className="fill-white text-white" />
              </span>
              <span className="text-xs text-slate-400">{product.reviewCount} ratings</span>
            </div>
          )}
        </div>
      </div>

      {/* Variant Attributes */}
      {product.hasVariants !== false && variantAttrs.length > 0 && (
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-2">Variant Attributes</p>
          <div className="flex flex-wrap gap-2">
            {variantAttrs.map((attr, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-xs font-medium text-primary-700">
                {attr.name}: {attr.values.join(', ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Variants / Direct Product Section */}
      <div>
        {product.hasVariants === false ? (
          <>
            <p className="text-sm font-semibold text-slate-900 mb-3">Product Details</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Price</span>
                <span className="text-lg font-bold text-slate-900">
                  {product.finalPrice != null ? fmt(product.finalPrice) : product.price != null ? fmt(product.price) : '-'}
                </span>
              </div>
              {product.sku && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">SKU</span>
                  <span className="text-sm font-mono text-slate-700">{product.sku}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Stock</span>
                {(() => {
                  const stock = getStockStatus(product.stockQty ?? 0, lowStockThreshold);
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${stock.bg} ${stock.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />
                      {stock.label} ({product.stockQty ?? 0})
                    </span>
                  );
                })()}
              </div>
              {isCustomer && (
                <button
                  onClick={() => {
                    addToCart({
                      productId: product.id,
                      productName: product.name,
                      variantSku: product.sku || product.productCode || '',
                      price: product.finalPrice ?? product.price ?? 0,
                      quantity: 1,
                      unit: product.unit || 'Piece',
                      tenantId: product.tenantId || '',
                      tenantName: product.tenantName || '',
                    });
                    toast.success(`Added ${product.name} to cart`);
                  }}
                  disabled={(product.stockQty ?? 0) === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <ShoppingCart size={16} />
                  {(product.stockQty ?? 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-900">Variants ({variants.length})</p>
              <Link to={`/products/${product.id}`} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                Manage <ArrowRight size={12} />
              </Link>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <Package size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No variants configured</p>
                <Link to={`/products/${product.id}`} className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1">
                  Add variants <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {variants.map(v => {
                  const stock = getStockStatus(v.stockQty, lowStockThreshold);
                  const margin = v.costPrice && v.price > 0 ? ((v.price - v.costPrice) / v.price * 100) : null;
                  const purchase = purchaseByVariant?.[v.id];
                  return (
                    <div key={v.id} className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-[11px] font-bold text-primary-700 font-mono"><Hash size={10} />{v.sku}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-200/70 text-[11px] font-semibold text-slate-600">{v.unit}</span>
                      </div>

                      {v.attributes && Object.keys(v.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {Object.entries(v.attributes).map(([key, val]) => (
                            <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 text-[10px] font-semibold text-teal-700 tracking-wide">{key}: {val}</span>
                          ))}
                        </div>
                      )}

                      {purchase && (
                        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium text-primary-600">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50">
                            Ordered {purchase.totalQuantity} {v.unit || ''} · {purchase.orderCount}×
                          </span>
                          {purchase.lastPurchasedAt && <span className="text-slate-400">Last {formatShortDate(purchase.lastPurchasedAt)}</span>}
                        </div>
                      )}

                      <div className="flex items-end justify-between mb-2">
                        <div>
                          {v.discountedPrice != null && v.discountedPrice < v.finalPrice ? (
                            <>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-extrabold text-primary-600">{fmt(v.discountedPrice)}</p>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-50 text-[10px] font-bold text-red-600">{v.effectiveDiscount}% OFF</span>
                              </div>
                              <p className="text-[10px] text-red-400 line-through">{fmt(v.finalPrice)}</p>
                              {(v.customerDiscount ?? 0) > 0 && <p className="text-[10px] text-blue-500">Includes {v.customerDiscount}% customer discount</p>}
                            </>
                          ) : (
                            <p className="text-lg font-extrabold text-primary-600">{fmt(v.finalPrice)}</p>
                          )}
                          {v.taxPercentage > 0 && <p className="text-[10px] text-slate-400">incl. {v.taxPercentage}% tax &middot; Base: {fmt(v.price)}</p>}
                          {v.costPrice != null && v.costPrice > 0 && <p className="text-[10px] text-slate-400">Cost: {fmt(v.costPrice)}</p>}
                        </div>
                        {margin !== null && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${margin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {margin >= 0 ? '+' : ''}{margin.toFixed(1)}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${stock.bg} ${stock.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />{stock.label}
                          </span>
                          {!isCustomer && (
                            <>
                              <span className="text-[11px] text-slate-500 font-medium">{v.stockQty} {v.unit}</span>
                              {v.weight != null && v.weight > 0 && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Weight size={10} />{v.weight}g</span>}
                            </>
                          )}
                        </div>
                        {isCustomer ? (
                          <button
                            onClick={() => {
                              addToCart({
                                variantId: v.id,
                                productId: v.productId,
                                productName: product.name,
                                variantSku: v.sku,
                                variantAttributes: v.attributes,
                                price: v.discountedPrice != null && v.discountedPrice < v.finalPrice ? v.discountedPrice : v.finalPrice,
                                quantity: 1,
                                unit: v.unit,
                                tenantId: product.tenantId || v.tenantId || '',
                                tenantName: product.tenantName || '',
                              });
                              toast.success(`Added ${v.sku} to cart`);
                            }}
                            disabled={v.stockQty === 0}
                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            {v.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onStockUpdate(v, v.stockQty + defaultRestockQty)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-semibold transition-colors"
                              title={`Quick restock +${defaultRestockQty}`}
                            >
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
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
