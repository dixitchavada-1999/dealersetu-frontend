import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight, Loader2, Building2 } from 'lucide-react';
import { cartApi, extractError } from '../../lib/api';
import type { CartItem } from '../../lib/types';
import { formatCurrencyExact } from '../../lib/format';
import toast from '../../lib/toast';
import { getCartItems, setCartItems, getItemKey } from './cartStorage';

/** Shopping cart — grouped by company, quantity edit, multi-tenant order placement. */
export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();
  const fmt = formatCurrencyExact;

  useEffect(() => {
    setItems(getCartItems());
    const handler = () => setItems(getCartItems());
    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, []);

  const updateQty = (key: string, qty: number) => {
    if (qty < 1) return;
    const updated = items.map((i) => (getItemKey(i) === key ? { ...i, quantity: qty } : i));
    setItems(updated);
    setCartItems(updated);
  };
  const removeItem = (key: string) => {
    const updated = items.filter((i) => getItemKey(i) !== key);
    setItems(updated);
    setCartItems(updated);
  };
  const clearCart = () => { setItems([]); setCartItems([]); };

  const grouped = useMemo(() => {
    const groups: Record<string, { tenantName: string; items: CartItem[] }> = {};
    items.forEach((item) => {
      const tid = item.tenantId || 'default';
      if (!groups[tid]) groups[tid] = { tenantName: item.tenantName || 'Unknown', items: [] };
      groups[tid].items.push(item);
    });
    return groups;
  }, [items]);

  const tenantIds = Object.keys(grouped);
  const isMultiTenant = tenantIds.length > 1;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return toast.error('Cart is empty');
    setPlacing(true);
    try {
      if (isMultiTenant || items.some((i) => i.tenantId)) {
        const orderItems = items.map((i) => ({ ...(i.variantId ? { variantId: i.variantId } : {}), ...(!i.variantId && i.productId ? { productId: i.productId } : {}), quantity: i.quantity, tenantId: i.tenantId }));
        const result = await cartApi.placeMultiOrder({ items: orderItems, notes: notes.trim() || undefined });
        const count = result?.length || 1;
        toast.success(`${count} order${count > 1 ? 's' : ''} placed successfully!`);
      } else {
        const orderItems = items.map((i) => ({ ...(i.variantId ? { variantId: i.variantId } : {}), ...(!i.variantId && i.productId ? { productId: i.productId } : {}), quantity: i.quantity }));
        await cartApi.placeOrder({ items: orderItems, notes: notes.trim() || undefined });
        toast.success('Order placed successfully!');
      }
      clearCart();
      setNotes('');
      navigate('/orders');
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center mb-4"><ShoppingCart size={36} className="text-slate-300" /></div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 text-sm mb-6">Browse products and add items to your cart.</p>
        <Link to="/products" className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold shadow-lg transition-all"><Package size={18} /> Browse Products</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''} in cart{isMultiTenant && ` from ${tenantIds.length} companies`}</p>
        </div>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">Clear Cart</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {tenantIds.map((tid) => {
            const group = grouped[tid];
            const groupTotal = group.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
            return (
              <div key={tid}>
                {isMultiTenant && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Building2 size={14} className="text-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">{group.tenantName}</span>
                    <span className="text-xs text-slate-400">({group.items.length} items &middot; {fmt(groupTotal)})</span>
                  </div>
                )}
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <div key={getItemKey(item)} className="bg-card rounded-xl border border-slate-100 p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0"><Package size={20} className="text-slate-400" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{item.productName}</p>
                        <p className="text-xs text-slate-500 font-mono">{item.variantSku}</p>
                        {!isMultiTenant && item.tenantName && <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-medium text-blue-600 mt-0.5">{item.tenantName}</span>}
                        {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.variantAttributes).map(([key, val]) => (
                              <span key={key} className="inline-flex items-center px-1.5 py-0.5 rounded bg-teal-50 text-[10px] font-semibold text-teal-700">{key}: {String(val)}</span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{fmt(item.price)} / {item.unit}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => updateQty(getItemKey(item), item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQty(getItemKey(item), item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"><Plus size={14} /></button>
                      </div>
                      <div className="text-right shrink-0 w-24"><p className="text-sm font-bold text-slate-900">{fmt(item.price * item.quantity)}</p></div>
                      <button onClick={() => removeItem(getItemKey(item))} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors shrink-0"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-slate-100 p-5 sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>
            {isMultiTenant && (
              <div className="space-y-2 mb-3 pb-3 border-b border-slate-100">
                {tenantIds.map((tid) => {
                  const group = grouped[tid];
                  const groupTotal = group.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
                  return (<div key={tid} className="flex justify-between text-xs"><span className="text-slate-500">{group.tenantName}</span><span className="font-medium text-slate-700">{fmt(groupTotal)}</span></div>);
                })}
                <p className="text-[10px] text-slate-400">{tenantIds.length} separate orders will be created</p>
              </div>
            )}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span><span className="font-semibold text-slate-900">{fmt(subtotal)}</span></div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-base"><span className="font-semibold text-slate-900">Total</span><span className="font-bold text-primary-600">{fmt(subtotal)}</span></div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Order Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any special instructions..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm resize-none" />
            </div>
            <button onClick={handlePlaceOrder} disabled={placing} className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm">
              {placing ? <Loader2 size={18} className="animate-spin" /> : <>Place {isMultiTenant ? `${tenantIds.length} Orders` : 'Order'} <ArrowRight size={18} /></>}
            </button>
            <Link to="/products" className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium mt-3 transition-colors">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
