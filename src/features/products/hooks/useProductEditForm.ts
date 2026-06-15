import { useState, useRef } from 'react';
import { productsApi, uploadApi, extractError } from '../../../lib/api';
import type { Product, Category, VariantAttribute } from '../../../lib/types';
import toast from '../../../lib/toast';

type Options = {
  categories: Category[];
  onSaved: () => void;
};

/** Product-edit modal state (used on the product detail page; uploads to the variants folder). */
export function useProductEditForm({ categories, onSaved }: Options) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productCode, setProductCode] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [taxPercentage, setTaxPercentage] = useState('0');
  const [unit, setUnit] = useState('Piece');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [variantAttributes, setVariantAttributes] = useState<VariantAttribute[]>([]);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const categoryAttrs = selectedCategory?.variantAttributes || [];

  const openEdit = (product: Product) => {
    setProductId(product.id);
    setName(product.name);
    setCategoryId(product.categoryId);
    setProductCode(product.productCode || '');
    setDescription(product.description || '');
    setBrand(product.brand || '');
    setCostPrice(product.costPrice?.toString() || '');
    setTaxPercentage(product.taxPercentage?.toString() || '0');
    setUnit(product.unit || 'Piece');
    setImageUrls(product.imageUrls?.length ? [...product.imageUrls] : product.imageUrl ? [product.imageUrl] : []);
    setVariantAttributes(product.variantAttributes || []);
    setImageMode('upload');
    setUrlInput('');
    setOpen(true);
  };

  const handleImageUpload = async (files: FileList | File[]) => {
    const valid = Array.from(files).filter(f => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5MB`); return false; }
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false; }
      return true;
    });
    if (valid.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(valid.map(f => uploadApi.uploadImage(f, 'variants')));
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

  const addAttribute = () => setVariantAttributes(p => [...p, { name: '', values: [] }]);
  const updateAttribute = (idx: number, field: 'name' | 'values', value: any) =>
    setVariantAttributes(p => p.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  const removeAttribute = (idx: number) => setVariantAttributes(p => p.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!name.trim() || !categoryId) return toast.error('Name and category are required');
    if (!productId) return;
    setSaving(true);
    try {
      const data: any = {
        name, categoryId, productCode, description, brand, unit,
        taxPercentage: Number(taxPercentage) || 0,
      };
      if (costPrice) data.costPrice = Number(costPrice);
      data.imageUrls = imageUrls;
      data.variantAttributes = variantAttributes
        .map(a => ({ ...a, name: a.name.trim(), values: a.values.map(v => v.trim()).filter(Boolean) }))
        .filter(a => a.name && a.values.length > 0);
      await productsApi.update(productId, data);
      toast.success('Product updated');
      setOpen(false);
      onSaved();
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setSaving(false); }
  };

  return {
    open, setOpen, saving,
    name, setName, categoryId, setCategoryId, productCode, setProductCode, description, setDescription,
    brand, setBrand, costPrice, setCostPrice, taxPercentage, setTaxPercentage, unit, setUnit,
    imageUrls, variantAttributes, imageMode, setImageMode, uploading, urlInput, setUrlInput, fileInputRef,
    selectedCategory, categoryAttrs,
    openEdit, handleImageUpload, removeImage, addUrlImage, addAttribute, updateAttribute, removeAttribute, handleSave,
  };
}
