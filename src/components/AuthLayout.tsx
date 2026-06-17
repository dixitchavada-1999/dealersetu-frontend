import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import ParticleBackground from './ParticleBackground';

type Props = {
  children: ReactNode;
  tagline?: string;
  description?: string;
};

export default function AuthLayout({
  children,
  tagline = 'Manage your business with confidence',
  description = 'A powerful multi-tenant B2B commerce platform — manage products, orders, dispatch, and customers all in one place.',
}: Props) {
  const words = tagline.split(' ');
  const lastWord = words.pop() || '';
  const restWords = words.join(' ');

  return (
    <div
      className="landing-scope min-h-screen text-slate-900 relative overflow-hidden"
      style={{ backgroundColor: '#f8fafc' }}
    >
      {/* Background (behind everything) */}
      <ParticleBackground light />
      <div className="landing-orbs">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
      </div>

      {/* Content — above background */}
      <div
        className="relative min-h-screen flex flex-col lg:flex-row"
        style={{ zIndex: 1 }}
      >
        {/* Left: Branding (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3 font-bold text-2xl text-slate-900">
            <span
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
                boxShadow: '0 8px 24px rgba(0, 201, 167, 0.3)',
              }}
            >
              <ShoppingBag size={22} className="text-white" />
            </span>
            <span>
              Dealer
              <span
                style={{
                  background: 'linear-gradient(135deg, #0F52BA, #00C9A7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Setu
              </span>
            </span>
          </Link>

          <div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              {restWords}{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #0F52BA, #3B82F6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {lastWord}
              </span>
            </h1>
            <p className="mt-6 text-base leading-relaxed max-w-md" style={{ color: '#475569' }}>
              {description}
            </p>
          </div>

          <p className="text-xs" style={{ color: '#64748b' }}>
            © 2026 DealerSetu · All rights reserved
          </p>
        </div>

        {/* Mobile brand bar */}
        <div
          className="lg:hidden flex items-center justify-center py-6 border-b"
          style={{ borderColor: 'rgba(15,23,42,0.08)' }}
        >
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)' }}
            >
              <ShoppingBag size={18} className="text-white" />
            </span>
            <span>
              Dealer
              <span
                style={{
                  background: 'linear-gradient(135deg, #0F52BA, #00C9A7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Setu
              </span>
            </span>
          </Link>
        </div>

        {/* Right: Form panel (with translucent dark bg for contrast) */}
        <div
          className="flex-1 flex items-center justify-center p-6 sm:p-10"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderLeft: '1px solid rgba(15, 23, 42, 0.08)',
          }}
        >
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
