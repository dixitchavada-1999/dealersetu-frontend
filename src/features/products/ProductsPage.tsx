import { useEffect, useState } from 'react';
import { Plus, Loader2, Search, ShoppingCart, ArrowRight } from 'lucide-react';
import { productsApi, categoriesApi, variantsApi, userApi, extractError } from '../../lib/api';
import type { Product, Category, ProductVariant } from '../../lib/types';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import { addToCart } from '../cart/cartStorage';
import toast from '../../lib/toast';
import { useProductFilters } from './hooks/useProductFilters';
import { useProductDrawer } from './hooks/useProductDrawer';
import { useProductForm } from './hooks/useProductForm';
import ProductTable from './components/ProductTable';
import ProductGridCard from './components/ProductGridCard';
import ProductFormModal from './components/ProductFormModal';
import ProductDrawerShell from './components/ProductDrawerShell';
import ProductDetailDrawer from './components/ProductDetailDrawer';

/** Product catalog — admin table CRUD or customer shopping grid, with detail drawer. */
export default function ProductsPage() {
  const { isCustomer } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [defaultRestockQty, setDefaultRestockQty] = useState(10);

  const filters = useProductFilters(products);
  const drawer = useProductDrawer(categories);

  const load = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([productsApi.getAll(), categoriesApi.getAll()]);
      setProducts(prods); setCategories(cats);
      if (!isCustomer) {
        try {
          const tenant = await userApi.getTenant();
          setLowStockThreshold(tenant.lowStockThreshold ?? 10);
          setDefaultRestockQty(tenant.defaultRestockQuantity ?? 10);
        } catch { /* ignore */ }
      }
    } catch (err: any) { toast.error(extractError(err)); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const form = useProductForm({
    categories,
    onSaved: ({ editingId }) => {
      load();
      if (drawer.open && drawer.product && editingId === drawer.product.id) drawer.refresh(drawer.product.id);
    },
  });

  const catName = (id: string) => categories.find(c => c.id === id)?.name || '-';

  const handleStockUpdate = async (v: ProductVariant, newQty: number) => {
    try {
      await variantsApi.updateStock(v.id, newQty);
      toast.success('Stock updated');
      if (drawer.product) drawer.refresh(drawer.product.id);
    } catch (err: any) { toast.error(extractError(err)); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} total products</p>
        </div>
        {!isCustomer && (
          <button onClick={form.openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold shadow-lg transition-all">
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => filters.setSearch(e.target.value)} placeholder="Search products..." className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-card border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
          </div>
          {isCustomer && filters.tenantOptions.length > 1 && (
            <select value={filters.filterTenant} onChange={e => filters.setFilterTenant(e.target.value)} className="px-3.5 py-2.5 bg-card border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm">
              <option value="all">All Companies</option>
              {filters.tenantOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          )}
        </div>
      )}

      {filters.filtered.length === 0 ? (
        <EmptyState title={filters.search ? 'No results' : 'No products'} message={filters.search ? 'Try a different search term.' : 'Create your first product.'} />
      ) : isCustomer ? (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filters.paginated.map(p => (
              <ProductGridCard
                key={p.id}
                product={p}
                showTenant={filters.tenantOptions.length > 1}
                onOpen={drawer.openWith}
                footer={({ discountedPrice, outOfStock }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (p.hasVariants !== false) {
                        drawer.openWith(p.id);
                      } else if (!outOfStock) {
                        addToCart({ productId: p.id, productName: p.name, variantSku: p.sku || p.productCode || '', price: discountedPrice, quantity: 1, unit: p.unit || 'Piece', tenantId: p.tenantId || '', tenantName: p.tenantName || '' });
                        toast.success(`Added ${p.name} to cart`);
                      }
                    }}
                    disabled={outOfStock}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    {outOfStock ? 'Unavailable' : p.hasVariants !== false ? <>View Options <ArrowRight size={12} /></> : <><ShoppingCart size={12} /> Add to Cart</>}
                  </button>
                )}
              />
            ))}
          </div>
          <div className="mt-6 bg-card rounded-xl border border-slate-100 px-4 py-3">
            <Pagination page={filters.page} pageSize={filters.pageSize} total={filters.filtered.length} onPageChange={filters.setPage} onPageSizeChange={(s) => { filters.setPageSize(s); filters.setPage(1); }} />
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <ProductTable products={filters.paginated} catName={catName} onView={drawer.openWith} onEdit={form.openEdit} onDelete={form.setDeleteTarget} />
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination page={filters.page} pageSize={filters.pageSize} total={filters.filtered.length} onPageChange={filters.setPage} onPageSizeChange={(s) => { filters.setPageSize(s); filters.setPage(1); }} />
          </div>
        </div>
      )}

      <ProductFormModal form={form} categories={categories} />

      <ConfirmDialog
        isOpen={!!form.deleteTarget}
        onClose={() => form.setDeleteTarget(null)}
        onConfirm={() => form.confirmDelete((id) => { if (drawer.product?.id === id) drawer.close(); load(); })}
        isLoading={form.deleting}
        message={`Delete product "${form.deleteTarget?.name}"?`}
      />

      <ProductDrawerShell open={drawer.open} loading={drawer.loading} title={drawer.product ? drawer.product.name : 'Product Details'} onClose={drawer.close}>
        {drawer.product && (
          <ProductDetailDrawer
            product={drawer.product}
            category={drawer.category}
            variants={drawer.variants}
            activeImageIdx={drawer.activeImageIdx}
            setActiveImageIdx={drawer.setActiveImageIdx}
            onEditProduct={() => form.openEdit(drawer.product!)}
            onStockUpdate={handleStockUpdate}
            lowStockThreshold={lowStockThreshold}
            defaultRestockQty={defaultRestockQty}
            isCustomer={isCustomer}
          />
        )}
      </ProductDrawerShell>
    </div>
  );
}
