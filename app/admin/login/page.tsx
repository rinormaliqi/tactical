'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const from = params.get('from') || '/admin';
      router.replace(from);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Fjalëkalim i pasaktë');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-tactical-grid"
      style={{ backgroundColor: 'var(--color-ink)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 flex items-center justify-center mb-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <svg width="26" height="26" viewBox="0 0 18 18" fill="none">
              <polygon points="9,1 17,14 1,14" stroke="white" strokeWidth="1.5" fill="none" />
              <polygon points="9,5 14,13 4,13" fill="white" fillOpacity="0.3" />
            </svg>
          </div>
          <div className="font-display text-3xl text-white">MALI</div>
          <div className="text-[9px] tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            TACTICAL STORE — ADMIN
          </div>
        </div>

        {/* Card */}
        <div
          className="p-7"
          style={{
            backgroundColor: 'var(--color-charcoal)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <h1 className="font-display text-xl text-white mb-1">HYRJE NË PANEL</h1>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Vendosni fjalëkalimin për të vazhduar.
          </p>

          <form onSubmit={submit}>
            <label
              className="block eyebrow mb-2"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Fjalëkalimi
            </label>
            <div className="relative mb-1">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-sm outline-none text-white"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${error ? 'var(--color-sale)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 'var(--radius-sm)',
                }}
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs mt-2 mb-1" style={{ color: 'var(--color-sale)' }}>
                <AlertCircle size={12} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full mt-5 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all duration-200 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-olive)',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.08em',
              }}
            >
              {loading ? 'Duke hyrë...' : 'Hyr'}
              {!loading && <ArrowRight size={15} strokeWidth={2.25} />}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Mali Tactical Store · Ferizaj, Kosovë
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
