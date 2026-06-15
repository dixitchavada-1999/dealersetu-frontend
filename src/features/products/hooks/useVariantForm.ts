import { useState, useEffect, useMemo } from 'react';
import { variantsApi, extractError } from '../../../lib/api';
import type { Product, ProductVariant } from '../../../lib/types';
import toast from '../../../lib/toast';

type Options = {
  productId: string | undefined;
  product: Product | null;
  onSaved: () => void;
};

/** Variant create/edit modal state, SKU auto-generation, and price/margin previews. */
export function useVariantForm({ productId, product, onSaved }: Options) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductVariant | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [sku, setSku] = useState('');
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [taxPercentage, setTaxPercentage] = useState('0');
  const [stockQty, setStockQty] = useState('0');
  const [selectedUnit, setSelectedUnit] = useState('Piece');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Auto-generate SKU from selected attribute values (unless user typed their own).
  useEffect(() => {
    if (skuManuallyEdited) return;
    const values = Object.values(selectedAttributes).filter(Boolean);
    if (values.length > 0) setSku(values.map(v => v.toUpperCase().replace(/\s+/g, '')).join('-'));
    else if (!editing) setSku('');
  }, [selectedAttributes, skuManuallyEdited, editing]);

  const finalPrice = useMemo(() => {
    const p = Number(price) || 0;
    return p + (p * (Number(taxPercentage) || 0) / 100);
  }, [price, taxPercentage]);

  const margin = useMemo(() => {
    const p = Number(price) || 0;
    const c = Number(costPrice) || 0;
    if (c <= 0 || p <= 0) return null;
    return ((p - c) / p) * 100;
  }, [price, costPrice]);

  const openCreate = () => {
    setEditing(null);
    setSku(''); setSkuManuallyEdited(false);
    setPrice(''); setCostPrice(''); setTaxPercentage(product?.taxPercentage?.toString() || '0');
    setStockQty('0'); setSelectedUnit(product?.unit || 'Piece');
    setWeight(''); setDimensions(''); setSelectedAttributes({});
    setOpen(true);
  };

  const openEdit = (v: ProductVariant) => {
    setEditing(v);
    setSku(v.sku); setSkuManuallyEdited(true);
    setPrice(v.price.toString());
    setCostPrice(v.costPrice?.toString() || '');
    setTaxPercentage(v.taxPercentage.toString());
    setStockQty(v.stockQty.toString());
    setSelectedUnit(v.unit);
    setWeight(v.weight?.toString() || '');
    setDimensions(v.dimensions || '');
    setSelectedAttributes(v.attributes || {});
    setOpen(true);
  };

  const toggleAttribute = (attrName: string, value: string) => {
    setSelectedAttributes(prev => {
      const updated = { ...prev };
      if (updated[attrName] === value) delete updated[attrName];
      else updated[attrName] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!sku.trim() || !price) return toast.error('SKU and price are required');
    const taxNum = Number(taxPercentage) || 0;
    if (taxNum < 0 || taxNum > 100) return toast.error('Tax % must be between 0 and 100');
    setSaving(true);
    try {
      const priceNum = Number(price);
      const data: any = {
        productId, sku, price: priceNum, taxPercentage: taxNum,
        finalPrice: priceNum + (priceNum * taxNum / 100),
        stockQty: Number(stockQty) || 0, unit: selectedUnit,
      };
      if (costPrice) data.costPrice = Number(costPrice);
      if (weight) data.weight = Number(weight);
      if (dimensions) data.dimensions = dimensions;
      if (Object.keys(selectedAttributes).length > 0) data.attributes = selectedAttributes;

      if (editing) { await variantsApi.update(editing.id, data); toast.success('Variant updated'); }
      else { await variantsApi.create(data); toast.success('Variant created'); }
      setOpen(false);
      onSaved();
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await variantsApi.delete(deleteTarget.id);
      toast.success('Variant deleted');
      setDeleteTarget(null);
      onSaved();
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setDeleting(false); }
  };

  return {
    open, setOpen, editing, saving, deleteTarget, setDeleteTarget, deleting,
    sku, setSku, setSkuManuallyEdited, price, setPrice, costPrice, setCostPrice,
    taxPercentage, setTaxPercentage, stockQty, setStockQty, selectedUnit, setSelectedUnit,
    weight, setWeight, dimensions, setDimensions, selectedAttributes,
    finalPrice, margin, openCreate, openEdit, toggleAttribute, handleSave, confirmDelete,
  };
}
