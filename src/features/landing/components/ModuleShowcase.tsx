import { useEffect, useState } from 'react';
import { modules } from '../data';

/** Auto-rotating product screenshot carousel with selector pills (pauses on hover). */
export default function ModuleShowcase() {
  const [activeModule, setActiveModule] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => setActiveModule(prev => (prev + 1) % modules.length), 4000);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div id="modules" className="mt-12 relative max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {modules.map((m, i) => {
          const isActive = activeModule === i;
          return (
            <button
              key={m.title}
              onClick={() => setActiveModule(i)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border"
              style={{
                background: isActive ? 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)' : 'rgba(255,255,255,0.04)',
                borderColor: isActive ? 'transparent' : 'rgba(255,255,255,0.1)',
                color: isActive ? '#fff' : '#cbd5e1',
                boxShadow: isActive ? '0 8px 20px rgba(0, 201, 167, 0.25)' : 'none',
              }}
            >
              <m.icon size={16} />
              {m.title}
            </button>
          );
        })}
      </div>

      <div key={`text-${activeModule}`} className="text-center max-w-2xl mx-auto mb-6" style={{ animation: 'fadeIn 0.4s ease', minHeight: '90px' }}>
        <h3 className="text-2xl sm:text-3xl font-bold text-white">{modules[activeModule].title}</h3>
        <p className="mt-3 text-base leading-relaxed" style={{ color: '#cbd5e1' }}>{modules[activeModule].desc}</p>
      </div>

      <div className="max-w-xs mx-auto mb-8 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          key={`bar-${activeModule}-${isHovered}`}
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #0F52BA, #00C9A7)', animation: isHovered ? 'none' : 'moduleProgress 4s linear', transformOrigin: 'left', width: '100%' }}
        />
      </div>

      <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className="absolute -inset-px rounded-3xl blur opacity-50" style={{ background: 'linear-gradient(135deg, #0F52BA, #00C9A7)' }} />
        <div className="relative rounded-3xl border backdrop-blur-xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'rgba(15, 28, 48, 0.9)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ backgroundColor: 'rgba(15, 28, 48, 0.8)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
            </div>
            <span className="text-xs ml-3 font-mono" style={{ color: '#94a3b8' }}>app.dealersetu.com</span>
          </div>
          <img key={`img-${activeModule}`} src={modules[activeModule].image} alt={modules[activeModule].title} className="w-full h-auto block" style={{ animation: 'fadeIn 0.4s ease' }} />
        </div>
      </div>
    </div>
  );
}
