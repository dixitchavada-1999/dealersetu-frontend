import { Star } from 'lucide-react';
import { testimonials, PILL_TEAL } from '../data';
import Eyebrow from './Eyebrow';

/** Customer testimonial cards. */
export default function Testimonials() {
  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow label="Testimonials" style={PILL_TEAL} />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">Loved by businesses</h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg" style={{ color: '#475569' }}>Don't just take our word for it.</p>
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm transition hover:border-teal-400/40">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} style={{ fill: '#0F52BA', color: '#0F52BA' }} />)}
              </div>
              <p className="leading-relaxed" style={{ color: '#475569' }}>"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-semibold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #3B82F6 100%)' }}>{t.name.charAt(0)}</div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs" style={{ color: '#475569' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
