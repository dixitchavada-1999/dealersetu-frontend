import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, ShoppingBag, ArrowRight, Play, ShoppingCart, Truck, Users, Megaphone, Tag,
  Building2, BarChart3, Shield, Bell, FileText, Smartphone, Store, Factory, Boxes,
  Check, ChevronDown, Apple, Twitter, Linkedin, Facebook, Instagram, Sparkles,
  Package, Star,
} from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import ScrollToTop from '../components/ScrollToTop';

// Palette
const COLORS = {
  bg: '#0f172a', // slate-900 (matches project dashboard)
  primary: '#0F52BA',
  primaryDark: '#0A3D8F',
  secondary: '#00C9A7',
  gradient: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
};

const features = [
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

const steps = [
  { n: 1, title: 'Sign up & setup', desc: 'Create your tenant, invite your team, and add your business details.' },
  { n: 2, title: 'Add products', desc: 'Upload catalog with variants, categories, prices, and stock.' },
  { n: 3, title: 'Onboard customers', desc: 'Add customers or let marketing team onboard them via visits.' },
  { n: 4, title: 'Start selling', desc: 'Receive orders, dispatch, and grow — on web and mobile.' },
];

const useCases = [
  { icon: Store, title: 'Wholesalers', desc: 'Sell to retailers with tier-based pricing and bulk orders.' },
  { icon: Factory, title: 'Manufacturers', desc: 'Manage production, dispatch, and downstream distribution.' },
  { icon: Truck, title: 'Distributors', desc: 'Handle multiple brands, routes, and customer territories.' },
  { icon: Boxes, title: 'B2B Retailers', desc: 'Offer digital catalogs to business customers with login.' },
];

const plans = [
  {
    name: 'Starter', price: '₹0', period: '/forever',
    desc: 'Perfect for trying it out.',
    features: ['Up to 50 products', '1 team member', '100 orders/month', 'Email support'],
    cta: 'Start Free', highlighted: false,
  },
  {
    name: 'Pro', price: '₹1,499', period: '/month',
    desc: 'For growing businesses.',
    features: ['Unlimited products', '10 team members', 'Unlimited orders', 'Mobile app', 'Marketing module', 'Priority support'],
    cta: 'Start Trial', highlighted: true,
  },
  {
    name: 'Enterprise', price: 'Custom', period: '',
    desc: 'For large organizations.',
    features: ['Everything in Pro', 'Unlimited team', 'Multi-tenant switching', 'Custom integrations', 'Dedicated manager', 'SLA 99.9%'],
    cta: 'Contact Sales', highlighted: false,
  },
];

const testimonials = [
  { quote: 'DealerSetu transformed how we handle B2B orders. Our dispatch team is now 3× faster.', name: 'Rahul Shah', role: 'CEO, Shah Wholesale' },
  { quote: 'The multi-tenant feature is gold — we manage 4 brands from a single login now.', name: 'Priya Patel', role: 'Founder, Patel Distributors' },
  { quote: 'Best part? Our sales team uses the mobile app to onboard customers during visits.', name: 'Amit Desai', role: 'Sales Head, Desai Industries' },
];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes — 14 days free, no credit card required.' },
  { q: 'Can I import my existing products?', a: 'Absolutely. CSV import is supported and we also help you migrate.' },
  { q: 'Does it work on mobile?', a: 'Yes, native Android and iOS apps are available (coming soon on stores).' },
  { q: 'How does multi-tenant work?', a: 'One account can manage multiple tenants (businesses) with seamless switching.' },
  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time, no lock-in.' },
  { q: 'Is my data secure?', a: 'We use industry-standard encryption, role-based access, and daily backups.' },
];

