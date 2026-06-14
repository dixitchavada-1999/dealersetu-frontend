type Props = {
  value: number;
  max: number;
  /** One colour for a solid bar, two+ for a gradient. */
  colors: string[];
};

/** Thin horizontal progress bar with an optional gradient fill. */
export default function ProgressBar({ value, max, colors }: Props) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: colors.length > 1 ? `linear-gradient(90deg, ${colors.join(', ')})` : colors[0],
        }}
      />
    </div>
  );
}
