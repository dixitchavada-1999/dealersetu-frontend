import { Card, FormField, TextInput, Toggle } from '../../../components/ui';
import SaveButton from './SaveButton';
import { notifGroups, notifLabels } from '../constants';
import type { useSettings } from '../hooks/useSettings';

type Props = {
  alerts: ReturnType<typeof useSettings>['alerts'];
  saving: boolean;
  onSave: () => void;
};

/** Low-stock threshold and per-event notification preferences. */
export default function AlertsSection({ alerts: a, saving, onSave }: Props) {
  return (
    <Card padding="lg">
      <div className="space-y-4">
        <FormField label="Low Stock Threshold">
          <p className="text-xs text-slate-400 mb-2">Products with stock at or below this number will be flagged as "Low Stock"</p>
          <TextInput type="number" min={1} value={a.lowStockThreshold} onChange={e => a.setLowStockThreshold(Math.max(1, Number(e.target.value) || 1))} className="w-32" />
        </FormField>

        <div className="flex items-center justify-between py-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Enable Notifications</label>
            <p className="text-xs text-slate-400 mt-0.5">When disabled, no new notifications will be created for any event</p>
          </div>
          <Toggle checked={a.notificationsEnabled} onChange={() => a.setNotificationsEnabled(!a.notificationsEnabled)} aria-label="Enable notifications" />
        </div>

        <div className={`border-t border-slate-100 pt-4 mt-2 ${!a.notificationsEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {notifGroups.map(group => (
            <div key={group.label} className="mb-4">
              <h4 className="text-sm font-semibold text-slate-600 mb-2">{group.label}</h4>
              <div className="grid grid-cols-2 gap-3">
                {group.keys.map(key => (
                  <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition-colors">
                    <span className="text-sm font-medium text-slate-700">{notifLabels[key]}</span>
                    <Toggle
                      checked={a.notifPrefs[key]}
                      onChange={() => a.setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }))}
                      disabled={!a.notificationsEnabled}
                      aria-label={notifLabels[key]}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2"><SaveButton onClick={onSave} saving={saving} label="Save Alert Settings" /></div>
      </div>
    </Card>
  );
}
