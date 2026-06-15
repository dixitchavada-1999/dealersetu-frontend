import { SETTINGS_SECTIONS, type SectionKey } from '../constants';

type SettingsNavProps = {
  active: SectionKey | null;
  onSelect: (id: SectionKey) => void;
};

/** Left-hand section selector for the settings page. */
export default function SettingsNav({ active, onSelect }: SettingsNavProps) {
  return (
    <div className="w-72 flex-shrink-0">
      <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {SETTINGS_SECTIONS.map(s => {
          const isActive = active === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-slate-50 last:border-0 ${isActive ? 'bg-primary-50 border-l-3 border-l-primary-600' : 'hover:bg-slate-50/50'}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary-100' : s.iconBg}`}>
                <Icon size={18} className={s.iconColor} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${isActive ? 'text-primary-700' : 'text-slate-900'}`}>{s.title}</p>
                <p className="text-xs text-slate-500 truncate">{s.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
