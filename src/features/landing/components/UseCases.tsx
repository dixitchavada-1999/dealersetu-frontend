import { useCases, PILL_TEAL } from '../data';
import Eyebrow from './Eyebrow';

/** "Who it's for" cards. */
export default function UseCases() {
  return (
    <section id="usecases" className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow label="Who it's for" style={PILL_TEAL} />
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900">Built for B2B businesses</h2>
          <p className="mt-6 text-lg" style={{ color: '#475569' }}>No matter what you sell, DealerSetu adapts.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map(c => (
            <div key={c.title} className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm transition hover:border-teal-400/40">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, rgba(15, 82, 186, 0.15) 0%, rgba(15, 82, 186, 0.15) 100%)', border: '1px solid rgba(15, 82, 186, 0.3)' }}>
                <c.icon size={26} style={{ color: '#0F52BA' }} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{c.title}</h3>
              <p className="mt-2 text-sm" style={{ color: '#475569' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
