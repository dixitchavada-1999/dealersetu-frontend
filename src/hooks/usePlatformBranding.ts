import { useEffect, useState } from 'react';
import { platformSettingsApi } from '../lib/api';
import type { PlatformSettings } from '../lib/api';

const FALLBACK: PlatformSettings = { logoUrl: '', logoLightUrl: '', brandName: 'DealerSetu', brandColor: '#0F52BA' };

// Module-level cache so the public branding is fetched once per page load.
let cache: PlatformSettings | null = null;
let inflight: Promise<PlatformSettings> | null = null;

/** Public platform branding (logo / name / color), fetched once and cached. */
export function usePlatformBranding(): PlatformSettings {
  const [settings, setSettings] = useState<PlatformSettings>(cache || FALLBACK);

  useEffect(() => {
    if (cache) return;
    if (!inflight) {
      inflight = platformSettingsApi.get().then((s) => { cache = s; return s; }).catch(() => FALLBACK);
    }
    let active = true;
    inflight.then((s) => { if (active) setSettings(s); });
    return () => { active = false; };
  }, []);

  return settings;
}
