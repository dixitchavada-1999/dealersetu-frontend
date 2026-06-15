import { Save } from 'lucide-react';

type SaveButtonProps = {
  onClick: () => void;
  saving: boolean;
  label?: string;
};

/** Primary save action used across settings sections. */
export default function SaveButton({ onClick, saving, label = 'Save Settings' }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium text-sm shadow-lg transition-all"
    >
      <Save size={16} />
      {saving ? 'Saving...' : label}
    </button>
  );
}
