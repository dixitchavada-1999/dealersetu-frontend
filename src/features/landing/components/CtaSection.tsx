import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/** Closing call-to-action banner. */
export default function CtaSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #3B82F6 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.2), transparent 60%)' }} />

          <div className="relative px-6 sm:px-8 py-12 sm:py-16 lg:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">Ready to grow your <br /> B2B business?</h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Join hundreds of businesses already using DealerSetu. Free for 14 days, no credit card.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-full font-semibold transition shadow-xl hover:bg-slate-100" style={{ color: '#0f172a' }}>
                Start Free Trial <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white px-8 py-3.5 rounded-full font-semibold border backdrop-blur transition" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.3)' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
