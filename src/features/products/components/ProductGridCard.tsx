import type { ReactNode } from 'react';
import { ImageIcon, Star, Repeat } from 'lucide-react';
import type { Product } from '../../../lib/types';
import { formatCurrency, formatShortDate } from '../../../lib/format';
import type { PurchaseStat } from '../utils';

export type CardComputed = { discountedPrice: number; outOfStock: boolean };

type Props = {
  product: Product;
  showTenant: boolean;
  onOpen: (id: string) => void;
  /** My Products view: shows order-history badge above the rating. */
  purchaseInfo?: PurchaseStat;
  /** Footer action area; receives derived pricing/stock state. */
  footer: (ctx: CardComputed) => ReactNode;
};

/** Customer-facing product tile — image, badges, price, and a caller-supplied action footer. */
export default function ProductGridCard({ product: p, showTenant, onOpen, purchaseInfo, footer }: Props) {
  const img = p.imageUrl || p.imageUrls?.[0];
  const hasDiscount = (p.effectiveDiscount ?? 0) > 0;
  const showPrice = !p.hasVariants && (p.finalPrice != null || p.price != null);
  const basePrice = p.finalPrice ?? p.price ?? 0;
  const discountedPrice = p.discountedPrice ?? basePrice;
  const showStrike = !p.hasVariants && discountedPrice < basePrice;
  const outOfStock = !p.hasVariants && (p.stockQty ?? 0) === 0;

  return (
    <div
      onClick={() => onOpen(p.id)}
      className="group bg-card rounded-xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col"
    >
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {img ? (
          <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><ImageIcon size={36} className="text-slate-300" /></div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold shadow-sm">{p.effectiveDiscount}% OFF</span>
        )}
        {showTenant && p.tenantName && (
          <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-md bg-card/90 backdrop-blur text-[10px] font-semibold text-slate-600 border border-slate-200 shadow-sm max-w-[60%] truncate">{p.tenantName}</span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-surface/70 backdrop-blur-sm flex items-center justify-center">
            <span className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold shadow">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        {p.brand && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5 truncate">{p.brand}</p>}
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug min-h-[2.5rem]">{p.name}</h3>

        {purchaseInfo && (
          <div className="mt-1.5 flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary-600">
              <Repeat size={10} />
              Ordered {purchaseInfo.orderCount}× &middot; {purchaseInfo.totalQuantity} {p.unit || 'pcs'}
            </span>
            {purchaseInfo.lastPurchasedAt && <span className="text-[10px] text-slate-400">Last: {formatShortDate(purchaseInfo.lastPurchasedAt)}</span>}
          </div>
        )}

        {(p.averageRating ?? 0) > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-600 text-white text-[10px] font-bold">
              {p.averageRating!.toFixed(1)}<Star size={8} className="fill-white text-white" />
            </span>
            <span className="text-[10px] text-slate-400">({p.reviewCount})</span>
          </div>
        )}

        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          {showPrice ? (
            <>
              <span className="text-base font-extrabold text-slate-900">{formatCurrency(discountedPrice)}</span>
              {showStrike && <span className="text-xs text-slate-400 line-through">{formatCurrency(basePrice)}</span>}
            </>
          ) : p.hasVariants ? (
            <span className="text-xs text-slate-500 font-medium">Multiple options</span>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}
        </div>

        {footer({ discountedPrice, outOfStock })}
      </div>
    </div>
  );
}
