import type { ReactNode } from 'react';
import { usePlatformBranding } from '../hooks/usePlatformBranding';

type Props = {
  /** Rendered when no platform logo is uploaded (the original icon + text). */
  fallback: ReactNode;
  /** Classes for the <img> when a platform logo IS set (control height/width). */
  imgClassName?: string;
  /** Background the logo sits on: 'dark' uses the dark-bg logo, 'light' the light-bg logo. */
  variant?: 'light' | 'dark';
};

/** Shows the uploaded platform logo (light/dark variant) if set, else the fallback. */
export default function BrandLogo({ fallback, imgClassName = 'h-9 w-auto', variant = 'light' }: Props) {
  const { logoUrl, logoLightUrl, brandName } = usePlatformBranding();
  // dark bg → white-text logo (logoUrl); light bg → dark-text logo (logoLightUrl).
  // Each falls back to the other if only one is uploaded.
  const src = variant === 'dark' ? (logoUrl || logoLightUrl) : (logoLightUrl || logoUrl);
  if (src) return <img src={src} alt={brandName || 'DealerSetu'} className={imgClassName} />;
  return <>{fallback}</>;
}
