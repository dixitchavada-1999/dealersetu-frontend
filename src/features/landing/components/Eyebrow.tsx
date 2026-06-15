import type { CSSProperties } from 'react';

/** Small uppercase pill used above section headings. */
export default function Eyebrow({ label, style }: { label: string; style: CSSProperties }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border" style={style}>
      {label}
    </span>
  );
}