const stats = [
  { value: '500+', label: 'Businesses' },
  { value: '2M+', label: 'Orders processed' },
  { value: '50K+', label: 'Products managed' },
  { value: '99.9%', label: 'Uptime' },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [activeNav, setActiveNav] = useState('home');
  const [activeModule, setActiveModule] = useState<number>(0);
  const [isModulesHovered, setIsModulesHovered] = useState(false);

  const modules = [
    {
      title: 'Dashboard',
      desc: 'Real-time business overview — revenue, orders, collection rate, fulfillment, and inventory health at a glance.',
      image: '/dashboard-preview.png',
      icon: BarChart3,
    },
    {
      title: 'Product Catalog',
      desc: 'Manage products with variants (ram, color, storage, size), pricing, discounts, ratings, and stock tracking.',
      image: '/product-detail.png',
      icon: Package,
    },
    {
      title: 'Orders Management',
      desc: 'Track all orders with status filters (Placed, Approved, Dispatched, Delivered, Cancelled), search, and quick actions.',
      image: '/orders-list.png',
      icon: ShoppingCart,
    },
    {
      title: 'Order Details & Timeline',
      desc: 'Complete order view with payment status, customer info, delivery timeline, and itemized breakdown.',
      image: '/order-detail.png',
      icon: Truck,
    },
    {
      title: 'Promotions & Banners',
      desc: 'Create promotional banners with images, videos, and product links — display on customer dashboards.',
      image: '/promotions.png',
      icon: Megaphone,
    },
    {
      title: 'Business Settings',
      desc: 'Configure business info, team permissions, notifications, and customer explore feed from one place.',
      image: '/settings.png',
      icon: Building2,
    },
  ];

  const navLinks = [
    { label: 'Home', href: '#home', key: 'home' },
    { label: 'Modules', href: '#modules', key: 'modules' },
    { label: 'Features', href: '#features', key: 'features' },
    { label: 'How it works', href: '#how', key: 'how' },
    { label: 'Pricing', href: '#pricing', key: 'pricing' },
    { label: 'FAQ', href: '#faq', key: 'faq' },
  ];

  // Auto-rotate modules every 4 seconds (pause on hover)
  useEffect(() => {
    if (isModulesHovered) return;
    const interval = setInterval(() => {
      setActiveModule(prev => (prev + 1) % modules.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isModulesHovered, modules.length]);

  return (
    <div
      className="landing-scope min-h-screen text-white scroll-smooth overflow-x-hidden relative"
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* Animated particle canvas */}
      <ParticleBackground />

      {/* Floating gradient orbs */}
      <div className="landing-orbs">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
      </div>

      {/* All content must sit above canvas + orbs */}
      <div className="relative" style={{ zIndex: 1 }}>

      {/* Navbar */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5"
        style={{ backgroundColor: 'rgba(11, 17, 32, 0.92)' }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-2xl text-white">
            <span
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
                boxShadow: '0 8px 24px rgba(0, 201, 167, 0.3)',
              }}
            >
              <ShoppingBag size={22} className="text-white" />
            </span>
            <span>
              Dealer<span style={{ background: 'linear-gradient(135deg, #0F52BA, #00C9A7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Setu</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setActiveNav(l.key)}
                className="relative text-sm font-medium transition py-2"
                style={{ color: activeNav === l.key ? '#00C9A7' : '#cbd5e1' }}
              >
                {l.label}
                {activeNav === l.key && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #0F52BA, #00C9A7)' }}
                  />
                )}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium transition hover:text-white" style={{ color: '#cbd5e1' }}>
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm text-white px-6 py-3 rounded-full font-medium transition hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Get in Touch
            </Link>
          </div>

          <button className="lg:hidden text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="menu">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {menuOpen && (
          <div
            className="lg:hidden border-t border-white/5 px-4 py-4 space-y-3"
            style={{ backgroundColor: 'rgba(11, 17, 32, 0.98)' }}
          >
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block" style={{ color: '#cbd5e1' }}>
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-3 border-t border-white/5">
              <Link to="/login" className="flex-1 text-center py-2 border border-white/20 rounded-full text-white">Sign in</Link>
              <Link
                to="/register"
                className="flex-1 text-center py-2 rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)' }}
              >
                Get in Touch
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-8 lg:pb-12">
          <div className="text-center max-w-4xl mx-auto">
            <span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8 border"
              style={{
                backgroundColor: 'rgba(0, 201, 167, 0.08)',
                borderColor: 'rgba(0, 201, 167, 0.2)',
                color: '#00C9A7',
              }}
            >
              <Sparkles size={14} />
              Transforming B2B Into Digital Reality
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              We Power{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                B2B Commerce
              </span>
              <br />
              That Drives Your Business
            </h1>

            <p className="mt-8 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
              DealerSetu delivers a complete multi-tenant commerce platform with
              product management, order tracking, dispatch, and marketing tools
              to help B2B businesses thrive in the modern world.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 text-white px-8 py-4 rounded-full font-medium transition shadow-lg"
                style={{
                  background: '#0F52BA',
                  boxShadow: '0 10px 30px rgba(15, 82, 186, 0.4)',
                }}
              >
                Start a Project
                <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-3 text-white px-8 py-4 rounded-full font-medium border transition hover:border-white/30"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <span className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                  <Play size={12} className="text-white ml-0.5" fill="currentColor" />
                </span>
                Learn More
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label}>
                <div
                  className="text-4xl lg:text-5xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {s.value}
                </div>
                <div className="mt-2 text-sm" style={{ color: '#94a3b8' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Module Showcase — Auto-rotating */}
          <div
            id="modules"
            className="mt-12 relative max-w-6xl mx-auto"
          >
            {/* Module selector pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {modules.map((m, i) => {
                const isActive = activeModule === i;
                return (
                  <button
                    key={m.title}
                    onClick={() => setActiveModule(i)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)'
                        : 'rgba(255,255,255,0.04)',
                      borderColor: isActive ? 'transparent' : 'rgba(255,255,255,0.1)',
                      color: isActive ? '#fff' : '#cbd5e1',
                      boxShadow: isActive ? '0 8px 20px rgba(0, 201, 167, 0.25)' : 'none',
                    }}
                  >
                    <m.icon size={16} />
                    {m.title}
                  </button>
                );
              })}
            </div>

            {/* Active module title + description (above screenshot) */}
            <div
              key={`text-${activeModule}`}
              className="text-center max-w-2xl mx-auto mb-6"
              style={{ animation: 'fadeIn 0.4s ease', minHeight: '90px' }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {modules[activeModule].title}
              </h3>
              <p className="mt-3 text-base leading-relaxed" style={{ color: '#cbd5e1' }}>
                {modules[activeModule].desc}
              </p>
            </div>

            {/* Progress bar */}
            <div
              className="max-w-xs mx-auto mb-8 h-0.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <div
                key={`bar-${activeModule}-${isModulesHovered}`}
                className="h-full"
                style={{
                  background: 'linear-gradient(90deg, #0F52BA, #00C9A7)',
                  animation: isModulesHovered ? 'none' : 'moduleProgress 4s linear',
                  transformOrigin: 'left',
                  width: '100%',
                }}
              />
            </div>

            {/* Screenshot with browser frame */}
            <div
              className="relative"
              onMouseEnter={() => setIsModulesHovered(true)}
              onMouseLeave={() => setIsModulesHovered(false)}
            >
              <div
                className="absolute -inset-px rounded-3xl blur opacity-50"
                style={{ background: 'linear-gradient(135deg, #0F52BA, #00C9A7)' }}
              />
              <div
                className="relative rounded-3xl border backdrop-blur-xl shadow-2xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(15, 28, 48, 0.9)',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <div
                  className="px-5 py-3 flex items-center gap-2 border-b"
                  style={{
                    backgroundColor: 'rgba(15, 28, 48, 0.8)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                  </div>
                  <span className="text-xs ml-3 font-mono" style={{ color: '#94a3b8' }}>
                    app.dealersetu.com
                  </span>
                </div>
                <img
                  key={`img-${activeModule}`}
                  src={modules[activeModule].image}
                  alt={modules[activeModule].title}
                  className="w-full h-auto block"
                  style={{ animation: 'fadeIn 0.4s ease' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features */}
      <section id="features" className="relative py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
              style={{
                backgroundColor: 'rgba(0, 201, 167, 0.08)',
                borderColor: 'rgba(0, 201, 167, 0.2)',
                color: '#00C9A7',
              }}
            >
              Our Services
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Everything you need to{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                run your business
              </span>
            </h2>
            <p className="mt-6 text-lg" style={{ color: '#94a3b8' }}>
              A complete toolkit — no need to stitch together 10 different tools.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className="group relative p-7 rounded-2xl border transition overflow-hidden"
                style={{
                  backgroundColor: 'rgba(15, 28, 48, 0.5)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(135deg, #00C9A7, #0F52BA)' }}
                />
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
                    boxShadow: '0 8px 24px rgba(0, 201, 167, 0.25)',
                  }}
                >
                  <f.icon size={24} className="text-white" />
                </div>
                <h3 className="relative text-lg font-semibold text-white">{f.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="relative py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
              style={{
                backgroundColor: 'rgba(15, 82, 186, 0.08)',
                borderColor: 'rgba(15, 82, 186, 0.2)',
                color: '#0F52BA',
              }}
            >
              Process
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Get started in minutes</h2>
            <p className="mt-6 text-lg" style={{ color: '#94a3b8' }}>Four simple steps to go live.</p>
          </div>

          <div className="mt-10 relative">
            <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 201, 167, 0.3), transparent)' }} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map(s => (
                <div key={s.n} className="relative">
                  <div
                    className="relative w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-lg mb-5 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
                      boxShadow: '0 8px 24px rgba(0, 201, 167, 0.3)',
                    }}
                  >
                    {s.n}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm" style={{ color: '#94a3b8' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="usecases" className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
              style={{
                backgroundColor: 'rgba(0, 201, 167, 0.08)',
                borderColor: 'rgba(0, 201, 167, 0.2)',
                color: '#00C9A7',
              }}
            >
              Who it's for
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Built for B2B businesses</h2>
            <p className="mt-6 text-lg" style={{ color: '#94a3b8' }}>No matter what you sell, DealerSetu adapts.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map(c => (
              <div
                key={c.title}
                className="p-7 rounded-2xl border transition hover:border-teal-400/40"
                style={{
                  backgroundColor: 'rgba(15, 28, 48, 0.5)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 201, 167, 0.15) 0%, rgba(15, 82, 186, 0.15) 100%)',
                    border: '1px solid rgba(0, 201, 167, 0.3)',
                  }}
                >
                  <c.icon size={26} style={{ color: '#00C9A7' }} />
                </div>
                <h3 className="text-lg font-semibold text-white">{c.title}</h3>
                <p className="mt-2 text-sm" style={{ color: '#94a3b8' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
              style={{
                backgroundColor: 'rgba(15, 82, 186, 0.08)',
                borderColor: 'rgba(15, 82, 186, 0.2)',
                color: '#00C9A7',
              }}
            >
              Pricing
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Simple, transparent pricing</h2>
            <p className="mt-6 text-lg" style={{ color: '#94a3b8' }}>Choose a plan that grows with you.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map(p => (
              <div key={p.name} className="relative">
                {p.highlighted && (
                  <div
                    className="absolute -inset-px rounded-3xl blur opacity-60"
                    style={{ background: 'linear-gradient(135deg, #0F52BA, #00C9A7)' }}
                  />
                )}
                <div
                  className="relative p-8 rounded-3xl border h-full"
                  style={{
                    backgroundColor: p.highlighted ? 'rgba(15, 28, 48, 0.95)' : 'rgba(15, 28, 48, 0.5)',
                    borderColor: p.highlighted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {p.highlighted && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-semibold px-4 py-1 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
                        boxShadow: '0 8px 20px rgba(0, 201, 167, 0.4)',
                      }}
                    >
                      ⭐ Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>{p.desc}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span
                      className="text-5xl font-bold"
                      style={
                        p.highlighted
                          ? {
                              background: 'linear-gradient(135deg, #0F52BA, #00C9A7)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }
                          : { color: '#fff' }
                      }
                    >
                      {p.price}
                    </span>
                    <span style={{ color: '#64748b' }}>{p.period}</span>
                  </div>
                  <Link
                    to="/register"
                    className="mt-6 block text-center py-3 rounded-full font-medium transition text-white"
                    style={
                      p.highlighted
                        ? {
                            background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
                            boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3)',
                          }
                        : {
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }
                    }
                  >
                    {p.cta}
                  </Link>
                  <ul className="mt-8 space-y-3">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#cbd5e1' }}>
                        <Check size={16} style={{ color: '#00C9A7' }} className="mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download App */}
      <section className="relative py-8 lg:py-12 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(135deg, #131C31 0%, #0B1120 50%, #131C31 100%)' }}
        />
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(0, 201, 167, 0.2), transparent 60%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
                style={{
                  backgroundColor: 'rgba(0, 201, 167, 0.08)',
                  borderColor: 'rgba(0, 201, 167, 0.2)',
                  color: '#00C9A7',
                }}
              >
                Mobile App
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Take DealerSetu <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  everywhere.
                </span>
              </h2>
              <p className="mt-6 text-lg max-w-lg" style={{ color: '#cbd5e1' }}>
                Manage your business from your phone. Approve orders, check dispatch, and track marketing — all from the app.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <a
                  href="#"
                  className="flex items-center gap-3 text-white px-6 py-3.5 rounded-xl transition shadow-xl"
                  style={{ backgroundColor: '#000' }}
                >
                  <Apple size={28} />
                  <div className="text-left">
                    <div className="text-xs" style={{ color: '#94a3b8' }}>Download on the</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 text-white px-6 py-3.5 rounded-xl transition shadow-xl"
                  style={{ backgroundColor: '#000' }}
                >
                  <Smartphone size={28} />
                  <div className="text-left">
                    <div className="text-xs" style={{ color: '#94a3b8' }}>Get it on</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
              <p className="mt-6 text-sm" style={{ color: '#94a3b8' }}>Coming soon on both stores.</p>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div
                  className="absolute -inset-8 rounded-[3.5rem] blur-2xl"
                  style={{ background: 'rgba(0, 201, 167, 0.2)' }}
                />
                <div className="relative w-64 h-[520px] bg-black rounded-[3rem] p-3 shadow-2xl border-4 border-black">
                  <div
                    className="w-full h-full rounded-[2.3rem] overflow-hidden flex flex-col"
                    style={{ backgroundColor: COLORS.bg }}
                  >
                    <div
                      className="h-14 flex items-center justify-center text-white font-semibold"
                      style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)' }}
                    >
                      DealerSetu
                    </div>
                    <div className="flex-1 p-4 space-y-3 overflow-hidden">
                      {['Orders', 'Products', 'Customers', 'Dispatch', 'Marketing'].map(k => (
                        <div
                          key={k}
                          className="backdrop-blur p-3 rounded-xl border"
                          style={{
                            backgroundColor: 'rgba(0, 201, 167, 0.08)',
                            borderColor: 'rgba(0, 201, 167, 0.2)',
                          }}
                        >
                          <div className="text-xs" style={{ color: '#94a3b8' }}>{k}</div>
                          <div className="font-semibold text-white text-sm">View all →</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
              style={{
                backgroundColor: 'rgba(0, 201, 167, 0.08)',
                borderColor: 'rgba(0, 201, 167, 0.2)',
                color: '#00C9A7',
              }}
            >
              Testimonials
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Loved by businesses</h2>
            <p className="mt-6 text-lg" style={{ color: '#94a3b8' }}>Don't just take our word for it.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div
                key={t.name}
                className="p-8 rounded-2xl border transition hover:border-teal-400/40"
                style={{
                  backgroundColor: 'rgba(15, 28, 48, 0.5)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} style={{ fill: '#00C9A7', color: '#00C9A7' }} />
                  ))}
                </div>
                <p className="leading-relaxed" style={{ color: '#cbd5e1' }}>"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-semibold text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)' }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs" style={{ color: '#94a3b8' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-8 lg:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
              style={{
                backgroundColor: 'rgba(15, 82, 186, 0.08)',
                borderColor: 'rgba(15, 82, 186, 0.2)',
                color: '#00C9A7',
              }}
            >
              FAQ
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Frequently asked questions</h2>
            <p className="mt-6 text-lg" style={{ color: '#94a3b8' }}>Can't find what you're looking for? Contact us.</p>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border transition"
                style={{
                  backgroundColor: openFaq === i ? 'rgba(0, 201, 167, 0.06)' : 'rgba(15, 28, 48, 0.5)',
                  borderColor: openFaq === i ? 'rgba(0, 201, 167, 0.3)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-white">{f.q}</span>
                  <ChevronDown
                    size={20}
                    style={{ color: openFaq === i ? '#00C9A7' : '#94a3b8' }}
                    className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)' }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.2), transparent 60%)' }}
            />

            <div className="relative px-8 py-20 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                Ready to grow your <br /> B2B business?
              </h2>
              <p className="mt-6 text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Join hundreds of businesses already using DealerSetu. Free for 14 days, no credit card.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-full font-semibold transition shadow-xl hover:bg-slate-100"
                  style={{ color: COLORS.bg }}
                >
                  Start Free Trial <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-full font-semibold border backdrop-blur transition"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderColor: 'rgba(255,255,255,0.3)',
                  }}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5" style={{ backgroundColor: '#0B1120' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ color: '#94a3b8' }}>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-3 font-bold text-xl text-white">
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)' }}
                >
                  <ShoppingBag size={20} />
                </span>
                <span>
                  Dealer<span style={{ background: 'linear-gradient(135deg, #0F52BA, #00C9A7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Setu</span>
                </span>
              </Link>
              <p className="mt-4 text-sm max-w-xs">
                The all-in-one B2B commerce platform for wholesalers, distributors, and manufacturers.
              </p>
              <div className="mt-6 flex gap-3">
                {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Mobile App', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Resources', links: ['Docs', 'Help Center', 'API', 'Status'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-semibold text-white text-sm">{col.title}</h4>
                <ul className="mt-4 space-y-2">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm hover:text-white transition">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 DealerSetu. All rights reserved.</p>
            <p className="text-sm">Made with <span style={{ color: '#00C9A7' }}>♥</span> in India</p>
          </div>
        </div>
      </footer>
      </div>
      <ScrollToTop />
    </div>
  );
}
