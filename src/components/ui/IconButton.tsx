import type { LucideIcon } from 'lucide-react';

type Tone = 'default' | 'danger';

type Props = {
  icon: LucideIcon;
  onClick: () => void;
  label: string;
  tone?: Tone;
};

const TONES: Record<Tone, string> = {
  default: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
  danger: 'text-slate-400 hover:text-red-500 hover:bg-red-50',
};

/** Small square icon button used for row actions (edit / delete). */
export default function IconButton({ icon: Icon, onClick, label, tone = 'default' }: Props) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={`p-2 rounded-lg transition-colors ${TONES[tone]}`}>
      <Icon size={16} />
    </button>
  );
}
