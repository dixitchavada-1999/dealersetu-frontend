import { Star } from 'lucide-react';

type Props = {
  rating: number;
  size?: number;
  /** When set, stars become clickable to choose a rating. */
  onChange?: (rating: number) => void;
};

/** Five-star rating — read-only by default, interactive when `onChange` is given. */
export default function StarRating({ rating, size = 14, onChange }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= rating;
        const star = <Star size={size} className={filled ? 'text-amber-400 fill-amber-400' : `text-slate-200${onChange ? ' hover:text-amber-200' : ''}`} />;
        return onChange ? (
          <button key={i} type="button" onClick={() => onChange(i)} className="p-0.5">{star}</button>
        ) : (
          <span key={i}>{star}</span>
        );
      })}
    </div>
  );
}
