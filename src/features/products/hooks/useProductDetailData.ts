import { useEffect, useState, useMemo } from 'react';
import { productsApi, variantsApi, categoriesApi, userApi, extractError } from '../../../lib/api';
import type { Product, ProductVariant, Category, VariantAttribute } from '../../../lib/types';
import toast from '../../../lib/toast';

/** Loads a product with its variants, category, and tenant stock settings. */
export function useProductDetailData(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [defaultRestockQty, setDefaultRestockQty] = useState(10);

  const reload = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [p, v, cats, tenant] = await Promise.all([
        productsApi.getById(id),
        variantsApi.getAll(id),
        categoriesApi.getAll(),
        userApi.getTenant(),
      ]);
      setProduct(p);
      setVariants(v);
      setCategories(cats);
      setLowStockThreshold(tenant.lowStockThreshold ?? 10);
      setDefaultRestockQty(tenant.defaultRestockQuantity ?? 10);
      setCategory(cats.find(c => c.id === p.categoryId) || null);
    } catch (err: any) {
      toast.error(extractError(err));
    }
    setLoading(false);
  };

  useEffect(() => { reload(); }, [id]);

  // Variant attributes resolve from the product, then fall back to the category.
  const variantAttributes: VariantAttribute[] = useMemo(() => {
    if (product?.variantAttributes?.length) return product.variantAttributes;
    if (category?.variantAttributes?.length) return category.variantAttributes;
    return [];
  }, [product, category]);

  return { loading, product, category, categories, variants, variantAttributes, lowStockThreshold, defaultRestockQty, reload };
}
