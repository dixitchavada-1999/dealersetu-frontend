import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { productsApi, variantsApi, extractError } from '../../lib/api';
import type { ProductVariant } from '../../lib/types';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';
import toast from '../../lib/toast';
import { useProductDetailData } from './hooks/useProductDetailData';
import { useProductEditForm } from './hooks/useProductEditForm';
import { useVariantForm } from './hooks/useVariantForm';
import ProductInfoCard from './components/ProductInfoCard';
import NonVariantPanel from './components/NonVariantPanel';
import VariantCard from './components/VariantCard';
import ProductEditModal from './components/ProductEditModal';
import VariantFormModal from './components/VariantFormModal';

/** Product detail — info, variant management (CRUD), and customer add-to-cart. */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isCustomer } = useAuth();
  const data = useProductDetailData(id);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const editForm = useProductEditForm({ categories: data.categories, onSaved: data.reload });
  const variantForm = useVariantForm({ productId: id, product: data.product, onSaved: data.reload });

  const handleStockUpdate = async (v: ProductVariant, newQty: number) => {
    try {
      await variantsApi.updateStock(v.id, newQty);
      toast.success('Stock updated');
      data.reload();
    } catch (err: any) { toast.error(extractError(err)); }
  };

  const handleProductStockUpdate = async (newQty: number) => {
    if (!data.product) return;
    try {
      await productsApi.update(data.product.id, { stockQty: newQty });
      toast.success('Stock updated');
      data.reload();
    } catch (err: any) { toast.error(extractError(err)); }
  };

  if (data.loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  if (!data.product) return <EmptyState title="Product not found" />;

  const { product, variants, category, variantAttributes, lowStockThreshold, defaultRestockQty } = data;

  return (
    <div>
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 font-medium">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <ProductInfoCard
        product={product}
        category={category}
        variantAttributes={variantAttributes}
        activeImageIdx={activeImageIdx}
        setActiveImageIdx={setActiveImageIdx}
        onEdit={() => editForm.openEdit(product)}
      />

      {product.hasVariants === false && (
        <NonVariantPanel
          product={product}
          isCustomer={isCustomer}
          lowStockThreshold={lowStockThreshold}
          defaultRestockQty={defaultRestockQty}
          onStockUpdate={handleProductStockUpdate}
        />
      )}

      {product.hasVariants !== false && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Variants</h2>
              <p className="text-sm text-slate-500">{variants.length} variant{variants.length !== 1 ? 's' : ''} configured</p>
            </div>
            {!isCustomer && (
              <button onClick={variantForm.openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium shadow-lg transition-colors">
                <Plus size={16} /> Add Variant
              </button>
            )}
          </div>

          {variants.length === 0 ? (
            <EmptyState title="No variants" message="Add variants with pricing and stock." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {variants.map(v => (
                <VariantCard
                  key={v.id}
                  variant={v}
                  product={product}
                  isCustomer={isCustomer}
                  lowStockThreshold={lowStockThreshold}
                  defaultRestockQty={defaultRestockQty}
                  onEdit={variantForm.openEdit}
                  onDelete={variantForm.setDeleteTarget}
                  onStockUpdate={handleStockUpdate}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ProductEditModal form={editForm} categories={data.categories} />
      <VariantFormModal form={variantForm} product={product} variantAttributes={variantAttributes} />

      <ConfirmDialog
        isOpen={!!variantForm.deleteTarget}
        onClose={() => variantForm.setDeleteTarget(null)}
        onConfirm={variantForm.confirmDelete}
        isLoading={variantForm.deleting}
        message={`Delete variant "${variantForm.deleteTarget?.sku}"?`}
      />
    </div>
  );
}
