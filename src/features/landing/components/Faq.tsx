import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqs, PILL_BLUE } from '../data';
import Eyebrow from './Eyebrow';

/** Accordion of frequently asked questions. */
export default function Faq() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section id="faq" className="py-8 lg:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Eyebrow label="FAQ" style={{ ...PILL_BLUE, color: '#0F52BA' }} />
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900">Frequently asked questions</h2>
          <p className="mt-6 text-lg" style={{ color: '#475569' }}>Can't find what you're looking for? Contact us.</p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl border shadow-sm transition" style={{ backgroundColor: openFaq === i ? 'rgba(15, 82, 186, 0.06)' : '#ffffff', borderColor: openFaq === i ? 'rgba(15, 82, 186, 0.3)' : '#e2e8f0' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                <span className="font-medium text-slate-900">{f.q}</span>
                <ChevronDown size={20} style={{ color: openFaq === i ? '#0F52BA' : '#64748b' }} className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#475569' }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
