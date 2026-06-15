/** Stock-level badge styling derived from quantity vs the tenant's low-stock threshold. */
export function getStockStatus(qty: number, lowStockThreshold = 10) {
  if (qty === 0) return { label: 'Out of Stock', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
  if (qty <= lowStockThreshold) return { label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
  return { label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
}

export type PurchaseStat = { totalQuantity: number; orderCount: number; lastPurchasedAt?: string };
