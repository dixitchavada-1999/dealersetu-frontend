import { useEffect, useState } from 'react';
import { userApi, dispatchApi, productionApi, marketingApi, extractError } from '../../../lib/api';
import type { DispatchPermissions, ProductionPermissions, MarketingPermissions, NotificationPreferences } from '../../../lib/types';
import toast from '../../../lib/toast';
import { defaultNotifPrefs } from '../constants';

/** All Settings state, data loading, and persistence handlers. */
export function useSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAlerts, setSavingAlerts] = useState(false);

  // Business form
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

  // Alerts
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(defaultNotifPrefs);

  // Permissions
  const [dispatchPerms, setDispatchPerms] = useState<DispatchPermissions>({ dashboard: true, categories: false, products: true, orders: true });
  const [productionPerms, setProductionPerms] = useState<ProductionPermissions>({ dashboard: true, categories: false, products: true, orders: true });
  const [marketingPerms, setMarketingPerms] = useState<MarketingPermissions>({ dashboard: true, categories: false, products: true, orders: true, customers: true });

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

  const saveTenant = async () => {
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

  const saveAlerts = async () => {
    setSavingAlerts(true);
    try {
      await userApi.updateTenant({ lowStockThreshold, notificationsEnabled, notificationPreferences: notifPrefs } as any);
      toast.success('Alert settings saved');
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setSavingAlerts(false);
    }
  };

  const toggleDispatchPerm = async (key: keyof DispatchPermissions) => {
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

  const toggleProductionPerm = async (key: keyof ProductionPermissions) => {
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

  const toggleMarketingPerm = async (key: keyof MarketingPermissions) => {
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

  return {
    loading, saving, savingAlerts,
    business: {
      name, setName, businessType, setBusinessType, phone, setPhone, email, setEmail,
      address, setAddress, logo, setLogo, gstNumber, setGstNumber, udyamNumber, setUdyamNumber,
      aadharNumber, setAadharNumber, panNumber, setPanNumber, accountNumber, setAccountNumber,
      ifscCode, setIfscCode, commonDiscount, setCommonDiscount, defaultRestockQuantity, setDefaultRestockQuantity,
    },
    explore: {
      bannerRotateInterval, setBannerRotateInterval, exploreGridCols, setExploreGridCols,
      exploreGridGap, setExploreGridGap, exploreShowTitle, setExploreShowTitle,
    },
    alerts: {
      lowStockThreshold, setLowStockThreshold, notificationsEnabled, setNotificationsEnabled,
      notifPrefs, setNotifPrefs,
    },
    perms: {
      dispatchPerms, productionPerms, marketingPerms,
      toggleDispatchPerm, toggleProductionPerm, toggleMarketingPerm,
    },
    saveTenant, saveAlerts,
  };
}
