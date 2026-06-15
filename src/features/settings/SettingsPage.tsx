import { useState } from 'react';
import { Loader2, Building2 } from 'lucide-react';
import { Card } from '../../components/ui';
import { useSettings } from './hooks/useSettings';
import type { SectionKey } from './constants';
import SettingsNav from './components/SettingsNav';
import BusinessSection from './components/BusinessSection';
import PermissionsSection from './components/PermissionsSection';
import AlertsSection from './components/AlertsSection';
import ExploreSection from './components/ExploreSection';

/** Tenant settings — sectioned business, permissions, alerts, and explore config. */
export default function SettingsPage() {
  const s = useSettings();
  const [openSection, setOpenSection] = useState<SectionKey | null>('business');
  const toggleSection = (id: SectionKey) => setOpenSection(prev => (prev === id ? null : id));

  if (s.loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      </div>

      <div className="flex gap-6">
        <SettingsNav active={openSection} onSelect={toggleSection} />

        <div className="flex-1 min-w-0">
          {openSection === 'business' && <BusinessSection business={s.business} saving={s.saving} onSave={s.saveTenant} />}
          {openSection === 'permissions' && <PermissionsSection perms={s.perms} />}
          {openSection === 'alerts' && <AlertsSection alerts={s.alerts} saving={s.savingAlerts} onSave={s.saveAlerts} />}
          {openSection === 'explore' && <ExploreSection explore={s.explore} saving={s.saving} onSave={s.saveTenant} />}

          {!openSection && (
            <Card padding="lg" className="p-12 text-center">
              <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Select a section to configure</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
