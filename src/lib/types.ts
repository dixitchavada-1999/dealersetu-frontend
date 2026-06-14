export type VariantAttribute = { name: string; values: string[] };

export type Category = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  variantAttributes?: VariantAttribute[];
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  productCode?: string;
  description?: string;
  brand?: string;
  costPrice?: number;
  taxPercentage?: number;
  unit?: string;
  imageUrl?: string;
  imageUrls?: string[];
  variantAttributes?: VariantAttribute[];
  discount?: number;
  effectiveDiscount?: number;
  hasVariants?: boolean;
  price?: number;
  stockQty?: number;
  sku?: string;
  finalPrice?: number;
  discountedPrice?: number;
  averageRating?: number;
  reviewCount?: number;
  isActive?: boolean;
  tenantId?: string;
  tenantName?: string;
  tenantLogo?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Present only on the "My Products" (purchased) endpoint. */
  purchaseInfo?: PurchaseInfo;
};

export type VariantPurchase = {
  variantId: string;
  totalQuantity: number;
  orderCount: number;
  lastPurchasedAt?: string;
};

export type PurchaseInfo = {
  lastPurchasedAt?: string;
  totalQuantity: number;
  orderCount: number;
  /** Exact variants the customer purchased (empty for non-variant products). */
  variants?: VariantPurchase[];
};

export type ProductVariant = {
  id: string;
  tenantId: string;
  productId: string;
  sku: string;
  price: number;
  costPrice?: number;
  taxPercentage: number;
  finalPrice: number;
  discountedPrice?: number;
  effectiveDiscount?: number;
  customerDiscount?: number;
  stockQty: number;
  unit: string;
  weight?: number;
  dimensions?: string;
  attributes?: Record<string, any>;
  images?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderStatus = 'Placed' | 'Approved' | 'Dispatched' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Partial' | 'Paid';

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  orderDate: string;
  subtotal?: number;
  courierCharge?: number;
  additionalDiscount?: number;
  additionalCharge?: number;
  additionalChargeNote?: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  deliveryNotes?: string;
  approvedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderItem = {
  id: string;
  variantId: string;
  variantSku: string;
  productName: string;
  productCode?: string;
  brand?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
};

export type OrderDetail = {
  order: Order;
  items: OrderItem[];
};

export type DashboardStats = {
  role?: string;
  customer?: {
    name: string;
    phone?: string;
    email?: string;
  } | null;
  counts: {
    categories?: number;
    products?: number;
    variants?: number;
    customers?: number;
    orders: number;
  };
  revenue: {
    total: number;
    paid: number;
    outstanding: number;
  };
  inventory?: {
    totalStockValue: number;
    lowStockItems: number;
  };
  ordersByStatus: Record<string, number>;
  ordersByPayment: Record<string, number>;
  recentOrders?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    paidAmount: number;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
  }[];
};

export type DispatchPermissions = {
  dashboard: boolean;
  categories: boolean;
  products: boolean;
  orders: boolean;
};

export type ProductionPermissions = {
  dashboard: boolean;
  categories: boolean;
  products: boolean;
  orders: boolean;
};

export type MarketingPermissions = {
  dashboard: boolean;
  categories: boolean;
  products: boolean;
  orders: boolean;
  customers: boolean;
};

export type NotificationPreferences = {
  order_placed: boolean;
  order_approved: boolean;
  order_dispatched: boolean;
  order_delivered: boolean;
  order_cancelled: boolean;
  payment_received: boolean;
  payment_pending: boolean;
  new_product: boolean;
  new_customer: boolean;
  low_stock: boolean;
};

export type BankDetails = {
  accountNumber?: string;
  ifscCode?: string;
};

export type Tenant = {
  id: string;
  name: string;
  businessType?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo?: string;
  dispatchPermissions?: DispatchPermissions;
  productionPermissions?: ProductionPermissions;
  marketingPermissions?: MarketingPermissions;
  /** Slugs of dynamic roles the owner activated — drives sidebar module gating. */
  enabledRoles?: string[];
  lowStockThreshold?: number;
  commonDiscount?: number;
  defaultRestockQuantity?: number;
  bannerRotateInterval?: number;
  themeRotateInterval?: number;
  exploreGridCols?: number;
  exploreGridGap?: number;
  exploreImageHeight?: number;
  exploreShowTitle?: boolean;
  notificationsEnabled?: boolean;
  notificationPreferences?: NotificationPreferences;
  gstNumber?: string;
  udyamNumber?: string;
  aadharNumber?: string;
  panNumber?: string;
  bankDetails?: BankDetails;
};

