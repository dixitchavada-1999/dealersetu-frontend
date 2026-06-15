import { useState } from 'react';
import { productsApi, variantsApi, extractError } from '../../../lib/api';
import type { Product, Category, ProductVariant } from '../../../lib/types';
import toast from '../../../lib/toast';

type VariantMapper = (vars: ProductVariant[], prod: Product) => ProductVariant[];

/** Manages the sliding product-detail drawer: open/close, async load, and refresh. */
export function useProductDrawer(categories: Category[]) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const fetchInto = async (productId: string, mapVariants?: VariantMapper) => {
    const [prod, vars] = await Promise.all([productsApi.getById(productId), variantsApi.getAll(productId)]);
    setProduct(prod);
    setVariants(mapVariants ? mapVariants(vars, prod) : vars);
    setCategory(categories.find(c => c.id === prod.categoryId) || null);
  };

  const openWith = async (productId: string, mapVariants?: VariantMapper) => {
    setOpen(true);
    setLoading(true);
    setProduct(null);
    setVariants([]);
    setCategory(null);
    setActiveImageIdx(0);
    try {
      await fetchInto(productId, mapVariants);
    } catch (err: any) {
      toast.error(extractError(err));
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async (productId: string, mapVariants?: VariantMapper) => {
    try { await fetchInto(productId, mapVariants); } catch { /* silent */ }
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => { setProduct(null); setVariants([]); setCategory(null); }, 300);
  };

  return { open, loading, product, category, variants, activeImageIdx, setActiveImageIdx, openWith, refresh, close };
}
