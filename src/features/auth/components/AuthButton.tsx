import type { ReactNode } from 'react';

type AuthButtonProps = {
  loading?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  children: ReactNode;
};

const GRADIENT = { background: 'linear-gradient(135deg, #0F52BA 0%, #3B82F6 100%)', boxShadow: '0 10px 30px rgba(15, 82, 186, 0.3)' };

/** Gradient call-to-action button used across the auth screens. */
export default function AuthButton({ loading, type = 'submit', onClick, children }: AuthButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="w-full py-2.5 text-white rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      style={GRADIENT}
    >
      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
    </button>
  );
}
