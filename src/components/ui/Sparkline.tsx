type Props = {
  trend: 'up' | 'down' | 'flat';
  color: string;
};

const PATHS: Record<Props['trend'], string> = {
  up: 'M0,20 L8,18 L16,15 L24,16 L32,12 L40,8 L48,10 L56,5 L64,3',
  down: 'M0,5 L8,7 L16,6 L24,10 L32,12 L40,15 L48,14 L56,18 L64,20',
  flat: 'M0,12 L8,11 L16,13 L24,12 L32,11 L40,13 L48,12 L56,12 L64,11',
};

/** Small static sparkline used inside KPI cards. */
export default function Sparkline({ trend, color }: Props) {
  return (
    <svg viewBox="0 0 64 24" className="w-16 h-6" fill="none">
      <path d={PATHS[trend]} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
