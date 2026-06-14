import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Eye, Loader2, Search, Upload, X, ImageIcon, ShoppingCart,
  Link as LinkIcon, Hash, Weight, Tag, Layers, Box, ArrowRight, Package, Star,
} from 'lucide-react';
import { productsApi, categoriesApi, variantsApi, uploadApi, userApi, extractError } from '../lib/api';
import type { Product, Category, ProductVariant, VariantAttribute } from '../lib/types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { useAuth } from '../contexts/AuthContext';
import { addToCart } from './Cart';
import toast from '../lib/toast';

export default function Products() {
  const { isCustomer } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTenant, setFilterTenant] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Low stock threshold & restock
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [defaultRestockQty, setDefaultRestockQty] = useState(10);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [drawerCategory, setDrawerCategory] = useState<Category | null>(null);
  const [drawerVariants, setDrawerVariants] = useState<ProductVariant[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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
        } catch {}
      }
    } catch (err: any) { toast.error(extractError(err)); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const catName = (id: string) => categories.find(c => c.id === id)?.name || '-';

  // Unique tenants for company filter (customer only)
  const tenantOptions = [...new Map(products.filter(p => p.tenantId).map(p => [p.tenantId, p.tenantName || ''])).entries()];

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    if (!p.name.toLowerCase().includes(q) && !(p.productCode || '').toLowerCase().includes(q) && !(p.brand || '').toLowerCase().includes(q)) return false;
    if (filterTenant !== 'all' && p.tenantId !== filterTenant) return false;
    return true;
  });

  // Reset to page 1 when the filtered set shrinks below current page
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > totalPages) setPage(1);
  }, [filtered.length, pageSize, page]);

  const pageStart = (page - 1) * pageSize;
  const paginated = filtered.slice(pageStart, pageStart + pageSize);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const categoryAttrs = selectedCategory?.variantAttributes || [];

  // ── Drawer ──────────────────────────────────────────
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
      setDrawerProduct(prod);
      setDrawerVariants(vars);
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

  const refreshDrawer = async (productId: string) => {
    try {
      const [prod, vars] = await Promise.all([
        productsApi.getById(productId),
        variantsApi.getAll(productId),
      ]);
      setDrawerProduct(prod);
      setDrawerVariants(vars);
      setDrawerCategory(categories.find(c => c.id === prod.categoryId) || null);
    } catch { /* silent */ }
  };

  const handleStockUpdate = async (v: ProductVariant, newQty: number) => {
    try {
      await variantsApi.updateStock(v.id, newQty);
      toast.success('Stock updated');
      if (drawerProduct) refreshDrawer(drawerProduct.id);
    } catch (err: any) { toast.error(extractError(err)); }
  };

  // ── Image Upload ────────────────────────────────────
  const handleImageUpload = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    const valid = fileArr.filter(f => {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleImageUpload(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => setImageUrls(prev => prev.filter((_, i) => i !== idx));

  const addUrlImage = () => {
    const url = urlInput.trim();
    if (!url) return;
    setImageUrls(prev => [...prev, url]);
    setUrlInput('');
  };

  const addAttribute = () => setVariantAttributes(p => [...p, { name: '', values: [] }]);
  const updateAttribute = (idx: number, field: 'name' | 'values', value: any) => {
    setVariantAttributes(p => p.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };
  const removeAttribute = (idx: number) => setVariantAttributes(p => p.filter((_, i) => i !== idx));

  // ── Product CRUD ────────────────────────────────────
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
      // Trim + drop empty values (the input keeps raw segments while typing so
      // commas aren't swallowed mid-edit), then keep only attributes that still
      // have a name and at least one value.
      const validAttrs = variantAttributes
        .map(a => ({ ...a, name: a.name.trim(), values: a.values.map(v => v.trim()).filter(Boolean) }))
        .filter(a => a.name && a.values.length > 0);
      data.variantAttributes = hasVariants ? validAttrs : [];
      if (editing) { await productsApi.update(editing.id, data); toast.success('Product updated'); }
      else { await productsApi.create(data); toast.success('Product created'); }
      setModalOpen(false);
      load();
      // Refresh drawer if showing this product
      if (drawerOpen && drawerProduct && editing?.id === drawerProduct.id) {
        refreshDrawer(drawerProduct.id);
      }
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsApi.delete(deleteTarget.id);
      toast.success('Product deleted');
      if (drawerProduct?.id === deleteTarget.id) closeDrawer();
      setDeleteTarget(null);
      load();
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setDeleting(false); }
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
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold shadow-lg transition-all">
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      {products.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-card border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
          </div>
          {isCustomer && tenantOptions.length > 1 && (
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
        <EmptyState title={search ? 'No results' : 'No products'} message={search ? 'Try a different search term.' : 'Create your first product.'} />
      ) : isCustomer ? (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginated.map(p => {
              const img = p.imageUrl || p.imageUrls?.[0];
              const hasDiscount = (p.effectiveDiscount ?? 0) > 0;
              const showPrice = !p.hasVariants && (p.finalPrice != null || p.price != null);
              const basePrice = p.finalPrice ?? p.price ?? 0;
              const discountedPrice = p.discountedPrice ?? basePrice;
              const showStrike = !p.hasVariants && discountedPrice < basePrice;
              const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
              const outOfStock = !p.hasVariants && (p.stockQty ?? 0) === 0;
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
                    {/* Discount badge */}
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold shadow-sm">
                        {p.effectiveDiscount}% OFF
                      </span>
                    )}
                    {/* Company badge */}
                    {tenantOptions.length > 1 && p.tenantName && (
                      <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-md bg-card/90 backdrop-blur text-[10px] font-semibold text-slate-600 border border-slate-200 shadow-sm max-w-[60%] truncate">
                        {p.tenantName}
                      </span>
                    )}
                    {/* Out of stock overlay */}
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

                    {/* Action button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (p.hasVariants !== false) {
                          openDrawer(p.id);
                        } else if (!outOfStock) {
                          addToCart({
                            productId: p.id,
                            productName: p.name,
                            variantSku: p.sku || p.productCode || '',
                            price: discountedPrice,
                            quantity: 1,
                            unit: p.unit || 'Piece',
                            tenantId: p.tenantId || '',
                            tenantName: p.tenantName || '',
                          });
                          toast.success(`Added ${p.name} to cart`);
                        }
                      }}
                      disabled={outOfStock}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      {outOfStock ? (
                        'Unavailable'
                      ) : p.hasVariants !== false ? (
                        <>View Options <ArrowRight size={12} /></>
                      ) : (
                        <><ShoppingCart size={12} /> Add to Cart</>
                      )}
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
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Code</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Brand</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Rating</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => openDrawer(p.id)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {(p.imageUrl || p.imageUrls?.[0]) ? (
                          <img src={p.imageUrl || p.imageUrls![0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <ImageIcon size={16} className="text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                            {(p.effectiveDiscount ?? 0) > 0 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-50 text-[10px] font-bold text-red-600">{p.effectiveDiscount}% OFF</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 sm:hidden">{catName(p.categoryId)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-xs font-medium text-primary-700">{catName(p.categoryId)}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 font-mono hidden md:table-cell">{p.productCode || '-'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500 hidden lg:table-cell">{p.brand || '-'}</td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {(p.averageRating ?? 0) > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-600 text-white text-xs font-bold">
                            {p.averageRating!.toFixed(1)}
                            <Star size={10} className="fill-white text-white" />
                          </span>
                          <span className="text-[10px] text-slate-400">{p.reviewCount} ratings</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">No ratings</span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDrawer(p.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><Eye size={16} /></button>
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><Pencil size={16} /></button>
                        <button onClick={() => setDeleteTarget(p)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100">
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

      {/* ── Product Add/Edit Modal ──────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} wide>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm bg-card">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Code</label>
              <input value={productCode} onChange={e => setProductCode(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand</label>
              <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cost Price</label>
              <input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tax %</label>
              <input type="number" min="0" max="100" value={pTaxPercentage} onChange={e => { const v = e.target.value; if (v === '' || (Number(v) >= 0 && Number(v) <= 100)) setPTaxPercentage(v); }} placeholder="0" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
              <p className="text-[10px] text-slate-400 mt-1">Default tax for variants</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
              <input value={unit} onChange={e => setUnit(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm resize-none" />
          </div>

          {/* Has Variants Toggle */}
          <div className="flex items-center justify-between py-3 border-t border-b border-slate-100">
            <div>
              <label className="text-sm font-medium text-slate-700">Has Variants</label>
              <p className="text-[10px] text-slate-400 mt-0.5">Turn off to set price & stock directly on product</p>
            </div>
            <button type="button" onClick={() => setHasVariants(!hasVariants)} className={`relative w-11 h-6 rounded-full transition-colors ${hasVariants ? 'bg-primary-600' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasVariants ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Non-variant product fields */}
          {!hasVariants && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase">Product Pricing & Stock</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price *</label>
                  <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                  <input value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU code" className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Qty</label>
                  <input type="number" min="0" value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Multi-Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">Images {imageUrls.length > 0 && <span className="text-slate-400">({imageUrls.length})</span>}</label>
              <div className="flex items-center gap-1 bg-slate-200/60 rounded-lg p-0.5">
                <button type="button" onClick={() => setImageMode('upload')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${imageMode === 'upload' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Upload size={12} /> Upload
                </button>
                <button type="button" onClick={() => setImageMode('url')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${imageMode === 'url' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <LinkIcon size={12} /> URL
                </button>
              </div>
            </div>

            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`Image ${idx + 1}`} className="w-20 h-20 object-cover rounded-xl border border-slate-200" onError={e => { e.currentTarget.src = ''; e.currentTarget.className = 'w-20 h-20 rounded-xl border border-slate-200 bg-red-50'; }} />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary-600 text-white text-[9px] font-bold rounded-md">Main</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imageMode === 'upload' ? (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${uploading ? 'border-primary-300 bg-primary-50' : 'border-slate-200 hover:border-primary-400 hover:bg-primary-50'}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files?.length) handleImageUpload(e.target.files); e.target.value = ''; }} />
                {uploading ? (
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
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrlImage(); } }}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
                />
                <button type="button" onClick={addUrlImage} className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium shrink-0">
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Variant Attributes (only when hasVariants) */}
          {hasVariants && <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Variant Attributes</label>
              <button type="button" onClick={addAttribute} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Add Attribute</button>
            </div>

            {categoryAttrs.length > 0 && variantAttributes.length === 0 && (
              <div className="rounded-xl bg-primary-50 border border-primary-200/40 px-4 py-3 mb-3">
                <p className="text-xs font-medium text-primary-700 mb-2">Inherited from category "{selectedCategory?.name}":</p>
                <div className="flex flex-wrap gap-2">
                  {categoryAttrs.map((attr, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-100 text-xs font-medium text-primary-700">
                      {attr.name}: {attr.values.join(', ')}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-primary-400 mt-2">Add product-level attributes below to override these.</p>
              </div>
            )}

            {variantAttributes.map((attr, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-start">
                <input placeholder="Name (e.g. Size)" value={attr.name} onChange={e => updateAttribute(idx, 'name', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                <input placeholder="Values (comma-separated)" value={attr.values.join(', ')} onChange={e => updateAttribute(idx, 'values', e.target.value.split(',').map(v => v.replace(/^\s+/, '')))} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                <button onClick={() => removeAttribute(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}

            {variantAttributes.length === 0 && categoryAttrs.length === 0 && (
              <p className="text-xs text-slate-400">No attributes defined. Add attributes like Size, Color, Material with their values.</p>
            )}
          </div>}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium text-sm shadow-sm">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} message={`Delete product "${deleteTarget?.name}"?`} />

      {/* ── Product Detail Drawer ──────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-3xl bg-card shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">
            {drawerProduct ? drawerProduct.name : 'Product Details'}
          </h2>
          <button onClick={closeDrawer} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
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
              onEditProduct={() => { openEdit(drawerProduct); }}
              onStockUpdate={handleStockUpdate}
              lowStockThreshold={lowStockThreshold}
              defaultRestockQty={defaultRestockQty}
              isCustomer={isCustomer}
            />
          ) : null}
        </div>
      </aside>
    </div>
  );
}

/* ── Drawer Content Component ──────────────────────────── */
export function DrawerContent({
  product, category, variants, activeImageIdx, setActiveImageIdx, onEditProduct, onStockUpdate, lowStockThreshold = 10, defaultRestockQty = 10, isCustomer = false, purchaseByVariant,
}: {
  product: Product;
  category: Category | null;
  variants: ProductVariant[];
  activeImageIdx: number;
  setActiveImageIdx: (i: number) => void;
  onEditProduct: () => void;
  onStockUpdate: (v: ProductVariant, qty: number) => void;
  lowStockThreshold?: number;
  defaultRestockQty?: number;
  isCustomer?: boolean;
  /** When set (My Products view), annotate each variant with the customer's purchase history. */
  purchaseByVariant?: Record<string, { totalQuantity: number; orderCount: number; lastPurchasedAt?: string }>;
}) {
  const productImages = product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [];
  const activeImage = productImages[activeImageIdx] || null;
  const variantAttrs: VariantAttribute[] = product.variantAttributes?.length
    ? product.variantAttributes
    : category?.variantAttributes || [];

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: 'Out of Stock', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
    if (qty <= lowStockThreshold) return { label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
    return { label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
  };

  return (
    <div className="p-6 space-y-5">
      {/* Image Gallery */}
      {productImages.length > 0 ? (
        <div>
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={activeImage!}
              alt={product.name}
              className="w-full h-56 object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          {productImages.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {productImages.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${idx === activeImageIdx ? 'border-primary-500' : 'border-transparent hover:border-slate-300'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center py-10">
          <div className="w-16 h-16 rounded-xl bg-slate-200/60 flex items-center justify-center mb-2">
            <Package size={28} className="text-slate-400" />
          </div>
          <p className="text-xs text-slate-400">No images</p>
        </div>
      )}

      {/* Product Info */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
              {(product.effectiveDiscount ?? 0) > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 text-xs font-bold text-red-600">{product.effectiveDiscount}% OFF</span>
              )}
            </div>
            {product.description && (
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{product.description}</p>
            )}
          </div>
          {!isCustomer && (
            <button
              onClick={onEditProduct}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors shrink-0"
            >
              <Pencil size={12} /> Edit
            </button>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={12} className="text-primary-600" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Category</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{category?.name || '-'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Hash size={12} className="text-violet-600" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Code</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 font-mono">{product.productCode || '-'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Layers size={12} className="text-amber-600" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Brand</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{product.brand || '-'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Box size={12} className="text-cyan-500" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Unit</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{product.unit || 'Piece'}</p>
          </div>
        </div>

        {/* Status Badge + Rating */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${product.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {product.isActive ? 'Active' : 'Inactive'}
          </span>
          {(product.averageRating ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 text-white text-sm font-bold">
                {product.averageRating!.toFixed(1)}
                <Star size={12} className="fill-white text-white" />
              </span>
              <span className="text-xs text-slate-400">{product.reviewCount} ratings</span>
            </div>
          )}
        </div>
      </div>

      {/* Variant Attributes */}
      {product.hasVariants !== false && variantAttrs.length > 0 && (
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-2">Variant Attributes</p>
          <div className="flex flex-wrap gap-2">
            {variantAttrs.map((attr, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-xs font-medium text-primary-700">
                {attr.name}: {attr.values.join(', ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Variants / Direct Product Section */}
      <div>
        {product.hasVariants === false ? (
          /* Non-variant product: show price, stock, and add to cart directly */
          <>
            <p className="text-sm font-semibold text-slate-900 mb-3">Product Details</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Price</span>
                <span className="text-lg font-bold text-slate-900">
                  {product.finalPrice != null ? fmt(product.finalPrice) : product.price != null ? fmt(product.price) : '-'}
                </span>
              </div>
              {/* SKU */}
              {product.sku && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">SKU</span>
                  <span className="text-sm font-mono text-slate-700">{product.sku}</span>
                </div>
              )}
              {/* Stock */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Stock</span>
                {(() => {
                  const stock = getStockStatus(product.stockQty ?? 0);
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${stock.bg} ${stock.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />
                      {stock.label} ({product.stockQty ?? 0})
                    </span>
                  );
                })()}
              </div>
              {/* Add to Cart for customers */}
              {isCustomer && (
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <ShoppingCart size={16} />
                  {(product.stockQty ?? 0) === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>
          </>
        ) : (
        /* Variant-based product */
        <>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-900">Variants ({variants.length})</p>
          <Link
            to={`/products/${product.id}`}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            Manage <ArrowRight size={12} />
          </Link>
        </div>

        {variants.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl">
            <Package size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No variants configured</p>
            <Link
              to={`/products/${product.id}`}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1"
            >
              Add variants <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {variants.map(v => {
              const stock = getStockStatus(v.stockQty);
              const margin = v.costPrice && v.price > 0 ? ((v.price - v.costPrice) / v.price * 100) : null;
              return (
                <div key={v.id} className="bg-slate-50 rounded-xl p-4">
                  {/* SKU + Unit */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-[11px] font-bold text-primary-700 font-mono">
                      <Hash size={10} />{v.sku}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-200/70 text-[11px] font-semibold text-slate-600">
                      {v.unit}
                    </span>
                  </div>

                  {/* Attributes */}
                  {v.attributes && Object.keys(v.attributes).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {Object.entries(v.attributes).map(([key, val]) => (
                        <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 text-[10px] font-semibold text-teal-700 tracking-wide">
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Purchase history (My Products view only) */}
                  {purchaseByVariant?.[v.id] && (
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium text-primary-600">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50">
                        Ordered {purchaseByVariant[v.id].totalQuantity} {v.unit || ''} · {purchaseByVariant[v.id].orderCount}×
                      </span>
                      {purchaseByVariant[v.id].lastPurchasedAt && (
                        <span className="text-slate-400">
                          Last {new Date(purchaseByVariant[v.id].lastPurchasedAt!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      {v.discountedPrice != null && v.discountedPrice < v.finalPrice ? (
                        <>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-extrabold text-primary-600">{fmt(v.discountedPrice)}</p>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-50 text-[10px] font-bold text-red-600">{v.effectiveDiscount}% OFF</span>
                          </div>
                          <p className="text-[10px] text-red-400 line-through">{fmt(v.finalPrice)}</p>
                          {(v.customerDiscount ?? 0) > 0 && (
                            <p className="text-[10px] text-blue-500">Includes {v.customerDiscount}% customer discount</p>
                          )}
                        </>
                      ) : (
                        <p className="text-lg font-extrabold text-primary-600">{fmt(v.finalPrice)}</p>
                      )}
                      {v.taxPercentage > 0 && (
                        <p className="text-[10px] text-slate-400">incl. {v.taxPercentage}% tax &middot; Base: {fmt(v.price)}</p>
                      )}
                      {v.costPrice != null && v.costPrice > 0 && (
                        <p className="text-[10px] text-slate-400">Cost: {fmt(v.costPrice)}</p>
                      )}
                    </div>
                    {margin !== null && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${margin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {margin >= 0 ? '+' : ''}{margin.toFixed(1)}%
                      </span>
                    )}
                  </div>

                  {/* Stock / Add to Cart */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${stock.bg} ${stock.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />
                        {stock.label}
                      </span>
                      {!isCustomer && (
                        <>
                          <span className="text-[11px] text-slate-500 font-medium">{v.stockQty} {v.unit}</span>
                          {v.weight != null && v.weight > 0 && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Weight size={10} />{v.weight}g</span>
                          )}
                        </>
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
                        className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        {v.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onStockUpdate(v, v.stockQty + defaultRestockQty)}
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
                            if (val !== v.stockQty) onStockUpdate(v, val);
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
        )}
        </>
        )}
      </div>
    </div>
  );
}
