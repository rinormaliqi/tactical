'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Layers, ExternalLink, Menu, X, LogOut, BarChart3, Store } from 'lucide-react';
import { useState } from 'react';
import { useLang } from '@/lib/LanguageContext';
import { type TranslationKey } from '@/lib/i18n';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, key: 'admin_dashboard' as const },
  { href: '/admin/orders', icon: ShoppingBag, key: 'admin_orders' as const },
  { href: '/admin/sales', icon: Store, key: 'admin_sales' as const },
  { href: '/admin/reports', icon: BarChart3, key: 'admin_reports' as const },
  { href: '/admin/products', icon: Package, key: 'admin_products' as const },
  { href: '/admin/inventory', icon: Layers, key: 'admin_inventory' as const },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { tr } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  // The login page renders without the admin chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const logout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar — desktop */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 border-r no-print"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border)',
        }}
      >
        <SidebarContent pathname={pathname} tr={tr} />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="flex flex-col w-60 border-r"
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <span className="font-heading font-700 text-sm" style={{ fontWeight: 700, letterSpacing: '0.1em' }}>ADMIN</span>
              <button onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <SidebarContent pathname={pathname} tr={tr} onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 h-14 border-b shrink-0 no-print"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Menu size={20} />
            </button>
            <span
              className="font-heading text-sm font-700 uppercase tracking-widest"
              style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.15em' }}
            >
              MALI TACTICAL — ADMIN
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs transition-colors hover:text-[var(--color-olive)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ExternalLink size={13} />
              Dyqani
            </Link>
            <span className="w-px h-4" style={{ backgroundColor: 'var(--color-border)' }} />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[var(--color-sale)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <LogOut size={13} />
              Dil
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  tr,
  onNavigate,
}: {
  pathname: string;
  tr: (k: TranslationKey) => string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-olive-dark)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <polygon points="9,1 17,14 1,14" stroke="white" strokeWidth="1.5" fill="none"/>
              <polygon points="9,5 14,13 4,13" fill="white" fillOpacity="0.3"/>
            </svg>
          </div>
          <div>
            <div className="font-heading font-800 text-sm" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>MALI</div>
            <div className="text-[9px] tracking-widest" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.2em' }}>TACTICAL STORE</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div
          className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3"
          style={{ color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}
        >
          Navigimi
        </div>
        {navItems.map(({ href, icon: Icon, key }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                backgroundColor: active ? 'var(--color-olive-light)' : 'transparent',
                color: active ? 'var(--color-olive-dark)' : 'var(--color-text-muted)',
              }}
            >
              <Icon size={16} strokeWidth={1.75} />
              {tr(key)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          043 999 987
        </div>
        <div className="text-xs" style={{ color: 'var(--color-border-strong)' }}>
          Ferizaj, Kosovë
        </div>
      </div>
    </>
  );
}
