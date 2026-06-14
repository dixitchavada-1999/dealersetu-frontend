import { useEffect, useState } from 'react';
import { Loader2, Building2, Save, Bell, Shield, ImageIcon } from 'lucide-react';
import { userApi, dispatchApi, productionApi, marketingApi, extractError } from '../lib/api';
import type { DispatchPermissions, ProductionPermissions, MarketingPermissions, NotificationPreferences } from '../lib/types';
import toast from '../lib/toast';

type SectionKey = 'business' | 'permissions' | 'alerts' | 'explore';

const defaultNotifPrefs: NotificationPreferences = {
  order_placed: true,
  order_approved: true,
  order_dispatched: true,
  order_delivered: true,
  order_cancelled: true,
  payment_received: true,
  payment_pending: true,
  new_product: true,
  new_customer: true,
  low_stock: true,
};

const notifLabels: Record<string, string> = {
  order_placed: 'Order Placed',
  order_approved: 'Order Approved',
  order_dispatched: 'Order Dispatched',
  order_delivered: 'Order Delivered',
  order_cancelled: 'Order Cancelled',
  payment_received: 'Payment Received',
  payment_pending: 'Payment Pending',
  new_product: 'New Product',
  new_customer: 'New Customer',
  low_stock: 'Low Stock',
};

