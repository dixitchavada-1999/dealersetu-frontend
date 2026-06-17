import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { navLinks } from '../data';

/** Sticky landing navbar with desktop links and a mobile menu. */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-slate-200" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-bold text-2xl text-slate-900">
          <span className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', boxShadow: '0 8px 24px rgba(0, 201, 167, 0.3)' }}>
            <ShoppingBag size={22} className="text-white" />
          </span>
          <span>Dealer<span style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Setu</span></span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setActiveNav(l.key)} className="relative text-sm font-medium transition py-2" style={{ color: activeNav === l.key ? '#0F52BA' : '#475569' }}>
              {l.label}
              {activeNav === l.key && <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #0F52BA, #3B82F6)' }} />}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium transition hover:text-slate-900" style={{ color: '#475569' }}>Sign in</Link>
          <Link to="/register" className="text-sm text-white px-6 py-3 rounded-full font-medium transition hover:opacity-90" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #3B82F6 100%)' }}>
            Get in Touch
          </Link>
        </div>

        <button className="lg:hidden text-slate-900" onClick={() => setMenuOpen(!menuOpen)} aria-label="menu">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {menuOpen && (
        <div className="lg:hidden border-t border-slate-200 px-4 py-4 space-y-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block" style={{ color: '#475569' }}>{l.label}</a>
          ))}
          <div className="flex gap-3 pt-3 border-t border-slate-200">
            <Link to="/login" className="flex-1 text-center py-2 border border-slate-300 rounded-full text-slate-700">Sign in</Link>
            <Link to="/register" className="flex-1 text-center py-2 rounded-full text-white" style={{ background: 'linear-gradient(135deg, #0F52BA 0%, #3B82F6 100%)' }}>Get in Touch</Link>
          </div>
        </div>
      )}
    </header>
  );
}
