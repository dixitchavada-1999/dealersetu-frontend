import { useCases, PILL_TEAL } from '../data';
import Eyebrow from './Eyebrow';

/** "Who it's for" cards. */
export default function UseCases() {
  return (
    <section id="usecases" className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow label="Who it's for" style={PILL_TEAL} />
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Built for B2B businesses</h2>
          <p className="mt-6 text-lg" style={{ color: '#94a3b8' }}>No matter what you sell, DealerSetu adapts.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map(c => (
            <div key={c.title} className="p-7 rounded-2xl border transition hover:border-teal-400/40" style={{ backgroundColor: 'rgba(15, 28, 48, 0.5)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, rgba(0, 201, 167, 0.15) 0%, rgba(15, 82, 186, 0.15) 100%)', border: '1px solid rgba(0, 201, 167, 0.3)' }}>
                <c.icon size={26} style={{ color: '#00C9A7' }} />
              </div>
              <h3 className="text-lg font-semibold text-white">{c.title}</h3>
              <p className="mt-2 text-sm" style={{ color: '#94a3b8' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
