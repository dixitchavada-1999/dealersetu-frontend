import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { Banner } from '../../../lib/types';
import ExploreGrid from './ExploreGrid';

type Props = {
  customerName?: string | null;
  banners: Banner[];
  onBannerClick: (b: Banner) => void;
};

const ROTATE_MS = 10_000;

/**
 * Customer landing: welcome banner + an auto-shuffling Explore grid.
 * Owns its own shuffle + idle-rotation logic so the page stays a thin container.
 */
export default function ExploreFeed({ customerName, banners, onBannerClick }: Props) {
  const [displayBanners, setDisplayBanners] = useState<Banner[]>(banners);
  const [patternIndex] = useState(() => Math.floor(Math.random() * 6));
  const [rotationKey, setRotationKey] = useState(0);
  const lastInteractionRef = useRef(Date.now());

  // Sync when banners finish loading.
  useEffect(() => { setDisplayBanners(banners); }, [banners]);

  const shuffle = () => {
    setDisplayBanners((prev) => [...prev].sort(() => Math.random() - 0.5));
    setRotationKey((k) => k + 1);
  };

  // Auto-rotate every 10s while the user is idle.
  useEffect(() => {
    if (banners.length <= 1) return;
    const bump = () => { lastInteractionRef.current = Date.now(); };
    window.addEventListener('mousemove', bump);
    window.addEventListener('keydown', bump);
    window.addEventListener('scroll', bump, true);
    const timer = setInterval(() => {
      if (Date.now() - lastInteractionRef.current < ROTATE_MS) return;
      setDisplayBanners((prev) => [...prev].sort(() => Math.random() - 0.5));
      setRotationKey((k) => k + 1);
    }, ROTATE_MS);
    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', bump);
      window.removeEventListener('keydown', bump);
      window.removeEventListener('scroll', bump, true);
    };
  }, [banners.length]);

  return (
    <div>
      <div className="bg-primary-600 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back{customerName ? `, ${customerName}` : ''}!</h1>
      </div>

      {displayBanners.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Explore</h2>
            <button onClick={shuffle} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="Shuffle layout">
              <RefreshCw size={16} />
            </button>
          </div>
          <div key={rotationKey}>
            <ExploreGrid banners={displayBanners} startPattern={patternIndex} onBannerClick={onBannerClick} />
          </div>
        </div>
      )}
    </div>
  );
}
