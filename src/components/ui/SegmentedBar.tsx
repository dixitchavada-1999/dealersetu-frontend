export type BarSegment = { value: number; color: string; label: string };

type Props = { segments: BarSegment[] };

/** Single horizontal bar split into proportional coloured segments. */
export default function SegmentedBar({ segments }: Props) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  if (total === 0) return <div className="w-full h-2.5 bg-slate-100 rounded-full" />;
  return (
    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
      {segments.map((seg, i) => (
        <div
          key={i}
          className="h-full transition-all duration-700"
          style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
        />
      ))}
    </div>
  );
}
