import { useEffect, useRef, useState } from 'react';
import type { Banner } from '../../../lib/types';

const ANIM_KEYFRAMES = ['exploreZoom', 'exploreFade', 'exploreSlideUp', 'exploreSlideLeft', 'exploreBlur'];

function pickAnim() {
  return {
    name: ANIM_KEYFRAMES[Math.floor(Math.random() * ANIM_KEYFRAMES.length)],
    delay: Math.floor(Math.random() * 500),
    duration: 400 + Math.floor(Math.random() * 500),
  };
}

type Props = { banner: Banner; onClick: (b: Banner) => void };

/** A single banner tile in the customer Explore grid, with entrance animation. */
export default function ExploreCell({ banner, onClick }: Props) {
  const [anim] = useState(pickAnim);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);

  const animStyle = { animation: `${anim.name} ${anim.duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${anim.delay}ms both` };

  return (
    <div className="relative w-full h-full overflow-hidden cursor-pointer group bg-slate-800 rounded-xl" style={animStyle} onClick={() => onClick(banner)}>
      {!loaded && <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 animate-pulse" />}
      {banner.mediaType === 'video' ? (
        <video
          src={banner.imageUrl}
          autoPlay muted loop playsInline preload="metadata"
          onLoadedData={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-[opacity,transform,filter] duration-700 ease-out ${loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[1.03] blur-sm'}`}
        />
      ) : (
        <img
          ref={imgRef}
          src={banner.imageUrl}
          alt={banner.title}
          loading="lazy" decoding="async"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-[opacity,transform,filter] duration-700 ease-out ${loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[1.03] blur-sm'}`}
        />
      )}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-500 delay-100 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-white font-semibold text-sm line-clamp-2">{banner.title}</p>
        {banner.description && <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{banner.description}</p>}
      </div>
    </div>
  );
}
