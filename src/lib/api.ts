import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  Category, Product, ProductVariant, Order, OrderDetail, OrderItem,
  DashboardStats, UserMember, Tenant, DispatchMember, DispatchPermissions,
  ProductionMember, ProductionPermissions, MarketingMember, MarketingPermissions,
  CustomerBalances, User, Notification, NotificationPagination, Feedback, FeedbackType,
  Banner,
} from './types';
import toast from './toast';

// ── Token helpers ──────────────────────────────────────────────

const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  USER: 'user',
} as const;

export const getToken = () => localStorage.getItem(TOKEN_KEYS.ACCESS);
export const getRefreshTokenValue = () => localStorage.getItem(TOKEN_KEYS.REFRESH);

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(TOKEN_KEYS.ACCESS, access);
  localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
  // New session → drop any cached data from a previous user/tenant.
  clearApiCache();
};

export const setUser = (user: User) => {
  localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
};

export const getStoredUser = (): User | null => {
  const str = localStorage.getItem(TOKEN_KEYS.USER);
  if (!str) return null;
  try { return JSON.parse(str); } catch { return null; }
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
  localStorage.removeItem(TOKEN_KEYS.USER);
  clearApiCache();
};

// ── Axios instance ─────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${API_BASE}/api` });

// Request interceptor – attach token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – refresh on 401
let isRefreshing = false;
let failedQueue: { resolve: (t: string) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
};

// Detect tenant/user suspension errors (403 from auth middleware)
const isSuspensionError = (data: any): boolean => {
  const msg = String(data?.message || '').toLowerCase();
  return msg.includes('suspended') || msg.includes('has been deactivated');
};

