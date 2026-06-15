import {
  ShoppingCart, Truck, Users, Megaphone, Tag, Building2, BarChart3, Shield, Bell,
  FileText, Smartphone, Store, Factory, Boxes, Package,
} from 'lucide-react';

export const COLORS = {
  bg: '#0f172a',
  primary: '#0F52BA',
  primaryDark: '#0A3D8F',
  secondary: '#00C9A7',
  gradient: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
};

export const features = [
  { icon: Package, title: 'Product Catalog', desc: 'Manage products, variants, categories, and stock with ease.' },
  { icon: ShoppingCart, title: 'Order Management', desc: 'Track orders end-to-end with status, invoices, and payments.' },
  { icon: Truck, title: 'Dispatch', desc: 'Plan dispatches, print labels, and update delivery status.' },
  { icon: Users, title: 'Customer CRM', desc: 'Keep customer profiles, history, and personalised pricing.' },
  { icon: Megaphone, title: 'Marketing', desc: 'Visit tracking, lead approval, and auto-onboard customers.' },
  { icon: Tag, title: 'Discounts', desc: 'Common, product-specific, and customer-specific discounts.' },
  { icon: Building2, title: 'Multi-Tenant', desc: 'One platform, many businesses — seamless tenant switching.' },
  { icon: BarChart3, title: 'Activity Logs', desc: 'Audit every change with old/new values and operation codes.' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Admin, Dispatch, Production, Marketing — fine-grained control.' },
  { icon: Bell, title: 'Notifications', desc: 'Real-time alerts on orders, approvals, and activity.' },
  { icon: FileText, title: 'Promotions & Banners', desc: 'Show offers on customer dashboards with grid layouts.' },
  { icon: Smartphone, title: 'Mobile App', desc: 'Native Android & iOS app for on-the-go management.' },
];

export const steps = [
  { n: 1, title: 'Sign up & setup', desc: 'Create your tenant, invite your team, and add your business details.' },
  { n: 2, title: 'Add products', desc: 'Upload catalog with variants, categories, prices, and stock.' },
  { n: 3, title: 'Onboard customers', desc: 'Add customers or let marketing team onboard them via visits.' },
  { n: 4, title: 'Start selling', desc: 'Receive orders, dispatch, and grow — on web and mobile.' },
];

export const useCases = [
  { icon: Store, title: 'Wholesalers', desc: 'Sell to retailers with tier-based pricing and bulk orders.' },
  { icon: Factory, title: 'Manufacturers', desc: 'Manage production, dispatch, and downstream distribution.' },
  { icon: Truck, title: 'Distributors', desc: 'Handle multiple brands, routes, and customer territories.' },
  { icon: Boxes, title: 'B2B Retailers', desc: 'Offer digital catalogs to business customers with login.' },
];

export const plans = [
  { name: 'Starter', price: '₹0', period: '/forever', desc: 'Perfect for trying it out.', features: ['Up to 50 products', '1 team member', '100 orders/month', 'Email support'], cta: 'Start Free', highlighted: false },
  { name: 'Pro', price: '₹1,499', period: '/month', desc: 'For growing businesses.', features: ['Unlimited products', '10 team members', 'Unlimited orders', 'Mobile app', 'Marketing module', 'Priority support'], cta: 'Start Trial', highlighted: true },
  { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large organizations.', features: ['Everything in Pro', 'Unlimited team', 'Multi-tenant switching', 'Custom integrations', 'Dedicated manager', 'SLA 99.9%'], cta: 'Contact Sales', highlighted: false },
];

export const testimonials = [
  { quote: 'DealerSetu transformed how we handle B2B orders. Our dispatch team is now 3× faster.', name: 'Rahul Shah', role: 'CEO, Shah Wholesale' },
  { quote: 'The multi-tenant feature is gold — we manage 4 brands from a single login now.', name: 'Priya Patel', role: 'Founder, Patel Distributors' },
  { quote: 'Best part? Our sales team uses the mobile app to onboard customers during visits.', name: 'Amit Desai', role: 'Sales Head, Desai Industries' },
];

export const faqs = [
  { q: 'Is there a free trial?', a: 'Yes — 14 days free, no credit card required.' },
  { q: 'Can I import my existing products?', a: 'Absolutely. CSV import is supported and we also help you migrate.' },
  { q: 'Does it work on mobile?', a: 'Yes, native Android and iOS apps are available (coming soon on stores).' },
  { q: 'How does multi-tenant work?', a: 'One account can manage multiple tenants (businesses) with seamless switching.' },
  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time, no lock-in.' },
  { q: 'Is my data secure?', a: 'We use industry-standard encryption, role-based access, and daily backups.' },
];

export const stats = [
  { value: '500+', label: 'Businesses' },
  { value: '2M+', label: 'Orders processed' },
  { value: '50K+', label: 'Products managed' },
  { value: '99.9%', label: 'Uptime' },
];

export const modules = [
  { title: 'Dashboard', desc: 'Real-time business overview — revenue, orders, collection rate, fulfillment, and inventory health at a glance.', image: '/dashboard-preview.png', icon: BarChart3 },
  { title: 'Product Catalog', desc: 'Manage products with variants (ram, color, storage, size), pricing, discounts, ratings, and stock tracking.', image: '/product-detail.png', icon: Package },
  { title: 'Orders Management', desc: 'Track all orders with status filters (Placed, Approved, Dispatched, Delivered, Cancelled), search, and quick actions.', image: '/orders-list.png', icon: ShoppingCart },
  { title: 'Order Details & Timeline', desc: 'Complete order view with payment status, customer info, delivery timeline, and itemized breakdown.', image: '/order-detail.png', icon: Truck },
  { title: 'Promotions & Banners', desc: 'Create promotional banners with images, videos, and product links — display on customer dashboards.', image: '/promotions.png', icon: Megaphone },
  { title: 'Business Settings', desc: 'Configure business info, team permissions, notifications, and customer explore feed from one place.', image: '/settings.png', icon: Building2 },
];

export const navLinks = [
  { label: 'Home', href: '#home', key: 'home' },
  { label: 'Modules', href: '#modules', key: 'modules' },
  { label: 'Features', href: '#features', key: 'features' },
  { label: 'How it works', href: '#how', key: 'how' },
  { label: 'Pricing', href: '#pricing', key: 'pricing' },
  { label: 'FAQ', href: '#faq', key: 'faq' },
];

/** Reusable section eyebrow pill (teal or blue accent). */
export const PILL_TEAL = { backgroundColor: 'rgba(0, 201, 167, 0.08)', borderColor: 'rgba(0, 201, 167, 0.2)', color: '#00C9A7' };
export const PILL_BLUE = { backgroundColor: 'rgba(15, 82, 186, 0.08)', borderColor: 'rgba(15, 82, 186, 0.2)', color: '#0F52BA' };
export const GRADIENT_TEXT = { background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } as const;
