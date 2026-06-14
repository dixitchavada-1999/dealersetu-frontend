// Route entry — implementation lives in features/cart.
// Cart-storage helpers are re-exported so existing importers keep working.
export { default } from '../features/cart/CartPage';
export { getCartItems, setCartItems, addToCart, getCartCount } from '../features/cart/cartStorage';
