import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { plans, PILL_BLUE, GRADIENT_TEXT } from '../data';
import Eyebrow from './Eyebrow';

/** Three-tier pricing cards. */
export default function Pricing() {
  return (
    <section id="pricing" className="relative py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Eyebrow label="Pricing" style={{ ...PILL_BLUE, color: '#00C9A7' }} />
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Simple, transparent pricing</h2>
          <p className="mt-6 text-lg" style={{ color: '#94a3b8' }}>Choose a plan that grows with you.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map(p => (
            <div key={p.name} className="relative">
              {p.highlighted && <div className="absolute -inset-px rounded-3xl blur opacity-60" style={{ background: 'linear-gradient(135deg, #0F52BA, #00C9A7)' }} />}
              <div className="relative p-8 rounded-3xl border h-full" style={{ backgroundColor: p.highlighted ? 'rgba(15, 28, 48, 0.95)' : 'rgba(15, 28, 48, 0.5)', borderColor: p.highlighted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)' }}>
                {p.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-semibold px-4 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', boxShadow: '0 8px 20px rgba(0, 201, 167, 0.4)' }}>
                    ⭐ Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-white">{p.name}</h3>
                <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>{p.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold" style={p.highlighted ? GRADIENT_TEXT : { color: '#fff' }}>{p.price}</span>
                  <span style={{ color: '#64748b' }}>{p.period}</span>
                </div>
                <Link
                  to="/register"
                  className="mt-6 block text-center py-3 rounded-full font-medium transition text-white"
                  style={p.highlighted
                    ? { background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', boxShadow: '0 10px 30px rgba(0, 201, 167, 0.3)' }
                    : { backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {p.cta}
                </Link>
                <ul className="mt-8 space-y-3">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#cbd5e1' }}>
                      <Check size={16} style={{ color: '#00C9A7' }} className="mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
