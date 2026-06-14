import type { CartItem } from '../../lib/types';

const CART_KEY = 'shop_cart';

/** Stable key for a cart line (tenant + variant/product). */
export function getItemKey(item: CartItem): string {
  return `${item.tenantId || ''}_${item.variantId || item.productId}`;
}

export function getCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return items.filter((i: any) => i.productId); // drop old-format items
  } catch {
    return [];
  }
}

export function setCartItems(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(item: CartItem) {
  const items = getCartItems();
  const key = getItemKey(item);
  const idx = items.findIndex((i) => getItemKey(i) === key);
  if (idx >= 0) items[idx].quantity += item.quantity;
  else items.push({ ...item });
  setCartItems(items);
}

export function getCartCount(): number {
  return getCartItems().reduce((sum, i) => sum + i.quantity, 0);
}
