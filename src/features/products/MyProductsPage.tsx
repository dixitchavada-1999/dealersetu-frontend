import { useEffect, useState } from 'react';
import { Loader2, Search, ArrowRight } from 'lucide-react';
import { productsApi, categoriesApi, extractError } from '../../lib/api';
import type { Product, Category } from '../../lib/types';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import toast from '../../lib/toast';
import { useProductFilters } from './hooks/useProductFilters';
import { useProductDrawer } from './hooks/useProductDrawer';
import ProductGridCard from './components/ProductGridCard';
import ProductDrawerShell from './components/ProductDrawerShell';
import ProductDetailDrawer from './components/ProductDetailDrawer';
import type { PurchaseStat } from './utils';

/** Customer "My Products" — previously purchased items surfaced for quick re-ordering. */
export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseByVariant, setPurchaseByVariant] = useState<Record<string, PurchaseStat>>({});

  const filters = useProductFilters(products);
  const drawer = useProductDrawer(categories);

  const load = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([productsApi.getMyPurchased(), categoriesApi.getAll()]);
      setProducts(prods); setCategories(cats);
    } catch (err: any) { toast.error(extractError(err)); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDrawer = (productId: string) => {
    // Show ONLY the variants this customer actually purchased, annotated with history.
    const listProduct = products.find(p => p.id === productId);
    const purchased = listProduct?.purchaseInfo?.variants ?? [];
    const purchaseMap: Record<string, PurchaseStat> = {};
    purchased.forEach(v => { purchaseMap[v.variantId] = { totalQuantity: v.totalQuantity, orderCount: v.orderCount, lastPurchasedAt: v.lastPurchasedAt }; });
    setPurchaseByVariant(purchaseMap);
    drawer.openWith(productId, (vars) => (purchased.length > 0 ? vars.filter(v => purchaseMap[v.id]) : vars));
  };

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
            <input value={filters.search} onChange={e => filters.setSearch(e.target.value)} placeholder="Search your products..." className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-card border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
          </div>
          {filters.tenantOptions.length > 1 && (
            <select value={filters.filterTenant} onChange={e => filters.setFilterTenant(e.target.value)} className="px-3.5 py-2.5 bg-card border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm">
              <option value="all">All Companies</option>
              {filters.tenantOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          )}
        </div>
      )}

      {filters.filtered.length === 0 ? (
        <EmptyState
          title={filters.search ? 'No results' : "You haven't ordered anything yet"}
          message={filters.search ? 'Try a different search term.' : 'Products you order will appear here for quick re-ordering.'}
        />
      ) : (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filters.paginated.map(p => (
              <ProductGridCard
                key={p.id}
                product={p}
                showTenant={filters.tenantOptions.length > 1}
                onOpen={openDrawer}
                purchaseInfo={p.purchaseInfo ? { totalQuantity: p.purchaseInfo.totalQuantity, orderCount: p.purchaseInfo.orderCount, lastPurchasedAt: p.purchaseInfo.lastPurchasedAt } : undefined}
                footer={() => (
                  <button
                    onClick={(e) => { e.stopPropagation(); openDrawer(p.id); }}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Reorder <ArrowRight size={12} />
                  </button>
                )}
              />
            ))}
          </div>
          <div className="mt-6 bg-card rounded-xl border border-slate-100 px-4 py-3">
            <Pagination page={filters.page} pageSize={filters.pageSize} total={filters.filtered.length} onPageChange={filters.setPage} onPageSizeChange={(s) => { filters.setPageSize(s); filters.setPage(1); }} />
          </div>
        </div>
      )}

      <ProductDrawerShell open={drawer.open} loading={drawer.loading} title={drawer.product ? drawer.product.name : 'Product Details'} onClose={drawer.close}>
        {drawer.product && (
          <ProductDetailDrawer
            product={drawer.product}
            category={drawer.category}
            variants={drawer.variants}
            activeImageIdx={drawer.activeImageIdx}
            setActiveImageIdx={drawer.setActiveImageIdx}
            onEditProduct={() => {}}
            onStockUpdate={() => {}}
            isCustomer
            purchaseByVariant={purchaseByVariant}
          />
        )}
      </ProductDrawerShell>
    </div>
  );
}