const notifGroups: { label: string; keys: (keyof NotificationPreferences)[] }[] = [
  { label: 'Orders', keys: ['order_placed', 'order_approved', 'order_dispatched', 'order_delivered', 'order_cancelled'] },
  { label: 'Payments', keys: ['payment_received', 'payment_pending'] },
  { label: 'Other', keys: ['new_product', 'new_customer', 'low_stock'] },
];

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState<SectionKey | null>('business');

  // Tenant form
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [udyamNumber, setUdyamNumber] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [commonDiscount, setCommonDiscount] = useState(0);
  const [defaultRestockQuantity, setDefaultRestockQuantity] = useState(10);
  const [bannerRotateInterval, setBannerRotateInterval] = useState(5);
  const [exploreGridCols, setExploreGridCols] = useState(3);
  const [exploreGridGap, setExploreGridGap] = useState(1);
  const [exploreImageHeight, setExploreImageHeight] = useState(0);
  const [exploreShowTitle, setExploreShowTitle] = useState(true);

  // Notifications & Alerts
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(defaultNotifPrefs);

  // Permissions
  const [dispatchPerms, setDispatchPerms] = useState<DispatchPermissions>({ dashboard: true, categories: false, products: true, orders: true });
  const [productionPerms, setProductionPerms] = useState<ProductionPermissions>({ dashboard: true, categories: false, products: true, orders: true });
  const [marketingPerms, setMarketingPerms] = useState<MarketingPermissions>({ dashboard: true, categories: false, products: true, orders: true, customers: true });

  const toggleSection = (id: SectionKey) => setOpenSection(prev => prev === id ? null : id);

  useEffect(() => {
    userApi.getTenant()
      .then(t => {
        setName(t.name); setBusinessType(t.businessType || '');
        setPhone(t.phone || ''); setEmail(t.email || '');
        setAddress(t.address || ''); setLogo(t.logo || '');
        setGstNumber(t.gstNumber || ''); setUdyamNumber(t.udyamNumber || '');
        setAadharNumber(t.aadharNumber || ''); setPanNumber(t.panNumber || '');
        setAccountNumber(t.bankDetails?.accountNumber || '');
        setIfscCode(t.bankDetails?.ifscCode || '');
        setCommonDiscount(t.commonDiscount ?? 0);
        setDefaultRestockQuantity(t.defaultRestockQuantity ?? 10);
        setBannerRotateInterval(t.bannerRotateInterval ?? 5);
        setExploreGridCols(t.exploreGridCols ?? 3);
        setExploreGridGap(t.exploreGridGap ?? 1);
        setExploreImageHeight(t.exploreImageHeight ?? 0);
        setExploreShowTitle(t.exploreShowTitle !== false);
        setLowStockThreshold(t.lowStockThreshold ?? 10);
        setNotificationsEnabled(t.notificationsEnabled ?? true);
        if (t.notificationPreferences) setNotifPrefs({ ...defaultNotifPrefs, ...t.notificationPreferences });
        if (t.dispatchPermissions) setDispatchPerms(t.dispatchPermissions);
        if (t.productionPermissions) setProductionPerms(t.productionPermissions);
        if (t.marketingPermissions) setMarketingPerms(t.marketingPermissions);
      })
      .catch(err => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveTenant = async () => {
    if (!name.trim()) return toast.error('Business name is required');
    setSaving(true);
    try {
      await userApi.updateTenant({ name, businessType, phone, email, address, logo, gstNumber, udyamNumber, aadharNumber, panNumber, commonDiscount, defaultRestockQuantity, bannerRotateInterval, exploreGridCols, exploreGridGap, exploreImageHeight, exploreShowTitle, bankDetails: { accountNumber, ifscCode } });
      toast.success('Settings saved');
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDispatchPermChange = async (key: keyof DispatchPermissions) => {
    const updated = { ...dispatchPerms, [key]: !dispatchPerms[key] };
    setDispatchPerms(updated);
    try {
      await dispatchApi.updatePermissions(updated);
      toast.success('Dispatch permissions updated');
    } catch (err: any) {
      toast.error(extractError(err));
      setDispatchPerms(dispatchPerms);
    }
  };

  const handleProductionPermChange = async (key: keyof ProductionPermissions) => {
    const updated = { ...productionPerms, [key]: !productionPerms[key] };
    setProductionPerms(updated);
    try {
      await productionApi.updatePermissions(updated);
      toast.success('Production permissions updated');
    } catch (err: any) {
      toast.error(extractError(err));
      setProductionPerms(productionPerms);
    }
  };

  const handleMarketingPermChange = async (key: keyof MarketingPermissions) => {
    const updated = { ...marketingPerms, [key]: !marketingPerms[key] };
    setMarketingPerms(updated);
    try {
      await marketingApi.updatePermissions(updated);
      toast.success('Marketing permissions updated');
    } catch (err: any) {
      toast.error(extractError(err));
      setMarketingPerms(marketingPerms);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;

  const sections = [
    { id: 'business' as SectionKey, icon: <Building2 size={18} className="text-primary-600" />, iconBg: 'bg-primary-50', title: 'Business Settings', subtitle: 'Business info & pricing' },
    { id: 'permissions' as SectionKey, icon: <Shield size={18} className="text-blue-600" />, iconBg: 'bg-blue-50', title: 'Team Permissions', subtitle: 'Role access control' },
    { id: 'alerts' as SectionKey, icon: <Bell size={18} className="text-amber-600" />, iconBg: 'bg-amber-50', title: 'Notifications & Alerts', subtitle: 'Stock alerts & notifications' },
    { id: 'explore' as SectionKey, icon: <ImageIcon size={18} className="text-violet-600" />, iconBg: 'bg-violet-50', title: 'Explore Feed', subtitle: 'Customer feed settings' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      </div>

      <div className="flex gap-6">
        {/* Left Sidebar - Section Tabs */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => toggleSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-slate-50 last:border-0 ${openSection === s.id ? 'bg-primary-50 border-l-3 border-l-primary-600' : 'hover:bg-slate-50/50'}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${openSection === s.id ? 'bg-primary-100' : s.iconBg}`}>
                  {s.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${openSection === s.id ? 'text-primary-700' : 'text-slate-900'}`}>{s.title}</p>
                  <p className="text-xs text-slate-500 truncate">{s.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 min-w-0">
          {/* Business Settings */}
          {openSection === 'business' && (
            <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Type</label>
                <input value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="e.g., Retail, Wholesale" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo URL</label>
                <input value={logo} onChange={e => setLogo(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
              </div>

              {/* Registration & Compliance */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <p className="text-sm font-semibold text-slate-600 mb-3">Registration & Compliance</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">GST Number</label>
                  <input value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="e.g., 22AAAAA0000A1Z5" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">UDYAM Number</label>
                  <input value={udyamNumber} onChange={e => setUdyamNumber(e.target.value)} placeholder="e.g., UDYAM-XX-00-0000000" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Aadhar Number</label>
                  <input value={aadharNumber} onChange={e => setAadharNumber(e.target.value)} placeholder="e.g., 1234 5678 9012" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">PAN Number</label>
                  <input value={panNumber} onChange={e => setPanNumber(e.target.value)} placeholder="e.g., ABCDE1234F" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm uppercase" />
                </div>
              </div>

              {/* Bank Details */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <p className="text-sm font-semibold text-slate-600 mb-3">Bank Details</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Number</label>
                  <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Bank account number" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">IFSC Code</label>
                  <input value={ifscCode} onChange={e => setIfscCode(e.target.value)} placeholder="e.g., SBIN0001234" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm uppercase" />
                </div>
              </div>

              {/* Pricing & Stock Defaults */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <p className="text-sm font-semibold text-slate-600 mb-3">Pricing & Stock Defaults</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Common Discount (%)</label>
                  <input type="number" min={0} max={100} value={commonDiscount} onChange={e => setCommonDiscount(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} placeholder="0" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                  <p className="text-[10px] text-slate-400 mt-1">Applied to all products unless overridden by product or customer discount</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Default Restock Quantity</label>
                  <input type="number" min={1} value={defaultRestockQuantity} onChange={e => setDefaultRestockQuantity(Math.max(1, Number(e.target.value) || 1))} placeholder="10" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                  <p className="text-[10px] text-slate-400 mt-1">Quick restock button quantity for product variants</p>
                </div>
              </div>

              <div className="pt-4">
                <button onClick={handleSaveTenant} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium text-sm shadow-lg transition-all">
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
            </div>
          )}

          {/* Team Permissions */}
          {openSection === 'permissions' && (
            <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6">
            {/* Dispatch Permissions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Dispatch Permissions</h3>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(dispatchPerms) as (keyof DispatchPermissions)[]).map(key => (
                  <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition-colors">
                    <span className="text-sm font-medium text-slate-700 capitalize">{key}</span>
                    <button type="button" onClick={() => handleDispatchPermChange(key)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dispatchPerms[key] ? 'bg-primary-600' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${dispatchPerms[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Production Permissions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Production Permissions</h3>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(productionPerms) as (keyof ProductionPermissions)[]).map(key => (
                  <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition-colors">
                    <span className="text-sm font-medium text-slate-700 capitalize">{key}</span>
                    <button type="button" onClick={() => handleProductionPermChange(key)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${productionPerms[key] ? 'bg-primary-600' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${productionPerms[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketing Permissions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Marketing Permissions</h3>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(marketingPerms) as (keyof MarketingPermissions)[]).map(key => (
                  <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition-colors">
                    <span className="text-sm font-medium text-slate-700 capitalize">{key}</span>
                    <button type="button" onClick={() => handleMarketingPermChange(key)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${marketingPerms[key] ? 'bg-primary-600' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${marketingPerms[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            </div>
          )}

          {/* Notifications & Alerts */}
          {openSection === 'alerts' && (
            <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Low Stock Threshold</label>
                <p className="text-xs text-slate-400 mb-2">Products with stock at or below this number will be flagged as "Low Stock"</p>
                <input type="number" min={1} value={lowStockThreshold} onChange={e => setLowStockThreshold(Math.max(1, Number(e.target.value) || 1))} className="w-32 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Enable Notifications</label>
                  <p className="text-xs text-slate-400 mt-0.5">When disabled, no new notifications will be created for any event</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-primary-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {/* Per-type Notification Preferences */}
              <div className={`border-t border-slate-100 pt-4 mt-2 ${!notificationsEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                {notifGroups.map(group => (
                  <div key={group.label} className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-600 mb-2">{group.label}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {group.keys.map(key => (
                        <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition-colors">
                          <span className="text-sm font-medium text-slate-700">{notifLabels[key]}</span>
                          <button
                            type="button"
                            onClick={() => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }))}
                            disabled={!notificationsEnabled}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifPrefs[key] ? 'bg-primary-600' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${notifPrefs[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    setSavingAlerts(true);
                    try {
                      await userApi.updateTenant({ lowStockThreshold, notificationsEnabled, notificationPreferences: notifPrefs } as any);
                      toast.success('Alert settings saved');
                    } catch (err: any) {
                      toast.error(extractError(err));
                    } finally {
                      setSavingAlerts(false);
                    }
                  }}
                  disabled={savingAlerts}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium text-sm shadow-lg transition-all"
                >
                  <Save size={16} />
                  {savingAlerts ? 'Saving...' : 'Save Alert Settings'}
                </button>
              </div>
            </div>
            </div>
          )}

          {/* Explore Feed Settings */}
          {openSection === 'explore' && (
            <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Explore Feed</h2>
              <p className="text-sm text-slate-500 mb-5">Configure how banners appear on customer dashboard</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Banner Rotate (seconds)</label>
                    <input type="number" min={3} value={bannerRotateInterval} onChange={e => setBannerRotateInterval(Math.max(3, Number(e.target.value) || 5))} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                    <p className="text-[10px] text-slate-400 mt-1">Auto-shuffle images every X seconds (min 3)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Grid Columns</label>
                    <input type="number" min={2} max={5} value={exploreGridCols} onChange={e => setExploreGridCols(Math.min(5, Math.max(2, Number(e.target.value) || 3)))} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                    <p className="text-[10px] text-slate-400 mt-1">Number of columns (2-5)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Grid Gap (px)</label>
                    <input type="number" min={0} max={10} value={exploreGridGap} onChange={e => setExploreGridGap(Math.min(10, Math.max(0, Number(e.target.value) || 0)))} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
                    <p className="text-[10px] text-slate-400 mt-1">Space between images (0-10)</p>
                  </div>
                  <div className="flex items-center justify-between pt-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Show Title</label>
                      <p className="text-[10px] text-slate-400 mt-0.5">Title overlay on images</p>
                    </div>
                    <button type="button" onClick={() => setExploreShowTitle(!exploreShowTitle)} className={`relative w-11 h-6 rounded-full transition-colors ${exploreShowTitle ? 'bg-primary-600' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${exploreShowTitle ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <button onClick={handleSaveTenant} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium text-sm shadow-lg transition-all">
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No section selected */}
          {!openSection && (
            <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-12 text-center">
              <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Select a section to configure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
