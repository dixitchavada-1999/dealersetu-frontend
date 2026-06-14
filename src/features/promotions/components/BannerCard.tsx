import { Pencil, Trash2, Eye, EyeOff, Video } from 'lucide-react';
import type { Banner } from '../../../lib/types';
import { formatLongDate } from '../../../lib/format';

type Props = { banner: Banner; onEdit: (b: Banner) => void; onDelete: (id: string) => void };

const fmt = (d?: string) => (d ? formatLongDate(d) : '-');

/** Promotional banner preview card (image/video + meta + hover actions). */
export default function BannerCard({ banner: b, onEdit, onDelete }: Props) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-44 bg-slate-100">
        {b.mediaType === 'video' ? (
          <video src={b.imageUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay />
        ) : (
          <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e2e8f0" width="100" height="100"/></svg>'; }} />
        )}
        {b.mediaType === 'video' && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm"><Video size={10} /> VIDEO</span>
        )}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(b)} className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm"><Pencil size={14} className="text-slate-600" /></button>
          <button onClick={() => onDelete(b.id)} className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm"><Trash2 size={14} className="text-red-500" /></button>
        </div>
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${b.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
            {b.isActive ? <Eye size={12} /> : <EyeOff size={12} />} {b.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-900 truncate">{b.title}</h3>
        {b.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{b.description}</p>}
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-600">P: {b.priority}</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-600 capitalize">{b.linkType}</span>
          <span>{fmt(b.startDate)} - {fmt(b.endDate)}</span>
        </div>
      </div>
    </div>
  );
}
