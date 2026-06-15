import { Package, Hash, Tag, Layers, Box, Weight } from 'lucide-react';
import type { SACategory, SAProductDetail, SACustomer, SAOrderDetail } from '../../../../lib/api';
import { fmtDate, fmtCurrency, statusBadge, activeBadge, activeDot, stockLabel } from '../utils';
import InfoRow from './InfoRow';

export function CategoryDrawerBody({ data }: { data: SACategory }) {
  return (
    <div className="space-y-5">
      {data.imageUrl && <img src={data.imageUrl} alt={data.name} className="w-full h-48 rounded-xl object-cover" />}
      <div>
        <h3 className="text-xl font-bold text-slate-900">{data.name}</h3>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium mt-2 ${activeBadge(data.isActive)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${activeDot(data.isActive)}`} />{data.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="bg-surface rounded-xl p-4">
        <InfoRow label="Description" value={data.description || '-'} />
        <InfoRow label="Created" value={fmtDate(data.createdAt)} />
      </div>
    </div>
  );
}

export function ProductDrawerBody({ data }: { data: SAProductDetail }) {
  const p = data.product;
  const vs = data.variants;
  const images = p.imageUrls;
  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl border border-slate-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-48 shrink-0 bg-slate-50">
            {images.length > 0 ? (
              <img src={images[0]} alt={p.name} className="w-full h-48 sm:h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 h-full">
                <div className="w-14 h-14 rounded-xl bg-slate-200/60 flex items-center justify-center"><Package size={24} className="text-slate-400" /></div>
                <p className="text-xs text-slate-400">No image</p>
              </div>
            )}
          </div>
          <div className="flex-1 p-5">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
              {p.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{p.description}</p>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0"><Tag size={14} className="text-primary-600" /></div><div><p className="text-[10px] text-slate-400 uppercase font-medium">Category</p><p className="text-sm font-semibold text-slate-900">{p.categoryName || '-'}</p></div></div>
              <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0"><Hash size={14} className="text-violet-600" /></div><div><p className="text-[10px] text-slate-400 uppercase font-medium">Code</p><p className="text-sm font-semibold text-slate-900 font-mono">{p.productCode || '-'}</p></div></div>
              <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"><Layers size={14} className="text-amber-600" /></div><div><p className="text-[10px] text-slate-400 uppercase font-medium">Brand</p><p className="text-sm font-semibold text-slate-900">{p.brand || '-'}</p></div></div>
              <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0"><Box size={14} className="text-cyan-500" /></div><div><p className="text-[10px] text-slate-400 uppercase font-medium">Unit</p><p className="text-sm font-semibold text-slate-900">{p.unit}</p></div></div>
              <div className="flex items-center gap-2.5"><div className={`w-8 h-8 rounded-lg ${p.isActive ? 'bg-emerald-50' : 'bg-red-50'} flex items-center justify-center shrink-0`}><span className={`w-2.5 h-2.5 rounded-full ${activeDot(p.isActive)}`} /></div><div><p className="text-[10px] text-slate-400 uppercase font-medium">Status</p><p className={`text-sm font-semibold ${p.isActive ? 'text-emerald-700' : 'text-red-700'}`}>{p.isActive ? 'Active' : 'Inactive'}</p></div></div>
            </div>
            {p.variantAttributes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-medium mb-2">Variant Attributes</p>
                <div className="flex flex-wrap gap-2">
                  {p.variantAttributes.map((attr, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-xs font-medium text-primary-700">{attr.name}: {attr.values.join(', ')}</span>
                  ))}
                </div>
              </div>
            )}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 overflow-x-auto">
                {images.map((url, idx) => (
                  <img key={idx} src={url} alt={`${p.name} ${idx + 1}`} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Variants ({vs.length})</h4>
        {vs.length === 0 ? (
          <p className="text-sm text-slate-500">No variants configured.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vs.map(v => {
              const stock = stockLabel(v.stockQty);
              const vMargin = v.costPrice && v.price > 0 ? ((v.price - v.costPrice) / v.price * 100) : null;
              const borderAccent = v.stockQty === 0 ? 'border-l-red-500' : v.stockQty <= 10 ? 'border-l-amber-500' : 'border-l-emerald-500';
              return (
                <div key={v.id} className={`bg-surface rounded-xl border border-slate-100 border-l-[3px] ${borderAccent} overflow-hidden`}>
                  <div className="px-4 pt-3 pb-2">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-[11px] font-bold text-primary-700 font-mono"><Hash size={10} />{v.sku}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">{v.unit}</span>
                    </div>
                    {Object.keys(v.attributes).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(v.attributes).map(([key, val]) => (
                          <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 text-[10px] font-semibold text-teal-700">{key}: {val}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="px-4 pb-2">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xl font-extrabold text-primary-600 leading-none">{fmtCurrency(v.finalPrice)}</p>
                        {v.taxPercentage > 0 && <p className="text-[10px] text-slate-400 mt-0.5">incl. {v.taxPercentage}% tax · Base: {fmtCurrency(v.price)}</p>}
                      </div>
                      {vMargin !== null && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${vMargin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{vMargin >= 0 ? '+' : ''}{vMargin.toFixed(1)}%</span>
                      )}
                    </div>
                    {v.costPrice > 0 && <p className="text-[10px] text-slate-400 mt-0.5">Cost: {fmtCurrency(v.costPrice)}</p>}
                  </div>
                  <div className="bg-card px-4 py-2 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${stock.bg} ${stock.text}`}><span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />{stock.label}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{v.stockQty} {v.unit}</span>
                      {v.weight > 0 && <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Weight size={10} />{v.weight}g</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function CustomerDrawerBody({ data }: { data: SACustomer }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">{data.name}</h3>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium mt-2 ${activeBadge(data.isActive)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${activeDot(data.isActive)}`} />{data.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="bg-surface rounded-xl p-4">
        <InfoRow label="Mobile" value={data.mobile || '-'} />
        <InfoRow label="Email" value={data.email || '-'} />
        <InfoRow label="Shop Name" value={data.shopName || '-'} />
        <InfoRow label="GST Number" value={data.gstNumber || '-'} />
        <InfoRow label="Created" value={fmtDate(data.createdAt)} />
      </div>
      <div className="bg-surface rounded-xl p-4 text-center">
        <p className="text-xs text-slate-500 mb-1">Outstanding Amount</p>
        <p className={`text-2xl font-bold ${data.outstandingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{fmtCurrency(data.outstandingAmount)}</p>
      </div>
    </div>
  );
}

export function OrderDrawerBody({ data }: { data: SAOrderDetail }) {
  const o = data.order;
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">{o.orderNumber}</h3>
        <p className="text-sm text-slate-400 mt-0.5">{fmtDate(o.orderDate)}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${statusBadge(o.orderStatus)}`}>{o.orderStatus}</span>
          <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${statusBadge(o.paymentStatus)}`}>Payment: {o.paymentStatus}</span>
        </div>
      </div>

      {o.customer && (
        <div className="bg-surface rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Customer</p>
          <p className="text-sm font-medium text-slate-900">{o.customer.name}</p>
          {o.customer.mobile && <p className="text-xs text-slate-500 mt-0.5">{o.customer.mobile}</p>}
          {o.customer.shopName && <p className="text-xs text-slate-500">{o.customer.shopName}</p>}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl p-3 text-center"><p className="text-xs text-slate-500">Total</p><p className="text-lg font-bold text-slate-900">{fmtCurrency(o.totalAmount)}</p></div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center"><p className="text-xs text-emerald-600">Paid</p><p className="text-lg font-bold text-emerald-700">{fmtCurrency(o.paidAmount)}</p></div>
        <div className="bg-red-50 rounded-xl p-3 text-center"><p className="text-xs text-red-600">Due</p><p className="text-lg font-bold text-red-700">{fmtCurrency(o.totalAmount - o.paidAmount)}</p></div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Items ({data.items.length})</p>
        <div className="space-y-2">
          {data.items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-surface rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                <p className="text-xs text-slate-400">{item.sku}{item.brand ? ` · ${item.brand}` : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{fmtCurrency(item.totalPrice)}</p>
                <p className="text-xs text-slate-400">{item.quantity} {item.unit} x {fmtCurrency(item.pricePerUnit)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(o.notes || o.deliveryNotes) && (
        <div className="space-y-2">
          {o.notes && <div className="bg-surface rounded-xl p-4"><p className="text-xs font-semibold text-slate-500 mb-1">Notes</p><p className="text-sm text-slate-700">{o.notes}</p></div>}
          {o.deliveryNotes && <div className="bg-surface rounded-xl p-4"><p className="text-xs font-semibold text-slate-500 mb-1">Delivery Notes</p><p className="text-sm text-slate-700">{o.deliveryNotes}</p></div>}
        </div>
      )}

      {(o.approvedAt || o.dispatchedAt || o.deliveredAt) && (
        <div className="bg-surface rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Timeline</p>
          <div>
            <InfoRow label="Order Placed" value={fmtDate(o.createdAt)} />
            {o.approvedAt && <InfoRow label="Approved" value={fmtDate(o.approvedAt)} />}
            {o.dispatchedAt && <InfoRow label="Dispatched" value={fmtDate(o.dispatchedAt)} />}
            {o.deliveredAt && <InfoRow label="Delivered" value={fmtDate(o.deliveredAt)} />}
          </div>
        </div>
      )}
    </div>
  );
}
