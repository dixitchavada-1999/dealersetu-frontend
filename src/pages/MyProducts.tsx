import { useEffect, useState } from 'react';
import { Loader2, Search, ImageIcon, Star, ArrowRight, X, Repeat } from 'lucide-react';
import { productsApi, categoriesApi, variantsApi, extractError } from '../lib/api';
import type { Product, Category, ProductVariant } from '../lib/types';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { DrawerContent } from './Products';
import toast from '../lib/toast';

// Customer-facing "My Products" — products the logged-in customer has purchased
// before, surfaced for quick re-ordering. Reuses the product detail drawer from
// the Products page so add-to-cart / variant logic stays in one place.
export default function MyProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTenant, setFilterTenant] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Drawer state (mirrors Products page)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [drawerCategory, setDrawerCategory] = useState<Category | null>(null);
  const [drawerVariants, setDrawerVariants] = useState<ProductVariant[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [drawerPurchaseByVariant, setDrawerPurchaseByVariant] = useState<Record<string, { totalQuantity: number; orderCount: number; lastPurchasedAt?: string }>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([productsApi.getMyPurchased(), categoriesApi.getAll()]);
      setProducts(prods); setCategories(cats);
    } catch (err: any) { toast.error(extractError(err)); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const tenantOptions = [...new Map(products.filter(p => p.tenantId).map(p => [p.tenantId, p.tenantName || ''])).entries()];

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    if (!p.name.toLowerCase().includes(q) && !(p.productCode || '').toLowerCase().includes(q) && !(p.brand || '').toLowerCase().includes(q)) return false;
    if (filterTenant !== 'all' && p.tenantId !== filterTenant) return false;
    return true;
  });

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > totalPages) setPage(1);
  }, [filtered.length, pageSize, page]);

  const pageStart = (page - 1) * pageSize;
  const paginated = filtered.slice(pageStart, pageStart + pageSize);

  const openDrawer = async (productId: string) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerProduct(null);
    setDrawerVariants([]);
    setDrawerCategory(null);
    setActiveImageIdx(0);
    try {
      const [prod, vars] = await Promise.all([
        productsApi.getById(productId),
        variantsApi.getAll(productId),
      ]);
      // Show ONLY the variants this customer actually purchased.
      const listProduct = products.find(p => p.id === productId);
      const purchased = listProduct?.purchaseInfo?.variants ?? [];
      const purchaseMap: Record<string, { totalQuantity: number; orderCount: number; lastPurchasedAt?: string }> = {};
      purchased.forEach(v => { purchaseMap[v.variantId] = { totalQuantity: v.totalQuantity, orderCount: v.orderCount, lastPurchasedAt: v.lastPurchasedAt }; });
      const purchasedVariants = purchased.length > 0 ? vars.filter(v => purchaseMap[v.id]) : vars;
      setDrawerProduct(prod);
      setDrawerVariants(purchasedVariants);
      setDrawerPurchaseByVariant(purchaseMap);
      setDrawerCategory(categories.find(c => c.id === prod.categoryId) || null);
    } catch (err: any) {
      toast.error(extractError(err));
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setDrawerProduct(null);
      setDrawerVariants([]);
      setDrawerCategory(null);
    }, 300);
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} product{products.length === 1 ? '' : 's'} you've ordered before</p>
        </div>
      </div>

      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your products..." className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-card border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
          </div>
          {tenantOptions.length > 1 && (
            <select
              value={filterTenant}
              onChange={e => setFilterTenant(e.target.value)}
              className="px-3.5 py-2.5 bg-card border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
            >
              <option value="all">All Companies</option>
              {tenantOptions.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No results' : "You haven't ordered anything yet"}
          message={search ? 'Try a different search term.' : 'Products you order will appear here for quick re-ordering.'}
        />
      ) : (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginated.map(p => {
              const img = p.imageUrl || p.imageUrls?.[0];
              const hasDiscount = (p.effectiveDiscount ?? 0) > 0;
              const showPrice = !p.hasVariants && (p.finalPrice != null || p.price != null);
              const basePrice = p.finalPrice ?? p.price ?? 0;
              const discountedPrice = p.discountedPrice ?? basePrice;
              const showStrike = !p.hasVariants && discountedPrice < basePrice;
              const outOfStock = !p.hasVariants && (p.stockQty ?? 0) === 0;
              const info = p.purchaseInfo;
              return (
                <div
                  key={p.id}
                  onClick={() => openDrawer(p.id)}
                  className="group bg-card rounded-xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-slate-50 overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={36} className="text-slate-300" />
                      </div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold shadow-sm">
                        {p.effectiveDiscount}% OFF
                      </span>
                    )}
                    {tenantOptions.length > 1 && p.tenantName && (
                      <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-md bg-card/90 backdrop-blur text-[10px] font-semibold text-slate-600 border border-slate-200 shadow-sm max-w-[60%] truncate">
                        {p.tenantName}
                      </span>
                    )}
                    {outOfStock && (
                      <div className="absolute inset-0 bg-surface/70 backdrop-blur-sm flex items-center justify-center">
                        <span className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold shadow">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-3 flex-1 flex flex-col">
                    {p.brand && (
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5 truncate">{p.brand}</p>
                    )}
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug min-h-[2.5rem]">{p.name}</h3>

                    {/* Purchase history badge */}
                    {info && (
                      <div className="mt-1.5 flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary-600">
                          <Repeat size={10} />
                          Ordered {info.orderCount}× &middot; {info.totalQuantity} {p.unit || 'pcs'}
                        </span>
                        {info.lastPurchasedAt && (
                          <span className="text-[10px] text-slate-400">Last: {fmtDate(info.lastPurchasedAt)}</span>
                        )}
                      </div>
                    )}

                    {/* Rating */}
                    {(p.averageRating ?? 0) > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-600 text-white text-[10px] font-bold">
                          {p.averageRating!.toFixed(1)}
                          <Star size={8} className="fill-white text-white" />
                        </span>
                        <span className="text-[10px] text-slate-400">({p.reviewCount})</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                      {showPrice ? (
                        <>
                          <span className="text-base font-extrabold text-slate-900">{fmt(discountedPrice)}</span>
                          {showStrike && (
                            <span className="text-xs text-slate-400 line-through">{fmt(basePrice)}</span>
                          )}
                        </>
                      ) : p.hasVariants ? (
                        <span className="text-xs text-slate-500 font-medium">Multiple options</span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </div>

                    {/* Reorder button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); openDrawer(p.id); }}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Reorder <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 bg-card rounded-xl border border-slate-100 px-4 py-3">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          </div>
        </div>
      )}

      {/* ── Product Detail Drawer (reused from Products page) ── */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-3xl bg-card shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">
            {drawerProduct ? drawerProduct.name : 'Product Details'}
          </h2>
          <button onClick={closeDrawer} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {drawerLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={28} className="animate-spin text-primary-600" />
            </div>
          ) : drawerProduct ? (
            <DrawerContent
              product={drawerProduct}
              category={drawerCategory}
              variants={drawerVariants}
              activeImageIdx={activeImageIdx}
              setActiveImageIdx={setActiveImageIdx}
              onEditProduct={() => {}}
              onStockUpdate={() => {}}
              isCustomer={true}
              purchaseByVariant={drawerPurchaseByVariant}
            />
          ) : null}
        </div>
      </aside>
    </div>
  );
}
