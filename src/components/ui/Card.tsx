import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Lift shadow on hover (for clickable / interactive cards). */
  hover?: boolean;
  /** Inner padding scale. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const PAD: Record<NonNullable<Props['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

/**
 * Standard surface card — the `bg-card` shell used across every page.
 * Theme-aware (light off-white / dark slate) via the `bg-card` token.
 */
export default function Card({ children, className = '', hover = false, padding = 'md' }: Props) {
  return (
    <div
      className={`bg-card rounded-xl shadow-sm border border-slate-100 ${PAD[padding]} ${hover ? 'hover:shadow-md transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
