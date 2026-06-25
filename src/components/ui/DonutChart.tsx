export type DonutSegment = { value: number; color: string; label?: string };

type Props = {
  segments: DonutSegment[];
  /** Square pixel size of the SVG. */
  size?: number;
  /** Ring thickness in pixels. */
  thickness?: number;
  /** Big number shown in the middle. */
  centerLabel?: string;
  /** Caption under the center label. */
  centerSub?: string;
};

/**
 * Dependency-free donut/ring chart. The track uses `currentColor` mapped to the
 * theme-aware slate-100 token, so it adapts to light/dark automatically.
 */
export default function DonutChart({ segments, size = 168, thickness = 22, centerLabel, centerSub }: Props) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const c = size / 2;
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 text-slate-100">
        <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" strokeWidth={thickness} />
        {total > 0 &&
          segments.map((s, i) => {
            const dash = (s.value / total) * circ;
            const el = (
              <circle
                key={i}
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return el;
          })}
      </svg>
      {(centerLabel || centerSub) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && <span className="text-3xl font-bold text-slate-900 tracking-tight">{centerLabel}</span>}
          {centerSub && <span className="text-xs text-slate-400 mt-0.5">{centerSub}</span>}
        </div>
      )}
    </div>
  );
}
