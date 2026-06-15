import { useState, useRef } from 'react';
import { productsApi, uploadApi, extractError } from '../../../lib/api';
import type { Product, Category, VariantAttribute } from '../../../lib/types';
import toast from '../../../lib/toast';

type Options = {
  categories: Category[];
  onSaved: (saved: { editingId: string | null }) => void;
};

/** Product create/edit form state, image upload, and persistence. */
export function useProductForm({ categories, onSaved }: Options) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productCode, setProductCode] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [pTaxPercentage, setPTaxPercentage] = useState('0');
  const [unit, setUnit] = useState('Piece');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [variantAttributes, setVariantAttributes] = useState<VariantAttribute[]>([]);
  const [hasVariants, setHasVariants] = useState(true);
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const categoryAttrs = selectedCategory?.variantAttributes || [];

  const openCreate = () => {
    setEditing(null); setName(''); setCategoryId(categories[0]?.id || ''); setProductCode('');
    setDescription(''); setBrand(''); setCostPrice(''); setPTaxPercentage('0'); setUnit('Piece'); setImageUrls([]);
    setVariantAttributes([]); setHasVariants(true); setPrice(''); setSku(''); setStockQty('');
    setImageMode('upload'); setUrlInput('');
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p); setName(p.name); setCategoryId(p.categoryId); setProductCode(p.productCode || '');
    setDescription(p.description || ''); setBrand(p.brand || '');
    setCostPrice(p.costPrice?.toString() || ''); setPTaxPercentage(p.taxPercentage?.toString() || '0'); setUnit(p.unit || 'Piece');
    setImageUrls(p.imageUrls?.length ? [...p.imageUrls] : p.imageUrl ? [p.imageUrl] : []);
    setVariantAttributes(p.variantAttributes || []);
    setHasVariants(p.hasVariants !== false); setPrice(p.price?.toString() || ''); setSku(p.sku || ''); setStockQty(p.stockQty?.toString() || '');
    setImageMode('upload'); setUrlInput('');
    setModalOpen(true);
  };

  // ── Image upload ──
  const handleImageUpload = async (files: FileList | File[]) => {
    const valid = Array.from(files).filter(f => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5MB`); return false; }
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false; }
      return true;
    });
    if (valid.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(valid.map(f => uploadApi.uploadImage(f, 'products')));
      setImageUrls(prev => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`);
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setUploading(false); }
  };
  const removeImage = (idx: number) => setImageUrls(prev => prev.filter((_, i) => i !== idx));
  const addUrlImage = () => {
    const url = urlInput.trim();
    if (!url) return;
    setImageUrls(prev => [...prev, url]);
    setUrlInput('');
  };

  // ── Variant attributes ──
  const addAttribute = () => setVariantAttributes(p => [...p, { name: '', values: [] }]);
  const updateAttribute = (idx: number, field: 'name' | 'values', value: any) =>
    setVariantAttributes(p => p.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  const removeAttribute = (idx: number) => setVariantAttributes(p => p.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!name.trim() || !categoryId) return toast.error('Name and category are required');
    if (!hasVariants && !price) return toast.error('Price is required for non-variant products');
    setSaving(true);
    try {
      const data: any = { name, categoryId, productCode, description, brand, unit, hasVariants };
      if (costPrice) data.costPrice = Number(costPrice);
      data.taxPercentage = Number(pTaxPercentage) || 0;
      data.imageUrls = imageUrls;
      if (!hasVariants) {
        data.price = Number(price) || 0;
        data.sku = sku;
        data.stockQty = Number(stockQty) || 0;
      }
      const validAttrs = variantAttributes
        .map(a => ({ ...a, name: a.name.trim(), values: a.values.map(v => v.trim()).filter(Boolean) }))
        .filter(a => a.name && a.values.length > 0);
      data.variantAttributes = hasVariants ? validAttrs : [];
      const editingId = editing?.id ?? null;
      if (editing) { await productsApi.update(editing.id, data); toast.success('Product updated'); }
      else { await productsApi.create(data); toast.success('Product created'); }
      setModalOpen(false);
      onSaved({ editingId });
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setSaving(false); }
  };

  const confirmDelete = async (afterDelete: (id: string) => void) => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsApi.delete(deleteTarget.id);
      toast.success('Product deleted');
      afterDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setDeleting(false); }
  };

  return {
    modalOpen, setModalOpen, editing, saving, deleteTarget, setDeleteTarget, deleting,
    name, setName, categoryId, setCategoryId, productCode, setProductCode, description, setDescription,
    brand, setBrand, costPrice, setCostPrice, pTaxPercentage, setPTaxPercentage, unit, setUnit,
    imageUrls, variantAttributes, hasVariants, setHasVariants, price, setPrice, sku, setSku, stockQty, setStockQty,
    uploading, imageMode, setImageMode, urlInput, setUrlInput, fileInputRef,
    selectedCategory, categoryAttrs,
    openCreate, openEdit, handleImageUpload, removeImage, addUrlImage,
    addAttribute, updateAttribute, removeAttribute, handleSave, confirmDelete,
  };
}
