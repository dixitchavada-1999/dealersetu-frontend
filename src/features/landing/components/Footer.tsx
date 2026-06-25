import { Link } from 'react-router-dom';
import { ShoppingBag, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
import BrandLogo from '../../../components/BrandLogo';

// Matches the landing navbar so header & footer share the same brand color.
const FOOTER_GRADIENT = 'linear-gradient(135deg, #0A2A6B 0%, #0F52BA 100%)';

const COLUMNS = [
  { title: 'Product', links: ['Features', 'Pricing', 'Mobile App', 'Changelog'] },
  { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
  { title: 'Resources', links: ['Docs', 'Help Center', 'API', 'Status'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
];

/** Landing footer with brand, social links, and link columns. */
export default function Footer() {
  return (
    <footer className="border-t border-white/10" style={{ background: FOOTER_GRADIENT }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16" style={{ color: 'rgba(255,255,255,0.78)' }}>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 sm:gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 font-bold text-xl text-white">
              <BrandLogo variant="dark" imgClassName="h-11 w-auto" fallback={
                <>
                  <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)' }}><ShoppingBag size={20} /></span>
                  <span>DealerSetu</span>
                </>
              } />
            </Link>
            <p className="mt-4 text-sm max-w-xs">The all-in-one B2B commerce platform for wholesalers, distributors, and manufacturers.</p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl flex items-center justify-center transition hover:bg-white/20 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-white text-sm">{col.title}</h4>
              <ul className="mt-4 space-y-2">
                {col.links.map(l => <li key={l}><a href="#" className="text-sm transition hover:text-white">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 sm:mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2026 DealerSetu. All rights reserved.</p>
          <p className="text-sm">Made with <span style={{ color: '#00C9A7' }}>♥</span> in India</p>
        </div>
      </div>
    </footer>
  );
}
