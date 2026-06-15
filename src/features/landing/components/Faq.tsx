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
          <Eyebrow label="FAQ" style={{ ...PILL_BLUE, color: '#00C9A7' }} />
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Frequently asked questions</h2>
          <p className="mt-6 text-lg" style={{ color: '#94a3b8' }}>Can't find what you're looking for? Contact us.</p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl border transition" style={{ backgroundColor: openFaq === i ? 'rgba(0, 201, 167, 0.06)' : 'rgba(15, 28, 48, 0.5)', borderColor: openFaq === i ? 'rgba(0, 201, 167, 0.3)' : 'rgba(255,255,255,0.08)' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                <span className="font-medium text-white">{f.q}</span>
                <ChevronDown size={20} style={{ color: openFaq === i ? '#00C9A7' : '#94a3b8' }} className={`transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
