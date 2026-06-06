'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X, ChevronRight, Search, Heart, User, Flame, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/CartContext';
import { useLang } from '@/lib/LanguageContext';

export default function Header({ transparent = false }: { transparent?: boolean }) {
  const { count } = useCart();
  const { lang, setLang, tr } = useLang();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const dark = transparent && !scrolled; // light text over dark hero
  const text = dark ? 'rgba(255,255,255,0.92)' : 'var(--color-text)';
  const muted = dark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)';
  const border = dark ? 'rgba(255,255,255,0.14)' : 'var(--color-border)';

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/products?search=${encodeURIComponent(query.trim())}` : '/products');
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
        style={{
          backgroundColor: dark ? 'transparent' : 'rgba(255,255,255,0.98)',
          backdropFilter: dark ? 'none' : 'blur(10px)',
          borderBottom: `1px solid ${dark ? 'transparent' : 'var(--color-border)'}`,
          boxShadow: dark ? 'none' : '0 1px 16px rgba(20,19,15,0.05)',
        }}
      >
        {/* Top row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-8 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div
                className="w-9 h-9 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'var(--color-olive-dark)' }}
              >
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <polygon points="9,1 17,14 1,14" stroke="white" strokeWidth="1.5" fill="none" />
                  <polygon points="9,5 14,13 4,13" fill="white" fillOpacity="0.3" />
                  <line x1="9" y1="1" x2="9" y2="14" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />
                </svg>
              </div>
              <div className="leading-none">
                <div className="font-display text-2xl" style={{ color: text, fontSize: '1.4rem' }}>MALI</div>
                <div className="text-[8px] tracking-[0.25em]" style={{ color: muted, marginTop: '1px' }}>TACTICAL STORE</div>
              </div>
            </Link>

            {/* Search bar (desktop) */}
            <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-2xl">
              <div className="flex w-full" style={{ border: `1px solid ${border}`, borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'var(--color-bg-soft)' }}>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={tr('products_search')}
                  className="flex-1 px-4 py-2.5 bg-transparent text-sm outline-none"
                  style={{ color: text }}
                />
                <button
                  type="submit"
                  className="px-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[var(--color-olive-dark)]"
                  style={{ backgroundColor: 'var(--color-olive)', letterSpacing: '0.08em' }}
                >
                  <Search size={14} strokeWidth={2.25} />
                  <span className="hidden lg:inline chevrons">{tr('search')}</span>
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0 shrink-0">
              {/* lang */}
              <button
                onClick={() => setLang(lang === 'al' ? 'en' : 'al')}
                className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium transition-opacity hover:opacity-100"
                style={{ color: muted }}
                title="Switch language"
              >
                <span style={{ color: lang === 'al' ? 'var(--color-gold)' : muted, fontWeight: lang === 'al' ? 700 : 400 }}>AL</span>
                <span style={{ opacity: 0.4 }}>/</span>
                <span style={{ color: lang === 'en' ? 'var(--color-gold)' : muted, fontWeight: lang === 'en' ? 700 : 400 }}>EN</span>
              </button>

              <IconBtn label="Account" color={text}><User size={19} strokeWidth={1.6} /></IconBtn>
              <IconBtn label="Wishlist" color={text} badge={0}><Heart size={19} strokeWidth={1.6} /></IconBtn>

              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 transition-colors"
                style={{ color: text }}
              >
                <ShoppingCart size={19} strokeWidth={1.6} />
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-0.5 right-0 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: 'var(--color-gold)', minWidth: '17px', height: '17px', padding: '0 4px', borderRadius: '99px' }}
                  >
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </Link>

              <button
                className="md:hidden flex items-center justify-center w-10 h-10"
                style={{ color: text }}
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom nav row (desktop) */}
        <div className="hidden md:block" style={{ borderTop: `1px solid ${border}` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-11">
              <nav className="flex items-center gap-7">
                <NavLink href="/" color={text} muted={muted}>{tr('nav_home')}</NavLink>
                <NavLink href="/products" color={text} muted={muted}>{tr('nav_products')}</NavLink>
                <NavLink href="/products?category=vests" color={text} muted={muted}>{lang === 'al' ? 'Jelekë' : 'Vests'}</NavLink>
                <NavLink href="/products?category=bags" color={text} muted={muted}>{lang === 'al' ? 'Çanta' : 'Bags'}</NavLink>
                <NavLink href="/products?category=uniforms" color={text} muted={muted}>{lang === 'al' ? 'Uniforma' : 'Uniforms'}</NavLink>
              </nav>

              <div className="flex items-center gap-5">
                <Link href="/products?sort=newest" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80" style={{ color: 'var(--color-gold)', letterSpacing: '0.08em' }}>
                  <Flame size={13} strokeWidth={2} />
                  {lang === 'al' ? 'Ofertat' : 'Hot Deals'}
                </Link>
                <span style={{ color: border }}>|</span>
                <Link href="/products" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-80" style={{ color: 'var(--color-sale)', letterSpacing: '0.08em' }}>
                  <Tag size={13} strokeWidth={2} />
                  {lang === 'al' ? 'Zbritje' : 'Clearance'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-0 top-16 z-40 md:hidden border-b"
            style={{ backgroundColor: 'white', borderColor: 'var(--color-border)' }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              <form onSubmit={submitSearch} className="flex mb-3" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={tr('products_search')}
                  className="flex-1 px-3 py-2.5 text-sm outline-none"
                  style={{ color: 'var(--color-text)' }}
                />
                <button type="submit" className="px-4 text-white" style={{ backgroundColor: 'var(--color-olive)' }}>
                  <Search size={16} />
                </button>
              </form>
              <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>{tr('nav_home')}</MobileNavLink>
              <MobileNavLink href="/products" onClick={() => setMobileOpen(false)}>{tr('nav_products')}</MobileNavLink>
              <MobileNavLink href="/products?sort=newest" onClick={() => setMobileOpen(false)}>{lang === 'al' ? 'Ofertat' : 'Hot Deals'}</MobileNavLink>
              <div className="pt-3 mt-1 border-t flex items-center gap-3" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Gjuha:</span>
                <button onClick={() => { setLang('al'); }} className="text-sm font-medium px-3 py-1" style={{ backgroundColor: lang === 'al' ? 'var(--color-olive)' : 'transparent', color: lang === 'al' ? 'white' : 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }}>Shqip</button>
                <button onClick={() => { setLang('en'); }} className="text-sm font-medium px-3 py-1" style={{ backgroundColor: lang === 'en' ? 'var(--color-olive)' : 'transparent', color: lang === 'en' ? 'white' : 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)' }}>English</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IconBtn({ children, label, color, badge }: { children: React.ReactNode; label: string; color: string; badge?: number }) {
  return (
    <button className="hidden sm:flex relative items-center justify-center w-10 h-10 transition-colors" style={{ color }} title={label} aria-label={label}>
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-0.5 right-0 flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--color-gold)', minWidth: '17px', height: '17px', borderRadius: '99px' }}>{badge}</span>
      )}
    </button>
  );
}

function NavLink({ href, color, muted, children }: { href: string; color: string; muted: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group relative text-[13px] font-semibold uppercase tracking-wide transition-colors" style={{ color: muted, letterSpacing: '0.06em' }}>
      <span className="group-hover:text-[color:var(--hover)]" style={{ ['--hover' as string]: color, transition: 'color .15s' }}>{children}</span>
      <span className="absolute -bottom-[14px] left-0 w-0 h-0.5 group-hover:w-full transition-all duration-200" style={{ backgroundColor: 'var(--color-gold)' }} />
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center justify-between px-3 py-3 font-semibold text-sm uppercase tracking-wide transition-colors hover:bg-black/5" style={{ color: 'var(--color-text)', borderRadius: 'var(--radius-sm)' }}>
      {children}
      <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
    </Link>
  );
}
