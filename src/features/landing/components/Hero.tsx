import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { stats, GRADIENT_TEXT } from '../data';
import ModuleShowcase from './ModuleShowcase';

/** Hero section — headline, CTAs, stat strip, and the module showcase. */
export default function Hero() {
  return (
    <section id="home" className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-8 lg:pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8 border" style={{ backgroundColor: 'rgba(15, 82, 186, 0.08)', borderColor: 'rgba(15, 82, 186, 0.2)', color: '#0F52BA' }}>
            <Sparkles size={14} />
            Transforming B2B Into Digital Reality
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            We Power <span style={GRADIENT_TEXT}>B2B Commerce</span>
            <br />
            That Drives Your Business
          </h1>

          <p className="mt-8 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#475569' }}>
            DealerSetu delivers a complete multi-tenant commerce platform with
            product management, order tracking, dispatch, and marketing tools
            to help B2B businesses thrive in the modern world.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="group inline-flex items-center gap-2 text-white px-8 py-4 rounded-full font-medium transition shadow-lg" style={{ background: '#0F52BA', boxShadow: '0 10px 30px rgba(15, 82, 186, 0.4)' }}>
              Start a Project
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-3 text-slate-900 px-8 py-4 rounded-full font-medium bg-white border border-slate-200 shadow-sm transition hover:border-slate-300">
              <span className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center" style={{ color: '#0F52BA' }}>
                <Play size={12} className="ml-0.5" fill="currentColor" />
              </span>
              Learn More
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-4xl lg:text-5xl font-bold" style={GRADIENT_TEXT}>{s.value}</div>
              <div className="mt-2 text-sm" style={{ color: '#475569' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <ModuleShowcase />
      </div>
    </section>
  );
}
