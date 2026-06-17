import { steps, PILL_BLUE } from '../data';
import Eyebrow from './Eyebrow';

/** Four-step "get started" timeline. */
export default function HowItWorks() {
  return (
    <section id="how" className="relative py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow label="Process" style={PILL_BLUE} />
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900">Get started in minutes</h2>
          <p className="mt-6 text-lg" style={{ color: '#475569' }}>Four simple steps to go live.</p>
        </div>

        <div className="mt-10 relative">
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(15, 82, 186, 0.3), transparent)' }} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(s => (
              <div key={s.n} className="relative">
                <div className="relative w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-lg mb-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #3B82F6 100%)', boxShadow: '0 8px 24px rgba(15, 82, 186, 0.3)' }}>
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm" style={{ color: '#475569' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