export type RoleScope = 'platform' | 'tenant';

export type Role = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystemRole: boolean;
  /** Standard catalog role (not deletable). */
  isDefault?: boolean;
  /** Global activatable role (super-admin catalog). */
  isDynamic?: boolean;
  /** For the owner view: is this dynamic role switched ON for the tenant? */
  active?: boolean;
  scope: RoleScope;
  tenantId?: string | null;
  permissions: string[];
  isActive: boolean;
  userCount?: number;
  createdBy?: { id?: string; firstName?: string; lastName?: string; email?: string } | string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PermissionActionMap = Record<string, string>;

export type PermissionModule = {
  label: string;
  scope: RoleScope;
  actions: PermissionActionMap;
};

export type PermissionCatalog = Record<string, PermissionModule>;

export type CatalogResponse = {
  catalog: PermissionCatalog;
  allPermissions: string[];
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  mobileNumber: string;
  /** Legacy uppercase role string: SUPER_ADMIN | OWNER | CUSTOMER | CUSTOM | ADMIN | USER */
  roleId: string;
  /** Actual Role document _id (from backend transformUserResponse.roleRef) */
  roleRef?: string | null;
  /** Slug of the user's assigned Role doc: 'super-admin' | 'owner' | 'customer' | <custom-slug> */
  roleSlug?: string | null;
  /** Flat effective-permission strings — extracted from JWT at login time */
  permissions?: string[];
  /** Tenant's permissionVersion at the time this user's token was issued */
  permissionVersion?: number;
  tenantId: string;
  loginCode?: string;
  isAdmin: boolean;
  /** Explicit customer flag from backend — don't infer by elimination. */
  isCustomer?: boolean;
  isDispatch: boolean;
  isProduction: boolean;
  isMarketing: boolean;
  isSuperAdmin: boolean;
  tenant?: Tenant;
  createdAt?: string;
  updatedAt?: string;
};

export type UserMember = {
  id: string;
  name?: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobileNumber: string;
  shopName?: string;
  gstNumber?: string;
  discount?: number;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  loginCode: string;
  isDeviceLocked: boolean;
  deviceId: string;
  linkedCustomerId?: string | null;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  user: User;
  tokens: AuthTokens;
};

export type CartItem = {
  variantId?: string;
  productId: string;
  productName: string;
  variantSku: string;
  variantAttributes?: Record<string, any>;
  price: number;
  quantity: number;
  unit: string;
  tenantId: string;
  tenantName: string;
};

export type DispatchMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductionMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MarketingMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerBalance = {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  orderCount: number;
};

export type CustomerBalances = CustomerBalance & {
  byCustomer: Record<string, CustomerBalance>;
};

// Notification Types
export type NotificationType =
  | 'order_placed'
  | 'order_approved'
  | 'order_dispatched'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_received'
  | 'payment_pending'
  | 'new_customer'
  | 'new_product'
  | 'low_stock'
  | 'stock_updated'
  | 'feedback_received'
  | 'discount_updated'
  | 'welcome';

export type NotificationData = {
  orderId?: string;
  customerId?: string;
  productVariantId?: string;
  orderNumber?: string;
  amount?: number;
};

export type Notification = {
  id: string;
  tenantId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ActivityLog = {
  id: string;
  tenantId?: string;
  tenantName?: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  operation: string;
  logType: 'info' | 'success' | 'warning' | 'error' | 'critical';
  module: string;
  description: string;
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
};

export type Banner = {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  linkType: 'none' | 'product' | 'category' | 'external';
  linkId?: string;
  linkUrl?: string;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
};

export type FeedbackType = 'order' | 'product' | 'general';

export type Feedback = {
  id: string;
  tenantId: string;
  userId: string;
  userName?: string;
  type: FeedbackType;
  orderId?: string;
  orderNumber?: string;
  productId?: string;
  productName?: string;
  rating: number;
  comment?: string;
  adminReply?: string;
  adminRepliedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