let suspensionHandled = false;

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle account/tenant suspension — superadmin deactivated tenant or user
    if (error.response?.status === 403 && isSuspensionError(error.response.data)) {
      if (!suspensionHandled) {
        suspensionHandled = true;
        const message = String((error.response.data as any)?.message || 'Your account has been suspended. Please contact administrator.');
        toast.error(message, { duration: 5000 });
        clearTokens();
        // Brief delay so user can read the message, then redirect
        setTimeout(() => {
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        }, 2500);
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            },
            reject,
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refreshToken = getRefreshTokenValue();
      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh-token`, { refreshToken });
        const newToken = data.data.accessToken;
        localStorage.setItem(TOKEN_KEYS.ACCESS, newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

// ── Generic helpers ────────────────────────────────────────────

function extractError(err: any): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as any;
    if (data?.errors?.length) {
      return data.errors.map((e: any) => e.msg || e.message || e).join('. ');
    }
    return data?.message || err.message;
  }
  return err?.message || 'Something went wrong';
}

// ── GET response cache (in-memory, stale-while-TTL) ────────────
//
// Transparent to callers: `get()` serves a cached payload when it's younger
// than its TTL, de-duplicates concurrent identical requests, and mutations
// (POST/PUT/PATCH/DELETE) invalidate the affected resource's cache. The cache
// is fully cleared on login/logout so one user never sees another's data.

type CacheEntry = { data: any; ts: number };
const responseCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<any>>();

// Default freshness window. Short enough that data never feels stale, long
// enough that navigating between pages is instant. Tunable per-call via `ttl`.
const DEFAULT_TTL = 60_000; // 60s

// Endpoints that should always hit the network (highly dynamic / per-moment).
const NO_CACHE_PREFIXES = ['/auth', '/notifications'];

const cloneData = <T>(d: T): T => {
  if (d === null || typeof d !== 'object') return d;
  try { return structuredClone(d); } catch { return JSON.parse(JSON.stringify(d)); }
};

const isCacheable = (url: string) => !NO_CACHE_PREFIXES.some(p => url.startsWith(p));

/** Drop cached GETs whose key starts with the given prefix. */
export function invalidateCache(prefix: string) {
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) responseCache.delete(key);
  }
}

/** Wipe the entire GET cache (call on login / logout / tenant switch). */
export function clearApiCache() {
  responseCache.clear();
  inflight.clear();
}

// Collections whose data is derived from another resource, so mutating the
// source must also refresh them.
const RELATED_INVALIDATIONS: Record<string, string[]> = {
  '/orders': ['/products', '/dashboard'], // a new order changes "My Products" + stats
  '/team': ['/products', '/customers'],   // customer discount changes affect prices
  '/customers': ['/dashboard'],
  '/products': ['/dashboard', '/variants'], // product edits flow down to its variants
  '/variants': ['/products', '/dashboard'], // variant price/stock shows in product lists + stats
  '/categories': ['/products'],
  '/feedback': ['/products'],              // ratings shown on product cards
};

// After a mutation, invalidate the collection it belongs to (plus any derived
// collections) so the next read is fresh. e.g. PUT /products/123 → invalidate
// every '/products…' key.
const invalidateForMutation = (url: string) => {
  const collection = '/' + url.replace(/^\//, '').split('/')[0];
  invalidateCache(collection);
  (RELATED_INVALIDATIONS[collection] || []).forEach(invalidateCache);
};

async function get<T>(url: string, opts?: { ttl?: number; force?: boolean }): Promise<T> {
  if (!isCacheable(url)) {
    const { data } = await api.get(url);
    return data.data;
  }

  const ttl = opts?.ttl ?? DEFAULT_TTL;

  if (!opts?.force) {
    const hit = responseCache.get(url);
    if (hit && Date.now() - hit.ts < ttl) {
      return cloneData(hit.data);
    }
    const pending = inflight.get(url);
    if (pending) return cloneData(await pending);
  }

  const req = api.get(url)
    .then(res => {
      const payload = res.data.data;
      responseCache.set(url, { data: payload, ts: Date.now() });
      return payload;
    })
    .finally(() => { inflight.delete(url); });

  inflight.set(url, req);
  return cloneData(await req);
}

async function post<T>(url: string, body?: any): Promise<T> {
  const { data } = await api.post(url, body);
  invalidateForMutation(url);
  return data.data;
}

async function put<T>(url: string, body?: any): Promise<T> {
  const { data } = await api.put(url, body);
  invalidateForMutation(url);
  return data.data;
}

async function patch<T>(url: string, body?: any): Promise<T> {
  const { data } = await api.patch(url, body);
  invalidateForMutation(url);
  return data.data;
}

async function del<T>(url: string): Promise<T> {
  const { data } = await api.delete(url);
  invalidateForMutation(url);
  return data.data;
}

// ── Mappers (backend _id → frontend id) ───────────────────────

const mapCategory = (c: any): Category => ({
  id: c._id,
  name: c.name || '',
  description: c.description || '',
  imageUrl: c.imageUrl || '',
  variantAttributes: c.variantAttributes || [],
  createdAt: c.createdAt,
});

const mapProduct = (p: any): Product => {
  const imageUrls = p.imageUrls?.length ? p.imageUrls : p.imageUrl ? [p.imageUrl] : [];
  let categoryId = '';
  if (typeof p.categoryId === 'object' && p.categoryId?._id) categoryId = p.categoryId._id;
  else if (p.categoryId) categoryId = p.categoryId;
  return {
    id: p._id,
    name: p.name || '',
    categoryId,
    productCode: p.productCode || '',
    description: p.description || '',
    brand: p.brand || '',
    costPrice: p.costPrice,
    taxPercentage: p.taxPercentage || 0,
    unit: p.unit || 'Piece',
    imageUrl: imageUrls[0] || '',
    imageUrls,
    variantAttributes: p.variantAttributes || [],
    discount: p.discount || 0,
    effectiveDiscount: p.effectiveDiscount || 0,
    averageRating: p.averageRating || 0,
    reviewCount: p.reviewCount || 0,
    hasVariants: p.hasVariants ?? true,
    price: p.price,
    stockQty: p.stockQty,
    sku: p.sku,
    finalPrice: p.finalPrice,
    discountedPrice: p.discountedPrice,
    isActive: p.isActive ?? true,
    tenantId: p.tenantId?.toString?.() || p.tenantId || '',
    tenantName: p.tenantName || '',
    tenantLogo: p.tenantLogo || '',
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    ...(p.purchaseInfo ? { purchaseInfo: {
      lastPurchasedAt: p.purchaseInfo.lastPurchasedAt,
      totalQuantity: p.purchaseInfo.totalQuantity || 0,
      orderCount: p.purchaseInfo.orderCount || 0,
      variants: Array.isArray(p.purchaseInfo.variants) ? p.purchaseInfo.variants.map((v: any) => ({
        variantId: v.variantId,
        totalQuantity: v.totalQuantity || 0,
        orderCount: v.orderCount || 0,
        lastPurchasedAt: v.lastPurchasedAt,
      })) : [],
    } } : {}),
  };
};

const mapVariant = (v: any): ProductVariant => ({
  id: v._id,
  tenantId: v.tenantId,
  productId: typeof v.productId === 'object' ? v.productId._id : v.productId,
  sku: v.sku,
  price: v.price,
  costPrice: v.costPrice,
  taxPercentage: v.taxPercentage ?? 0,
  finalPrice: v.finalPrice,
  discountedPrice: v.discountedPrice,
  effectiveDiscount: v.effectiveDiscount || 0,
  customerDiscount: v.customerDiscount || 0,
  stockQty: v.stockQty,
  unit: v.unit || 'Piece',
  weight: v.weight,
  dimensions: v.dimensions,
  attributes: v.attributes,
  images: v.images,
  isActive: v.isActive,
  createdAt: v.createdAt,
  updatedAt: v.updatedAt,
});

const mapOrder = (o: any): Order => ({
  id: o._id,
  orderNumber: o.orderNumber,
  customerId: typeof o.customerId === 'object' ? o.customerId._id : o.customerId,
  customerName: typeof o.customerId === 'object' ? o.customerId.name : undefined,
  orderDate: o.orderDate,
  subtotal: o.subtotal,
  courierCharge: o.courierCharge || 0,
  additionalDiscount: o.additionalDiscount || 0,
  additionalCharge: o.additionalCharge || 0,
  additionalChargeNote: o.additionalChargeNote || '',
  totalAmount: o.totalAmount,
  paidAmount: o.paidAmount,
  paymentStatus: o.paymentStatus,
  orderStatus: o.orderStatus,
  notes: o.notes,
  deliveryNotes: o.deliveryNotes,
  approvedAt: o.approvedAt,
  dispatchedAt: o.dispatchedAt,
  deliveredAt: o.deliveredAt,
  createdAt: o.createdAt,
  updatedAt: o.updatedAt,
});

const mapOrderItem = (item: any): OrderItem => {
  const variant = item.variantId || {};
  const product = variant.productId || {};
  return {
    id: item._id,
    variantId: typeof variant === 'object' ? variant._id : variant,
    variantSku: variant.sku || '',
    productName: product.name || '',
    productCode: product.productCode || '',
    brand: product.brand || '',
    quantity: item.quantity,
    unit: item.unit || 'Piece',
    pricePerUnit: item.pricePerUnit,
    totalPrice: item.totalPrice,
  };
};

const mapUserMember = (m: any): UserMember => ({
  id: m.id || m._id,
  name: m.name || '',
  firstName: m.firstName || '',
  lastName: m.lastName || '',
  email: m.email || '',
  mobileNumber: m.mobileNumber || '',
  shopName: m.shopName || '',
  gstNumber: m.gstNumber || '',
  discount: m.discount || 0,
  address: m.address || {},
  loginCode: m.loginCode || '',
  isDeviceLocked: m.isDeviceLocked || false,
  deviceId: m.deviceId || '',
  linkedCustomerId: m.linkedCustomerId || null,
  role: m.role || 'USER',
  isActive: m.isActive ?? true,
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
});

const mapDispatchMember = (m: any): DispatchMember => ({
  id: m.id || m._id,
  firstName: m.firstName || '',
  lastName: m.lastName || '',
  email: m.email || '',
  mobileNumber: m.mobileNumber || '',
  role: m.role || 'DISPATCH',
  isActive: m.isActive ?? true,
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
});

const mapProductionMember = (m: any): ProductionMember => ({
  id: m.id || m._id,
  firstName: m.firstName || '',
  lastName: m.lastName || '',
  email: m.email || '',
  mobileNumber: m.mobileNumber || '',
  role: m.role || 'PRODUCTION',
  isActive: m.isActive ?? true,
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
});

const mapMarketingMember = (m: any): MarketingMember => ({
  id: m.id || m._id,
  firstName: m.firstName || '',
  lastName: m.lastName || '',
  email: m.email || '',
  mobileNumber: m.mobileNumber || '',
  role: m.role || 'MARKETING',
  isActive: m.isActive ?? true,
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
});

const mapTenant = (t: any): Tenant => ({
  id: t.id || t._id,
  name: t.name || '',
  businessType: t.businessType || '',
  phone: t.phone || '',
  email: t.email || '',
  address: t.address || '',
  logo: t.logo || '',
  dispatchPermissions: t.dispatchPermissions,
  productionPermissions: t.productionPermissions,
  marketingPermissions: t.marketingPermissions,
  lowStockThreshold: t.lowStockThreshold ?? 10,
  commonDiscount: t.commonDiscount || 0,
  defaultRestockQuantity: t.defaultRestockQuantity || 10,
  bannerRotateInterval: t.bannerRotateInterval ?? 5,
  themeRotateInterval: t.themeRotateInterval ?? 5,
  exploreGridCols: t.exploreGridCols ?? 3,
  exploreGridGap: t.exploreGridGap ?? 1,
  exploreImageHeight: t.exploreImageHeight ?? 0,
  exploreShowTitle: t.exploreShowTitle !== false,
  notificationsEnabled: t.notificationsEnabled ?? true,
  notificationPreferences: t.notificationPreferences,
  gstNumber: t.gstNumber || '',
  udyamNumber: t.udyamNumber || '',
  aadharNumber: t.aadharNumber || '',
  panNumber: t.panNumber || '',
  bankDetails: {
    accountNumber: t.bankDetails?.accountNumber || '',
    ifscCode: t.bankDetails?.ifscCode || '',
  },
});

// ── Auth API ──────────────────────────────────────────────────

export const authApi = {
  login: async (credentials: { email?: string; userName?: string; mobileNumber?: string; password: string; deviceId?: string }) => {
    return post<{ user: any; tokens: { accessToken: string; refreshToken: string }; availableTenants?: any[] }>('/auth/login', credentials);
  },

  activateAccount: async (loginCode: string, password: string, confirmPassword: string) => {
    return post<{ user: any; tokens: { accessToken: string; refreshToken: string }; availableTenants?: any[] }>('/auth/activate-account', { loginCode, password, confirmPassword, deviceId: 'web-browser' });
  },

  register: async (userData: {
    firstName: string; lastName: string; email: string;
    userName: string; password: string; mobileNumber: string;
    businessName?: string;
  }) => {
    return post<{ user: any; tokens: { accessToken: string; refreshToken: string } }>('/auth/register', userData);
  },

  logout: async () => {
    const refreshToken = getRefreshTokenValue();
    const user = getStoredUser();
    try {
      await post('/auth/logout', { refreshToken, userId: user?.id });
    } catch {
      // ignore
    }
    clearTokens();
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return post('/auth/update-password', { currentPassword, newPassword });
  },

  updateProfile: async (data: { firstName?: string; lastName?: string; email?: string; mobileNumber?: string; password?: string }) => {
    return post<{ user: any }>('/auth/update-profile', data);
  },

  forgotPassword: async (identifier: string) => {
    // Detect if phone number or email
    const isPhone = /^\+?\d{7,15}$/.test(identifier.replace(/[\s-]/g, ''));
    const { data } = await api.post('/auth/forgot-password', isPhone ? { mobileNumber: identifier } : { email: identifier });
    return data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
    return data;
  },
};

// ── Categories API ────────────────────────────────────────────

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await get<any[]>('/categories');
    if (!res || !Array.isArray(res)) return [];
    return res.filter(c => c?._id).map(mapCategory);
  },
  getById: async (id: string) => mapCategory(await get<any>(`/categories/${id}`)),
  create: async (data: Partial<Category>) => mapCategory(await post<any>('/categories', data)),
  update: async (id: string, data: Partial<Category>) => mapCategory(await put<any>(`/categories/${id}`, data)),
  delete: async (id: string) => del<any>(`/categories/${id}`),
};

// ── Products API ──────────────────────────────────────────────

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const res = await get<any[]>('/products');
    if (!res || !Array.isArray(res)) return [];
    return res.filter(p => p?._id).map(mapProduct);
  },
  // Products the logged-in customer has previously purchased (order history).
  getMyPurchased: async (): Promise<Product[]> => {
    const res = await get<any[]>('/products/my-purchased');
    if (!res || !Array.isArray(res)) return [];
    return res.filter(p => p?._id).map(mapProduct);
  },
  getById: async (id: string) => mapProduct(await get<any>(`/products/${id}`)),
  create: async (data: Partial<Product>) => mapProduct(await post<any>('/products', data)),
  update: async (id: string, data: Partial<Product>) => mapProduct(await put<any>(`/products/${id}`, data)),
  delete: async (id: string) => del<any>(`/products/${id}`),
};


// ── Variants API ──────────────────────────────────────────────

export const variantsApi = {
  getAll: async (productId?: string): Promise<ProductVariant[]> => {
    const url = productId ? `/variants?productId=${productId}` : '/variants';
    const res = await get<any[]>(url);
    if (!res || !Array.isArray(res)) return [];
    return res.map(mapVariant);
  },
  getById: async (id: string) => mapVariant(await get<any>(`/variants/${id}`)),
  create: async (data: Partial<ProductVariant>) => mapVariant(await post<any>('/variants', data)),
  update: async (id: string, data: Partial<ProductVariant>) => mapVariant(await put<any>(`/variants/${id}`, data)),
  delete: async (id: string) => del<any>(`/variants/${id}`),
  updateStock: async (id: string, stockQty: number) => mapVariant(await patch<any>(`/variants/${id}/stock`, { stockQty })),
};

// ── Orders API ────────────────────────────────────────────────

export const ordersApi = {
  getAll: async (customerId?: string): Promise<Order[]> => {
    const url = customerId ? `/orders?customerId=${customerId}` : '/orders';
    const res = await get<any[]>(url);
    if (!res || !Array.isArray(res)) return [];
    return res.map(mapOrder);
  },
  getById: async (id: string): Promise<OrderDetail> => {
    const res = await get<any>(`/orders/${id}`);
    return {
      order: mapOrder(res.order),
      items: Array.isArray(res.items) ? res.items.map(mapOrderItem) : [],
    };
  },
  create: async (data: Partial<Order>) => mapOrder(await post<any>('/orders', data)),
  update: async (id: string, data: Partial<Order>) => mapOrder(await put<any>(`/orders/${id}`, data)),
  delete: async (id: string) => del<any>(`/orders/${id}`),
  permanentDelete: async (id: string) => del<any>(`/orders/${id}/permanent`),
  editCharges: async (id: string, data: { courierCharge?: number; additionalDiscount?: number; additionalCharge?: number; additionalChargeNote?: string }) =>
    mapOrder(await put<any>(`/orders/${id}/edit`, data)),
};

// ── Dashboard API ─────────────────────────────────────────────

export const dashboardApi = {
  getStats: () => get<DashboardStats>('/dashboard'),
};

// ── User / Team API ───────────────────────────────────────────

export const userApi = {
  getMembers: async (): Promise<UserMember[]> => {
    const res = await get<any[]>('/team');
    if (!res || !Array.isArray(res)) return [];
    return res.map(mapUserMember);
  },
  createMember: async (data: any) => mapUserMember(await post<any>('/team', data)),
  updateMember: async (id: string, data: any) => mapUserMember(await put<any>(`/team/${id}`, data)),
  deleteMember: async (id: string) => del<any>(`/team/${id}`),
  resetDevice: async (id: string) => put<any>(`/team/${id}/reset-device`),
  getBalances: () => get<CustomerBalances>('/team/balances'),
  getTenant: async () => mapTenant(await get<any>('/team/tenant')),
  updateTenant: async (data: Partial<Tenant>) => mapTenant(await put<any>('/team/tenant', data)),
};

// ── Dispatch API ──────────────────────────────────────────────

export const dispatchApi = {
  getDispatchUsers: async (): Promise<DispatchMember[]> => {
    const res = await get<any[]>('/team/dispatch');
    if (!res || !Array.isArray(res)) return [];
    return res.map(mapDispatchMember);
  },
  createDispatchUser: async (data: any) => mapDispatchMember(await post<any>('/team/dispatch', data)),
  updateDispatchUser: async (id: string, data: any) => mapDispatchMember(await put<any>(`/team/dispatch/${id}`, data)),
  deleteDispatchUser: async (id: string) => del<any>(`/team/dispatch/${id}`),
  updatePermissions: async (perms: Partial<DispatchPermissions>) =>
    put<{ dispatchPermissions: DispatchPermissions }>('/team/dispatch-permissions', perms),
};

// ── Production API ────────────────────────────────────────────

export const productionApi = {
  getAll: async (): Promise<ProductionMember[]> => {
    const res = await get<any[]>('/team/production');
    if (!res || !Array.isArray(res)) return [];
    return res.map(mapProductionMember);
  },
  create: async (data: any) => mapProductionMember(await post<any>('/team/production', data)),
  update: async (id: string, data: any) => mapProductionMember(await put<any>(`/team/production/${id}`, data)),
  delete: async (id: string) => del<any>(`/team/production/${id}`),
  updatePermissions: async (perms: Partial<ProductionPermissions>) =>
    put<{ productionPermissions: ProductionPermissions }>('/team/production-permissions', perms),
};

// ── Marketing API ─────────────────────────────────────────────

export const marketingApi = {
  getAll: async (): Promise<MarketingMember[]> => {
    const res = await get<any[]>('/team/marketing');
    if (!res || !Array.isArray(res)) return [];
    return res.map(mapMarketingMember);
  },
  create: async (data: any) => mapMarketingMember(await post<any>('/team/marketing', data)),
  update: async (id: string, data: any) => mapMarketingMember(await put<any>(`/team/marketing/${id}`, data)),
  delete: async (id: string) => del<any>(`/team/marketing/${id}`),
  updatePermissions: async (perms: Partial<MarketingPermissions>) =>
    put<{ marketingPermissions: MarketingPermissions }>('/team/marketing-permissions', perms),
};

// ── Upload API ────────────────────────────────────────────────

export type UploadModule = 'products' | 'banners' | 'categories' | 'users' | 'variants' | 'logos' | 'general';

export const uploadApi = {
  // Pass `module` so the backend stores the file under
  // b2b-app/<tenantId>/<module>/ on Cloudinary instead of /general/.
  // Defaults to 'general' if not provided.
  uploadImage: async (file: File, module: UploadModule = 'general'): Promise<string> => {
    const { data } = await api.post(`/upload/image?module=${encodeURIComponent(module)}`, (() => {
      const formData = new FormData();
      formData.append('image', file);
      return formData;
    })(), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.imageUrl;
  },
  uploadVideo: async (file: File, module: UploadModule = 'general'): Promise<string> => {
    const { data } = await api.post(`/upload/video?module=${encodeURIComponent(module)}`, (() => {
      const formData = new FormData();
      formData.append('video', file);
      return formData;
    })(), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.videoUrl;
  },
};

// ── Notifications API ────────────────────────────────────────

const mapNotification = (n: any): Notification => ({
  id: n._id,
  tenantId: n.tenantId,
  recipientId: n.recipientId,
  type: n.type,
  title: n.title,
  message: n.message,
  data: n.data || {},
  isRead: n.isRead,
  createdAt: n.createdAt,
  updatedAt: n.updatedAt,
});

export const notificationsApi = {
  getAll: async (page = 1, limit = 20, unreadOnly = false): Promise<{ notifications: Notification[]; pagination: NotificationPagination }> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (unreadOnly) params.set('unreadOnly', 'true');
    const { data } = await api.get(`/notifications?${params}`);
    return {
      notifications: Array.isArray(data.data) ? data.data.map(mapNotification) : [],
      pagination: data.pagination,
    };
  },
  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get('/notifications/unread-count');
    return data.data.count;
  },
  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },
};

// ── Super Admin API ──────────────────────────────────────────

export type SuperAdminTenant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessType: string;
  isActive: boolean;
  userCount: number;
  createdAt: string;
};

export type SuperAdminTenantDetail = SuperAdminTenant & {
  address: string;
  logo: string;
  categoryCount: number;
  productCount: number;
  customerCount: number;
  orderCount: number;
  updatedAt: string;
};

export type SuperAdminTenantUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export type SuperAdminDashboard = {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalUsers: number;
};

export type SACategory = {
  id: string; name: string; description: string; imageUrl: string; isActive: boolean; createdAt: string;
};

export type SAProduct = {
  id: string; name: string; productCode: string; brand: string; categoryName: string;
  unit: string; imageUrl: string; isActive: boolean; variantCount: number; totalStock: number; createdAt: string;
};

export type SAProductDetail = {
  product: {
    id: string; name: string; productCode: string; description: string; brand: string;
    costPrice: number; categoryName: string; unit: string; imageUrls: string[];
    isActive: boolean; variantAttributes: { name: string; values: string[] }[]; createdAt: string;
  };
  variants: {
    id: string; sku: string; price: number; costPrice: number; taxPercentage: number;
    finalPrice: number; stockQty: number; unit: string; weight: number;
    dimensions: string; attributes: Record<string, string>; isActive: boolean;
  }[];
};

export type SACustomer = {
  id: string; name: string; mobile: string; email: string; shopName: string;
  gstNumber: string; outstandingAmount: number; isActive: boolean; createdAt: string;
};

export type SAOrder = {
  id: string; orderNumber: string; customerName: string; customerMobile: string;
  orderDate: string; totalAmount: number; paidAmount: number;
  paymentStatus: string; orderStatus: string; createdAt: string;
};

export type SAOrderDetail = {
  order: {
    id: string; orderNumber: string;
    customer: { id: string; name: string; mobile: string; email: string; shopName: string } | null;
    orderDate: string; totalAmount: number; paidAmount: number;
    paymentStatus: string; orderStatus: string;
    notes: string; deliveryNotes: string;
    approvedAt?: string; dispatchedAt?: string; deliveredAt?: string; createdAt: string;
  };
  items: {
    id: string; productName: string; productCode: string; brand: string;
    sku: string; quantity: number; unit: string; pricePerUnit: number; totalPrice: number;
  }[];
};

export const superAdminApi = {
  getDashboard: () => get<SuperAdminDashboard>('/super-admin/dashboard'),
  getTenants: async (params?: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    const { data: res } = await api.get(`/super-admin/tenants?${qs}`);
    return { tenants: res.data as SuperAdminTenant[], pagination: res.pagination };
  },
  getTenantDetail: (id: string) => get<SuperAdminTenantDetail>(`/super-admin/tenants/${id}`),
  toggleTenantActive: (id: string) => patch<{ id: string; name: string; isActive: boolean }>(`/super-admin/tenants/${id}/toggle-active`),
  getTenantUsers: (id: string) => get<SuperAdminTenantUser[]>(`/super-admin/tenants/${id}/users`),
  getTenantCategories: (id: string) => get<SACategory[]>(`/super-admin/tenants/${id}/categories`),
  getTenantProducts: (id: string) => get<SAProduct[]>(`/super-admin/tenants/${id}/products`),
  getTenantProductDetail: (tenantId: string, productId: string) => get<SAProductDetail>(`/super-admin/tenants/${tenantId}/products/${productId}`),
  getTenantCustomers: (id: string) => get<SACustomer[]>(`/super-admin/tenants/${id}/customers`),
  getTenantOrders: (id: string) => get<SAOrder[]>(`/super-admin/tenants/${id}/orders`),
  getTenantOrderDetail: (tenantId: string, orderId: string) => get<SAOrderDetail>(`/super-admin/tenants/${tenantId}/orders/${orderId}`),
  getActivityLogs: async (params: { page?: number; tenantId?: string; module?: string; action?: string; userRole?: string; search?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) query.set(k, String(v)); });
    const { data: res } = await api.get(`/super-admin/activity-logs?${query}`);
    return {
      logs: (res.data?.logs || res.logs || res.data || []).map((l: any) => ({
        id: l._id,
        tenantId: l.tenantId?._id || l.tenantId,
        tenantName: l.tenantId?.name || 'N/A',
        userId: l.userId,
        userName: l.userName,
        userRole: l.userRole,
        action: l.action,
        operation: l.operation || `${l.action}_${l.module}`,
        logType: l.logType || 'info',
        module: l.module,
        description: l.description,
        targetId: l.targetId,
        targetName: l.targetName,
        metadata: l.metadata,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
      })),
      pagination: res.data?.pagination || res.pagination || { page: 1, limit: 20, total: 0, pages: 1 },
    };
  },
};

// ── Feedback API ─────────────────────────────────────────

const mapFeedback = (f: any): Feedback => ({
  id: f._id || f.id,
  tenantId: f.tenantId,
  userId: typeof f.userId === 'object' ? f.userId._id : f.userId,
  userName: typeof f.userId === 'object' ? `${f.userId.firstName || ''} ${f.userId.lastName || ''}`.trim() : f.userName,
  type: f.type,
  orderId: typeof f.orderId === 'object' ? f.orderId._id : f.orderId,
  orderNumber: typeof f.orderId === 'object' ? f.orderId.orderNumber : f.orderNumber,
  productId: typeof f.productId === 'object' ? f.productId._id : f.productId,
  productName: typeof f.productId === 'object' ? f.productId.name : f.productName,
  rating: f.rating,
  comment: f.comment,
  adminReply: f.adminReply,
  adminRepliedAt: f.adminRepliedAt,
  isActive: f.isActive ?? true,
  createdAt: f.createdAt,
  updatedAt: f.updatedAt,
});

export const feedbackApi = {
  getAll: async (type?: FeedbackType, page = 1): Promise<{ feedback: Feedback[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    const params = new URLSearchParams({ page: String(page) });
    if (type) params.set('type', type);
    const { data: res } = await api.get(`/feedback/all?${params}`);
    const list = Array.isArray(res.data) ? res.data.map(mapFeedback) : [];
    return { feedback: list, pagination: res.pagination || { page, limit: 20, total: list.length, pages: 1 } };
  },
  getMy: async (): Promise<Feedback[]> => {
    const { data: res } = await api.get('/feedback/my');
    const list = res?.data?.feedbacks || res?.data || [];
    return Array.isArray(list) ? list.map(mapFeedback) : [];
  },
  getByOrder: async (orderId: string): Promise<Feedback[]> => {
    const res = await get<any[]>(`/feedback/order/${orderId}`);
    if (!res || !Array.isArray(res)) return [];
    return res.map(mapFeedback);
  },
  getByProduct: async (productId: string): Promise<Feedback[]> => {
    const res = await get<any[]>(`/feedback/product/${productId}`);
    if (!res || !Array.isArray(res)) return [];
    return res.map(mapFeedback);
  },
  adminReply: async (id: string, reply: string): Promise<Feedback> => {
    return mapFeedback(await put<any>(`/feedback/${id}/reply`, { adminReply: reply }));
  },
  create: async (data: { type: FeedbackType; orderId?: string; productId?: string; rating: number; comment?: string }): Promise<Feedback> => {
    return mapFeedback(await post<any>('/feedback', data));
  },
  delete: async (id: string) => del<any>(`/feedback/${id}`),
};

// ── Banners API ──────────────────────────────────────────────

export const bannersApi = {
  getAll: async (): Promise<Banner[]> => {
    const res = await get<any>('/banners');
    const list = Array.isArray(res) ? res : (res?.banners ?? []);
    return list.map((b: any) => ({ id: b._id, ...b }));
  },
  create: async (data: Partial<Banner>) => post<any>('/banners', data),
  update: async (id: string, data: Partial<Banner>) => put<any>(`/banners/${id}`, data),
  delete: async (id: string) => del<any>(`/banners/${id}`),
};

// ── Roles & Permissions API ──────────────────────────────────

const mapRole = (r: any) => ({
  id: r._id || r.id,
  name: r.name,
  slug: r.slug,
  description: r.description || '',
  isSystemRole: !!r.isSystemRole,
  isDefault: !!r.isDefault,
  isDynamic: !!r.isDynamic,
  active: r.active !== false,
  scope: r.scope,
  tenantId: r.tenantId || null,
  permissions: Array.isArray(r.permissions) ? r.permissions : [],
  isActive: r.isActive !== false,
  userCount: typeof r.userCount === 'number' ? r.userCount : 0,
  createdBy: r.createdBy && typeof r.createdBy === 'object'
    ? { id: r.createdBy._id || r.createdBy.id, firstName: r.createdBy.firstName, lastName: r.createdBy.lastName, email: r.createdBy.email }
    : r.createdBy || null,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

export const rolesApi = {
  getCatalog: async (roleSlug?: string) => {
    const q = roleSlug ? `?role=${encodeURIComponent(roleSlug)}` : '';
    return await get<{ catalog: any; allPermissions: string[] }>(`/roles/catalog${q}`);
  },
  getAll: async () => {
    const res = await get<{ roles: any[] }>('/roles');
    return (res.roles || []).map(mapRole);
  },
  getById: async (id: string) => {
    const res = await get<{ role: any }>(`/roles/${id}`);
    return mapRole(res.role);
  },
  create: async (data: { name: string; description?: string; permissions: string[]; scope?: 'platform' | 'tenant' }) => {
    const res = await post<{ role: any }>('/roles', data);
    return mapRole(res.role);
  },
  update: async (id: string, data: Partial<{ name: string; description: string; permissions: string[]; isActive: boolean }>) => {
    const res = await put<{ role: any }>(`/roles/${id}`, data);
    return mapRole(res.role);
  },
  delete: async (id: string) => del<any>(`/roles/${id}`),
  /** Owner toggles a dynamic role on/off for their tenant. Returns updated enabledRoles. */
  setActivation: async (id: string, active: boolean) => {
    const res = await patch<{ slug: string; active: boolean; enabledRoles: string[] }>(`/roles/${id}/activation`, { active });
    return res;
  },
};

// ── Modules (DB-backed, super-admin managed) ─────────────────────
export type ModuleType = 'customer' | 'owner' | 'both';
export type ModuleItem = { key: string; label: string; type: ModuleType; order: number; underDevelopment: boolean };

export const modulesApi = {
  get: async () => {
    const res = await get<{ modules: ModuleItem[]; underDevelopment: string[] }>('/modules', { ttl: 0 });
    return { modules: res?.modules || [], underDevelopment: res?.underDevelopment || [] };
  },
  update: async (key: string, data: Partial<{ type: ModuleType; underDevelopment: boolean; label: string; order: number; isActive: boolean }>) =>
    put<{ key: string; label: string; type: ModuleType; order: number; underDevelopment: boolean }>(`/modules/${key}`, data),
};

// ── Cart API (place order for customers) ─────────────────────

export const cartApi = {
  placeOrder: async (data: { items: { variantId?: string; productId?: string; quantity: number }[]; notes?: string }) => {
    const res = await post<any>('/orders/place', data);
    return mapOrder(res);
  },
  placeMultiOrder: async (data: { items: { variantId?: string; productId?: string; quantity: number; tenantId: string }[]; notes?: string }) => {
    const res = await post<any>('/orders/place-multi', data);
    return res.orders || [];
  },
};

// ── Email Templates API (super-admin) ─────────────────────────

export type EmailTemplate = {
  _id?: string;
  key: string;
  name: string;
  description?: string;
  subject: string;
  heading?: string;
  bodyTop?: string;
  highlightKey?: string;
  bodyBottom?: string;
  footerText?: string;
  brandColor?: string;
  logoUrl?: string;
  placeholders?: string[];
  isActive?: boolean;
};

export type EmailVariable = { _id?: string; key: string; value: string; description?: string };

export const emailTemplatesApi = {
  getAll: () => get<EmailTemplate[]>('/super-admin/email-templates', { force: true }),
  getOne: (key: string) => get<EmailTemplate>(`/super-admin/email-templates/${key}`, { force: true }),
  create: (data: Partial<EmailTemplate>) => post<EmailTemplate>('/super-admin/email-templates', data),
  update: (key: string, data: Partial<EmailTemplate>) =>
    put<EmailTemplate>(`/super-admin/email-templates/${key}`, data),
  remove: (key: string) => del<{ message: string }>(`/super-admin/email-templates/${key}`),
  reset: (key: string) => post<EmailTemplate>(`/super-admin/email-templates/reset/${key}`),
  preview: (template: Partial<EmailTemplate>) =>
    post<{ subject: string; html: string }>('/super-admin/email-templates/preview', template),
  // Global custom variables
  getVariables: () => get<EmailVariable[]>('/super-admin/email-templates/variables', { force: true }),
  saveVariable: (data: { key: string; value: string; description?: string }) =>
    post<EmailVariable>('/super-admin/email-templates/variables', data),
  deleteVariable: (key: string) => del<{ message: string }>(`/super-admin/email-templates/variables/${key}`),
};

export { extractError };
export default api;
