import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader2, Hash, Weight, IndianRupee, ShoppingCart,
  Upload, X, ImageIcon, LinkIcon, Package, Tag, Layers, Box, Star,
} from 'lucide-react';
import { productsApi, variantsApi, categoriesApi, uploadApi, userApi, extractError } from '../lib/api';
import type { Product, ProductVariant, Category, VariantAttribute } from '../lib/types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import toast from '../lib/toast';
import { useAuth } from '../contexts/AuthContext';
import { addToCart } from './Cart';

const UNIT_OPTIONS = ['Piece', 'Kg', 'Gram', 'Liter', 'Meter', 'Box', 'Dozen', 'Set', 'Pair'];

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { isCustomer } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [defaultRestockQty, setDefaultRestockQty] = useState(10);

  // Variant modal
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Product edit modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [pName, setPName] = useState('');
  const [pCategoryId, setPCategoryId] = useState('');
  const [pProductCode, setPProductCode] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pCostPrice, setPCostPrice] = useState('');
  const [pTaxPercentage, setPTaxPercentage] = useState('0');
  const [pUnit, setPUnit] = useState('Piece');
  const [pImageUrls, setPImageUrls] = useState<string[]>([]);
  const [pVariantAttributes, setPVariantAttributes] = useState<VariantAttribute[]>([]);
  const [pImageMode, setPImageMode] = useState<'upload' | 'url'>('upload');
  const [pUploading, setPUploading] = useState(false);
  const [pUrlInput, setPUrlInput] = useState('');
  const pFileInputRef = useRef<HTMLInputElement>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Variant form state
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

  // Get variant attributes from product or category
  const variantAttributes: VariantAttribute[] = useMemo(() => {
    if (product?.variantAttributes && product.variantAttributes.length > 0) return product.variantAttributes;
    if (category?.variantAttributes && category.variantAttributes.length > 0) return category.variantAttributes;
    return [];
  }, [product, category]);

  // Auto-generate SKU from selected attributes
  useEffect(() => {
    if (skuManuallyEdited) return;
    const values = Object.values(selectedAttributes).filter(Boolean);
    if (values.length > 0) {
      setSku(values.map(v => v.toUpperCase().replace(/\s+/g, '')).join('-'));
    } else if (!editingVariant) {
      setSku('');
    }
  }, [selectedAttributes, skuManuallyEdited, editingVariant]);

  // Calculate final price
  const finalPrice = useMemo(() => {
    const p = Number(price) || 0;
    const t = Number(taxPercentage) || 0;
    return p + (p * t / 100);
  }, [price, taxPercentage]);

  // Calculate margin
  const margin = useMemo(() => {
    const p = Number(price) || 0;
    const c = Number(costPrice) || 0;
    if (c <= 0 || p <= 0) return null;
    return ((p - c) / p * 100);
  }, [price, costPrice]);

  const load = async () => {
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
      const cat = cats.find(c => c.id === p.categoryId) || null;
      setCategory(cat);
    } catch (err: any) {
      toast.error(extractError(err));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  // ── Product Edit ──────────────────────────────
  const openEditProduct = () => {
    if (!product) return;
    setPName(product.name);
    setPCategoryId(product.categoryId);
    setPProductCode(product.productCode || '');
    setPDescription(product.description || '');
    setPBrand(product.brand || '');
    setPCostPrice(product.costPrice?.toString() || '');
    setPTaxPercentage(product.taxPercentage?.toString() || '0');
    setPUnit(product.unit || 'Piece');
    setPImageUrls(product.imageUrls?.length ? [...product.imageUrls] : product.imageUrl ? [product.imageUrl] : []);
    setPVariantAttributes(product.variantAttributes || []);
    setPImageMode('upload');
    setPUrlInput('');
    setProductModalOpen(true);
  };

  const handleProductImageUpload = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    const valid = fileArr.filter(f => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5MB`); return false; }
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false; }
      return true;
    });
    if (valid.length === 0) return;
    setPUploading(true);
    try {
      const uploaded = await Promise.all(valid.map(f => uploadApi.uploadImage(f, 'variants')));
      setPImageUrls(prev => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`);
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setPUploading(false); }
  };

  const handleProductDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleProductImageUpload(e.dataTransfer.files);
  };

  const removePImage = (idx: number) => setPImageUrls(prev => prev.filter((_, i) => i !== idx));

  const addPUrlImage = () => {
    const url = pUrlInput.trim();
    if (!url) return;
    setPImageUrls(prev => [...prev, url]);
    setPUrlInput('');
  };

  const addPAttribute = () => setPVariantAttributes(p => [...p, { name: '', values: [] }]);
  const updatePAttribute = (idx: number, field: 'name' | 'values', value: any) => {
    setPVariantAttributes(p => p.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };
  const removePAttribute = (idx: number) => setPVariantAttributes(p => p.filter((_, i) => i !== idx));

  const handleSaveProduct = async () => {
    if (!pName.trim() || !pCategoryId) return toast.error('Name and category are required');
    setProductSaving(true);
    try {
      const data: any = {
        name: pName, categoryId: pCategoryId, productCode: pProductCode,
        description: pDescription, brand: pBrand, unit: pUnit,
        taxPercentage: Number(pTaxPercentage) || 0,
      };
      if (pCostPrice) data.costPrice = Number(pCostPrice);
      data.imageUrls = pImageUrls;
      const validAttrs = pVariantAttributes.filter(a => a.name.trim() && a.values.length > 0);
      data.variantAttributes = validAttrs;
      await productsApi.update(product!.id, data);
      toast.success('Product updated');
      setProductModalOpen(false);
      load();
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setProductSaving(false); }
  };

  // ── Variant CRUD ──────────────────────────────
  const openCreateVariant = () => {
    setEditingVariant(null);
    setSku(''); setSkuManuallyEdited(false);
    setPrice(''); setCostPrice(''); setTaxPercentage(product?.taxPercentage?.toString() || '0');
    setStockQty('0'); setSelectedUnit(product?.unit || 'Piece');
    setWeight(''); setDimensions('');
    setSelectedAttributes({});
    setVariantModalOpen(true);
  };

  const openEditVariant = (v: ProductVariant) => {
    setEditingVariant(v);
    setSku(v.sku); setSkuManuallyEdited(true);
    setPrice(v.price.toString());
    setCostPrice(v.costPrice?.toString() || '');
    setTaxPercentage(v.taxPercentage.toString());
    setStockQty(v.stockQty.toString());
    setSelectedUnit(v.unit);
    setWeight(v.weight?.toString() || '');
    setDimensions(v.dimensions || '');
    setSelectedAttributes(v.attributes || {});
    setVariantModalOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!sku.trim() || !price) return toast.error('SKU and price are required');
    const taxNum = Number(taxPercentage) || 0;
    if (taxNum < 0 || taxNum > 100) return toast.error('Tax % must be between 0 and 100');
    setSaving(true);
    try {
      const priceNum = Number(price);
      const data: any = {
        productId: id, sku, price: priceNum, taxPercentage: taxNum,
        finalPrice: priceNum + (priceNum * taxNum / 100),
        stockQty: Number(stockQty) || 0, unit: selectedUnit,
      };
      if (costPrice) data.costPrice = Number(costPrice);
      if (weight) data.weight = Number(weight);
      if (dimensions) data.dimensions = dimensions;
      if (Object.keys(selectedAttributes).length > 0) data.attributes = selectedAttributes;

      if (editingVariant) {
        await variantsApi.update(editingVariant.id, data);
        toast.success('Variant updated');
      } else {
        await variantsApi.create(data);
        toast.success('Variant created');
      }
      setVariantModalOpen(false);
      load();
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setSaving(false); }
  };

  const handleDeleteVariant = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await variantsApi.delete(deleteTarget.id);
      toast.success('Variant deleted');
      setDeleteTarget(null);
      load();
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setDeleting(false); }
  };

  const handleStockUpdate = async (v: ProductVariant, newQty: number) => {
    try {
      await variantsApi.updateStock(v.id, newQty);
      toast.success('Stock updated');
      load();
    } catch (err: any) { toast.error(extractError(err)); }
  };

  const handleProductStockUpdate = async (newQty: number) => {
    if (!product) return;
    try {
      await productsApi.update(product.id, { stockQty: newQty });
      toast.success('Stock updated');
      load();
    } catch (err: any) { toast.error(extractError(err)); }
  };

  const toggleAttribute = (attrName: string, value: string) => {
    setSelectedAttributes(prev => {
      const updated = { ...prev };
      if (updated[attrName] === value) delete updated[attrName];
      else updated[attrName] = value;
      return updated;
    });
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: 'Out of Stock', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
    if (qty <= lowStockThreshold) return { label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
    return { label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
  };

  // Category attrs for the product edit modal
  const editSelectedCategory = categories.find(c => c.id === pCategoryId);
  const editCategoryAttrs = editSelectedCategory?.variantAttributes || [];

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  );
  if (!product) return <EmptyState title="Product not found" />;

  const productImages = product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [];
  const activeImage = productImages[activeImageIdx] || null;

  return (
    <div>
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 font-medium">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      {/* ── Product Info Card ──────────────────────────── */}
      <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <div className="sm:w-56 md:w-64 shrink-0 bg-slate-50 flex flex-col">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-48 sm:flex-1 object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 flex-1">
                <div className="w-16 h-16 rounded-xl bg-slate-200/60 flex items-center justify-center">
                  <Package size={28} className="text-slate-400" />
                </div>
                <p className="text-xs text-slate-400">No image</p>
              </div>
            )}
            {/* Thumbnail strip */}
            {productImages.length > 1 && (
              <div className="flex gap-1.5 p-2 overflow-x-auto">
                {productImages.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${idx === activeImageIdx ? 'border-primary-500' : 'border-transparent hover:border-slate-300'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
                  {(product.effectiveDiscount ?? 0) > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 text-xs font-bold text-red-600">{product.effectiveDiscount}% OFF</span>
                  )}
                </div>
                {product.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{product.description}</p>}
              </div>
              <button
                onClick={openEditProduct}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors shrink-0"
              >
                <Pencil size={14} /> Edit
              </button>
            </div>

            {/* Flipkart-style Rating */}
            {(product.averageRating ?? 0) > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 text-white text-base font-bold leading-none">
                  {product.averageRating!.toFixed(1)}
                  <Star size={14} className="fill-white text-white" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{product.reviewCount} Ratings &amp; Reviews</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={11} className={i <= Math.round(product.averageRating!) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Tag size={16} className="text-primary-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Category</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{category?.name || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <Hash size={16} className="text-violet-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Code</p>
                  <p className="text-sm font-semibold text-slate-900 font-mono truncate">{product.productCode || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Layers size={16} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Brand</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{product.brand || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <IndianRupee size={16} className="text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Tax</p>
                  <p className="text-sm font-semibold text-slate-900">{product.taxPercentage || 0}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                  <Box size={16} className="text-cyan-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Unit</p>
                  <p className="text-sm font-semibold text-slate-900">{product.unit || 'Piece'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${product.isActive ? 'bg-emerald-50' : 'bg-red-50'} flex items-center justify-center shrink-0`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Status</p>
                  <p className={`text-sm font-semibold ${product.isActive ? 'text-emerald-700' : 'text-red-700'}`}>{product.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>

            {/* Variant Attributes tags */}
            {product.hasVariants !== false && variantAttributes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">Variant Attributes</p>
                <div className="flex flex-wrap gap-2">
                  {variantAttributes.map((attr, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-xs font-medium text-primary-700">
                      {attr.name}: {attr.values.join(', ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Non-Variant Product Section ──────────────────────────── */}
      {product.hasVariants === false && (
        <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Product Details</h2>
              <p className="text-sm text-slate-500">Direct pricing &amp; stock</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">Price</p>
              <p className="text-2xl font-extrabold text-primary-600 leading-none">
                {product.finalPrice != null ? fmt(product.finalPrice) : product.price != null ? fmt(product.price) : '-'}
              </p>
              {(product.taxPercentage ?? 0) > 0 && product.price != null && (
                <p className="text-[10px] text-slate-400 mt-1.5">incl. {product.taxPercentage}% tax &middot; Base: {fmt(product.price)}</p>
              )}
            </div>

            {/* SKU */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">SKU</p>
              <p className="text-sm font-semibold text-slate-900 font-mono">{product.sku || product.productCode || '-'}</p>
            </div>

            {/* Stock */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">Stock</p>
              {(() => {
                const stock = getStockStatus(product.stockQty ?? 0);
                return (
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${stock.bg} ${stock.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />
                      {stock.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{product.stockQty ?? 0} {product.unit || 'Piece'}</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-end gap-2">
            {isCustomer ? (
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
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-lg transition-colors"
              >
                <ShoppingCart size={16} />
                {(product.stockQty ?? 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleProductStockUpdate((product.stockQty ?? 0) + defaultRestockQty)}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
                  title={`Quick restock +${defaultRestockQty}`}
                >
                  +{defaultRestockQty}
                </button>
                <input
                  type="number"
                  defaultValue={product.stockQty ?? 0}
                  min={0}
                  onBlur={e => {
                    const val = Number(e.target.value);
                    if (val !== (product.stockQty ?? 0)) handleProductStockUpdate(val);
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  className="w-20 px-2 py-2 border border-slate-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  title="Update stock"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Variants Header ──────────────────────────── */}
      {product.hasVariants !== false && (
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Variants</h2>
          <p className="text-sm text-slate-500">{variants.length} variant{variants.length !== 1 ? 's' : ''} configured</p>
        </div>
        {!isCustomer && (
          <button onClick={openCreateVariant} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium shadow-lg transition-colors">
            <Plus size={16} /> Add Variant
          </button>
        )}
      </div>
      )}

      {/* ── Variant Cards ──────────────────────────── */}
      {product.hasVariants !== false && (
      variants.length === 0 ? (
        <EmptyState title="No variants" message="Add variants with pricing and stock." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {variants.map(v => {
            const stock = getStockStatus(v.stockQty);
            const vMargin = v.costPrice && v.price > 0 ? ((v.price - v.costPrice) / v.price * 100) : null;
            const borderAccent = v.stockQty === 0 ? 'border-l-red-500' : v.stockQty <= lowStockThreshold ? 'border-l-amber-500' : 'border-l-emerald-500';
            return (
              <div key={v.id} className={`bg-card rounded-xl shadow-sm border border-slate-100 border-l-[3px] ${borderAccent} overflow-hidden hover:shadow-md transition-all`}>
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-[11px] font-bold text-primary-700 font-mono truncate max-w-[160px]">
                      <Hash size={10} className="shrink-0" /><span className="truncate">{v.sku}</span>
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600 shrink-0">
                      {v.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {!isCustomer && (
                      <>
                        <button onClick={() => openEditVariant(v)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary-600 transition-colors" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(v)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                </div>

                {v.attributes && Object.keys(v.attributes).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                    {Object.entries(v.attributes).map(([key, val]) => (
                      <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 text-[10px] font-semibold text-teal-700 tracking-wide">
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                )}

                <div className="px-4 pb-3">
                  <div className="flex items-end justify-between">
                    <div>
                      {v.discountedPrice != null && v.discountedPrice < v.finalPrice ? (
                        <>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-extrabold text-primary-600 leading-none">{fmt(v.discountedPrice)}</p>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-50 text-[10px] font-bold text-red-600">{v.effectiveDiscount}% OFF</span>
                          </div>
                          <p className="text-[10px] text-red-400 line-through mt-0.5">{fmt(v.finalPrice)}</p>
                          {(v.customerDiscount ?? 0) > 0 && (
                            <p className="text-[10px] text-blue-500">Includes {v.customerDiscount}% customer discount</p>
                          )}
                        </>
                      ) : (
                        <p className="text-2xl font-extrabold text-primary-600 leading-none">{fmt(v.finalPrice)}</p>
                      )}
                      {v.taxPercentage > 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">incl. {v.taxPercentage}% tax &middot; Base: {fmt(v.price)}</p>
                      )}
                    </div>
                    {vMargin !== null && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${vMargin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {vMargin >= 0 ? '+' : ''}{vMargin.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  {v.costPrice != null && v.costPrice > 0 && (
                    <p className="text-[10px] text-slate-400 mt-0.5">Cost: {fmt(v.costPrice)}</p>
                  )}
                </div>

                <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${stock.bg} ${stock.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />
                      {stock.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{v.stockQty} {v.unit}</span>
                    {v.weight != null && v.weight > 0 && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Weight size={10} />{v.weight}g</span>
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
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <ShoppingCart size={12} />
                      {v.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStockUpdate(v, v.stockQty + defaultRestockQty)}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-semibold transition-colors"
                      title={`Quick restock +${defaultRestockQty}`}
                    >
                      +{defaultRestockQty}
                    </button>
                    <input
                      type="number"
                      defaultValue={v.stockQty}
                      min={0}
                      onBlur={e => {
                        const val = Number(e.target.value);
                        if (val !== v.stockQty) handleStockUpdate(v, val);
                      }}
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
      )
      )}

      {/* ── Edit Product Modal ──────────────────────────── */}
      <Modal isOpen={productModalOpen} onClose={() => setProductModalOpen(false)} title="Edit Product" wide>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
            <input value={pName} onChange={e => setPName(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
            <select value={pCategoryId} onChange={e => setPCategoryId(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm bg-card">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Code</label>
              <input value={pProductCode} onChange={e => setPProductCode(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand</label>
              <input value={pBrand} onChange={e => setPBrand(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cost Price</label>
              <input type="number" value={pCostPrice} onChange={e => setPCostPrice(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax %</label>
              <input type="number" min="0" max="100" value={pTaxPercentage} onChange={e => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && Number(v) <= 100)) setPTaxPercentage(v); }} placeholder="0" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
              <p className="text-[10px] text-slate-400 mt-1">Default tax for variants</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
              <input value={pUnit} onChange={e => setPUnit(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea value={pDescription} onChange={e => setPDescription(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm resize-none" />
          </div>

          {/* Multi-Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">Images {pImageUrls.length > 0 && <span className="text-slate-400">({pImageUrls.length})</span>}</label>
              <div className="flex items-center gap-1 bg-slate-200/60 rounded-lg p-0.5">
                <button type="button" onClick={() => setPImageMode('upload')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${pImageMode === 'upload' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Upload size={12} /> Upload
                </button>
                <button type="button" onClick={() => setPImageMode('url')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${pImageMode === 'url' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <LinkIcon size={12} /> URL
                </button>
              </div>
            </div>

            {pImageUrls.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {pImageUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`Image ${idx + 1}`} className="w-20 h-20 object-cover rounded-xl border border-slate-200" onError={e => { e.currentTarget.src = ''; e.currentTarget.className = 'w-20 h-20 rounded-xl border border-slate-200 bg-red-50'; }} />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary-600 text-white text-[9px] font-bold rounded-md">Main</span>
                    )}
                    <button type="button" onClick={() => removePImage(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {pImageMode === 'upload' ? (
              <div
                onDrop={handleProductDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => pFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${pUploading ? 'border-primary-300 bg-primary-50' : 'border-slate-200 hover:border-primary-400 hover:bg-primary-50'}`}
              >
                <input ref={pFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files?.length) handleProductImageUpload(e.target.files); e.target.value = ''; }} />
                {pUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-primary-500" />
                    <p className="text-sm text-primary-600 font-medium">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-200/50">
                      <ImageIcon size={20} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Click to upload or drag & drop</p>
                      <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB &middot; Multiple files supported</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={pUrlInput}
                  onChange={e => setPUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPUrlImage(); } }}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                />
                <button type="button" onClick={addPUrlImage} className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium shrink-0">
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Variant Attributes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Variant Attributes</label>
              <button type="button" onClick={addPAttribute} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Add Attribute</button>
            </div>

            {editCategoryAttrs.length > 0 && pVariantAttributes.length === 0 && (
              <div className="rounded-xl bg-primary-50 border border-primary-200/40 px-4 py-3 mb-3">
                <p className="text-xs font-medium text-primary-700 mb-2">Inherited from category "{editSelectedCategory?.name}":</p>
                <div className="flex flex-wrap gap-2">
                  {editCategoryAttrs.map((attr, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-100 text-xs font-medium text-primary-700">
                      {attr.name}: {attr.values.join(', ')}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-primary-400 mt-2">Add product-level attributes below to override these.</p>
              </div>
            )}

            {pVariantAttributes.map((attr, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-start">
                <input placeholder="Name (e.g. Size)" value={attr.name} onChange={e => updatePAttribute(idx, 'name', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                <input placeholder="Values (comma-separated)" value={attr.values.join(', ')} onChange={e => updatePAttribute(idx, 'values', e.target.value.split(',').map(v => v.trim()).filter(Boolean))} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                <button onClick={() => removePAttribute(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}

            {pVariantAttributes.length === 0 && editCategoryAttrs.length === 0 && (
              <p className="text-xs text-slate-400">No attributes defined.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setProductModalOpen(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm">Cancel</button>
            <button onClick={handleSaveProduct} disabled={productSaving} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium text-sm shadow-sm">
              {productSaving ? 'Saving...' : 'Update Product'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Variant Add/Edit Modal ──────────────────────────── */}
      <Modal isOpen={variantModalOpen} onClose={() => setVariantModalOpen(false)} title={editingVariant ? 'Edit Variant' : 'Add Variant'} wide>
        <div className="space-y-5">
          {variantAttributes.length > 0 && (
            <div className="space-y-4">
              {variantAttributes.map(attr => (
                <div key={attr.name}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{attr.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map(val => {
                      const isSelected = selectedAttributes[attr.name] === val;
                      return (
                        <button
                          key={val} type="button"
                          onClick={() => toggleAttribute(attr.name, val)}
                          className={`px-3.5 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="border-b border-slate-100" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">SKU *</label>
            <input
              value={sku}
              onChange={e => { setSku(e.target.value); setSkuManuallyEdited(true); }}
              placeholder={variantAttributes.length > 0 ? 'Auto-generated from attributes' : 'Enter SKU'}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Price *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cost Price</label>
              <input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax %</label>
              <input type="number" min="0" max="100" value={taxPercentage} onChange={e => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && Number(v) <= 100)) setTaxPercentage(v); }} placeholder="0" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
              {product?.taxPercentage ? <p className="text-[10px] text-slate-400 mt-1">Product default: {product.taxPercentage}%. Leave 0 to use product tax.</p> : null}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock Qty</label>
              <input type="number" value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
            <div className="flex flex-wrap gap-2">
              {UNIT_OPTIONS.map(u => (
                <button key={u} type="button" onClick={() => setSelectedUnit(u)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    selectedUnit === u
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >{u}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Weight (g)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Optional" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Dimensions</label>
              <input value={dimensions} onChange={e => setDimensions(e.target.value)} placeholder="e.g. 10x5x3 cm" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                  <IndianRupee size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Estimated Final Price</p>
                  <p className="text-xl font-bold text-primary-600">{fmt(finalPrice)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Price + {Number(taxPercentage) || 0}% Tax</p>
                {margin !== null && (
                  <p className={`text-xs font-semibold ${margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {margin >= 0 ? '+' : ''}{margin.toFixed(1)}% margin
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setVariantModalOpen(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors">Cancel</button>
            <button onClick={handleSaveVariant} disabled={saving} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm font-medium shadow-lg transition-colors">
              {saving ? 'Saving...' : editingVariant ? 'Update Variant' : 'Save Variant'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteVariant} isLoading={deleting} message={`Delete variant "${deleteTarget?.sku}"?`} />
    </div>
  );
}
