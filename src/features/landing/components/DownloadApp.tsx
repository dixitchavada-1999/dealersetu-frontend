import { Apple, Smartphone } from 'lucide-react';
import { COLORS, PILL_TEAL, GRADIENT_TEXT } from '../data';
import Eyebrow from './Eyebrow';

/** Mobile-app promo section with store badges and a phone mockup. */
export default function DownloadApp() {
  return (
    <section className="relative py-8 lg:py-12 overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #131C31 0%, #0B1120 50%, #131C31 100%)' }} />
      <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse at top right, rgba(0, 201, 167, 0.2), transparent 60%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Eyebrow label="Mobile App" style={PILL_TEAL} />
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Take DealerSetu <br />
              <span style={GRADIENT_TEXT}>everywhere.</span>
            </h2>
            <p className="mt-6 text-lg max-w-lg" style={{ color: '#cbd5e1' }}>
              Manage your business from your phone. Approve orders, check dispatch, and track marketing — all from the app.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a href="#" className="flex items-center gap-3 text-white px-6 py-3.5 rounded-xl transition shadow-xl" style={{ backgroundColor: '#000' }}>
                <Apple size={28} />
                <div className="text-left"><div className="text-xs" style={{ color: '#94a3b8' }}>Download on the</div><div className="font-semibold">App Store</div></div>
              </a>
              <a href="#" className="flex items-center gap-3 text-white px-6 py-3.5 rounded-xl transition shadow-xl" style={{ backgroundColor: '#000' }}>
                <Smartphone size={28} />
                <div className="text-left"><div className="text-xs" style={{ color: '#94a3b8' }}>Get it on</div><div className="font-semibold">Google Play</div></div>
              </a>
            </div>
            <p className="mt-6 text-sm" style={{ color: '#94a3b8' }}>Coming soon on both stores.</p>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-8 rounded-[3.5rem] blur-2xl" style={{ background: 'rgba(0, 201, 167, 0.2)' }} />
              <div className="relative w-64 h-[520px] bg-black rounded-[3rem] p-3 shadow-2xl border-4 border-black">
                <div className="w-full h-full rounded-[2.3rem] overflow-hidden flex flex-col" style={{ backgroundColor: COLORS.bg }}>
                  <div className="h-14 flex items-center justify-center text-white font-semibold" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)' }}>DealerSetu</div>
                  <div className="flex-1 p-4 space-y-3 overflow-hidden">
                    {['Orders', 'Products', 'Customers', 'Dispatch', 'Marketing'].map(k => (
                      <div key={k} className="backdrop-blur p-3 rounded-xl border" style={{ backgroundColor: 'rgba(0, 201, 167, 0.08)', borderColor: 'rgba(0, 201, 167, 0.2)' }}>
                        <div className="text-xs" style={{ color: '#94a3b8' }}>{k}</div>
                        <div className="font-semibold text-white text-sm">View all →</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
