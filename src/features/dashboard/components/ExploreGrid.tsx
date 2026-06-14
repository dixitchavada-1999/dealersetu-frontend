import type { ReactNode } from 'react';
import type { Banner } from '../../../lib/types';
import ExploreCell from './ExploreCell';

type Props = { banners: Banner[]; startPattern: number; onBannerClick: (b: Banner) => void };

/** Pinterest-style masonry of banner tiles, cycling through 6 layout patterns. */
export default function ExploreGrid({ banners, startPattern, onBannerClick }: Props) {
  const rows: ReactNode[] = [];
  let idx = 0;
  let pIdx = startPattern;

  while (idx < banners.length) {
    const remaining = banners.slice(idx);
    const pattern = pIdx % 6;
    pIdx++;
    const si = idx;

    if (pattern === 0 && remaining.length >= 3) {
      rows.push(
        <div key={`p0-${si}`} className="flex gap-1 mb-1">
          <div className="w-2/3 aspect-square"><ExploreCell banner={remaining[0]} onClick={onBannerClick} /></div>
          <div className="w-1/3 flex flex-col gap-1">
            <div className="w-full aspect-square"><ExploreCell banner={remaining[1]} onClick={onBannerClick} /></div>
            <div className="w-full aspect-square"><ExploreCell banner={remaining[2]} onClick={onBannerClick} /></div>
          </div>
        </div>
      );
      idx += 3;
    } else if (pattern === 1 && remaining.length >= 3) {
      rows.push(
        <div key={`p1-${si}`} className="flex gap-1 mb-1">
          <div className="w-1/3 flex flex-col gap-1">
            <div className="w-full aspect-square"><ExploreCell banner={remaining[0]} onClick={onBannerClick} /></div>
            <div className="w-full aspect-square"><ExploreCell banner={remaining[1]} onClick={onBannerClick} /></div>
          </div>
          <div className="w-2/3 aspect-square"><ExploreCell banner={remaining[2]} onClick={onBannerClick} /></div>
        </div>
      );
      idx += 3;
    } else if (pattern === 2) {
      const n = Math.min(remaining.length, 3);
      rows.push(
        <div key={`p2-${si}`} className="flex gap-1 mb-1">
          {remaining.slice(0, n).map((b, j) => (
            <div key={j} className="w-1/3 aspect-square"><ExploreCell banner={b} onClick={onBannerClick} /></div>
          ))}
        </div>
      );
      idx += n;
    } else if (pattern === 3 && remaining.length >= 2) {
      const n = Math.min(remaining.length, 4);
      rows.push(
        <div key={`p3-${si}`} className="mb-1">
          <div className="w-full mb-1" style={{ aspectRatio: '2.3 / 1' }}>
            <ExploreCell banner={remaining[0]} onClick={onBannerClick} />
          </div>
          {n > 1 && (
            <div className="flex gap-1">
              {remaining.slice(1, n).map((b, j) => (
                <div key={j} className="w-1/3 aspect-square"><ExploreCell banner={b} onClick={onBannerClick} /></div>
              ))}
            </div>
          )}
        </div>
      );
      idx += n;
    } else if (pattern === 4) {
      const n = Math.min(remaining.length, 2);
      rows.push(
        <div key={`p4-${si}`} className="flex gap-1 mb-1">
          {remaining.slice(0, n).map((b, j) => (
            <div key={j} className="w-1/2" style={{ aspectRatio: '2 / 3' }}><ExploreCell banner={b} onClick={onBannerClick} /></div>
          ))}
        </div>
      );
      idx += n;
    } else if (pattern === 5 && remaining.length >= 4) {
      const n = Math.min(remaining.length, 6);
      rows.push(
        <div key={`p5-${si}`} className="mb-1">
          <div className="flex gap-1 mb-1">
            {remaining.slice(0, 3).map((b, j) => (
              <div key={j} className="w-1/3 aspect-square"><ExploreCell banner={b} onClick={onBannerClick} /></div>
            ))}
          </div>
          {n > 3 && (
            <div className="flex gap-1">
              <div className="w-2/3 aspect-square"><ExploreCell banner={remaining[3]} onClick={onBannerClick} /></div>
              <div className="w-1/3 flex flex-col gap-1">
                {n > 4 && <div className="w-full aspect-square"><ExploreCell banner={remaining[4]} onClick={onBannerClick} /></div>}
                {n > 5 && <div className="w-full aspect-square"><ExploreCell banner={remaining[5]} onClick={onBannerClick} /></div>}
              </div>
            </div>
          )}
        </div>
      );
      idx += n;
    } else {
      const n = Math.min(remaining.length, 3);
      rows.push(
        <div key={`fb-${si}`} className="flex gap-1 mb-1">
          {remaining.slice(0, n).map((b, j) => (
            <div key={j} className="w-1/3 aspect-square"><ExploreCell banner={b} onClick={onBannerClick} /></div>
          ))}
        </div>
      );
      idx += n;
    }
  }

  return (
    <div className="md:columns-2 md:gap-1">
      {rows.map((row, i) => <div key={i} className="break-inside-avoid">{row}</div>)}
    </div>
  );
}
