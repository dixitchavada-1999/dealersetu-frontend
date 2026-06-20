import { features, PILL_TEAL, GRADIENT_TEXT } from '../data';
import Eyebrow from './Eyebrow';

/** Grid of platform feature cards. */
export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow label="Our Services" style={PILL_TEAL} />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
            Everything you need to <span style={GRADIENT_TEXT}>run your business</span>
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg" style={{ color: '#475569' }}>A complete toolkit — no need to stitch together 10 different tools.</p>
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map(f => (
            <div key={f.title} className="group relative p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-sm transition overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, #3B82F6, #0F52BA)' }} />
              <div className="relative flex items-start gap-4 lg:block">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 lg:mb-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #3B82F6 100%)', boxShadow: '0 8px 24px rgba(15, 82, 186, 0.25)' }}>
                  <f.icon size={24} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1 lg:mt-2 text-sm leading-relaxed" style={{ color: '#475569' }}>{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
