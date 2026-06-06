'use client';

import Link from 'next/link';
import { MapPin, Phone, Clock } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const FacebookIcon = (p: { size?: number }) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.300000000000001c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
  </svg>
);

const InstagramIcon = (p: { size?: number }) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

export default function Footer() {
  const { lang } = useLang();

  const columns = [
    {
      title: lang === 'al' ? 'Dyqani' : 'Shop',
      links: [
        { label: lang === 'al' ? 'Jelekë & Mbrojtje' : 'Vests & Protection', href: '/products?category=vests' },
        { label: lang === 'al' ? 'Çanta Taktike' : 'Tactical Bags', href: '/products?category=bags' },
        { label: lang === 'al' ? 'Uniforma' : 'Uniforms', href: '/products?category=uniforms' },
        { label: lang === 'al' ? 'Pajisje' : 'Equipment', href: '/products?category=equipment' },
        { label: lang === 'al' ? 'Aksesorë' : 'Accessories', href: '/products?category=accessories' },
      ],
    },
    {
      title: lang === 'al' ? 'Informacion' : 'Information',
      links: [
        { label: lang === 'al' ? 'Rreth Nesh' : 'About Us', href: '#' },
        { label: lang === 'al' ? 'Si të porosis' : 'How to Order', href: '#' },
        { label: lang === 'al' ? 'Dërgesa & Pagesa' : 'Shipping & Payment', href: '#' },
        { label: lang === 'al' ? 'Kthimet' : 'Returns', href: '#' },
        { label: lang === 'al' ? 'Kontakt' : 'Contact', href: '#' },
      ],
    },
    {
      title: lang === 'al' ? 'Llogaria Ime' : 'My Account',
      links: [
        { label: lang === 'al' ? 'Shporta' : 'Cart', href: '/cart' },
        { label: lang === 'al' ? 'Porositë e mia' : 'My Orders', href: '#' },
        { label: lang === 'al' ? 'Lista e dëshirave' : 'Wishlist', href: '#' },
        { label: 'Admin', href: '/admin' },
      ],
    },
  ];

  const payments = ['VISA', 'MASTERCARD', 'PAYPAL', 'CASH'];

  return (
    <footer style={{ backgroundColor: 'var(--color-ink)', color: 'rgba(255,255,255,0.7)' }}>
      {/* gold hazard strip */}
      <div className="h-1 bg-hazard opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand + contact */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <polygon points="9,1 17,14 1,14" stroke="white" strokeWidth="1.5" fill="none" />
                  <polygon points="9,5 14,13 4,13" fill="white" fillOpacity="0.3" />
                </svg>
              </div>
              <div>
                <div className="font-display text-2xl text-white" style={{ fontSize: '1.4rem' }}>MALI</div>
                <div className="text-[8px] tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.45)' }}>TACTICAL STORE</div>
              </div>
            </div>
            <p className="text-sm mb-6 max-w-sm" style={{ lineHeight: 1.7 }}>
              {lang === 'al'
                ? 'Pajisje taktike profesionale për ata që kërkojnë cilësi, qëndrueshmëri dhe besueshmëri në çdo mision.'
                : 'Professional tactical gear for those who demand quality, durability and reliability on every mission.'}
            </p>

            <div className="space-y-3">
              <a href="tel:043999987" className="flex items-center gap-3 text-sm transition-colors hover:text-[var(--color-gold)]">
                <Phone size={15} style={{ color: 'var(--color-gold)' }} />
                <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>043 999 987</span>
              </a>
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-gold)' }} />
                <span>Remzi Hoxha 78, Ferizaj, Kosovë 70000</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={15} style={{ color: 'var(--color-gold)' }} />
                <span>{lang === 'al' ? 'E Hënë – E Shtunë · 09:00–18:00' : 'Mon – Sat · 09:00–18:00'}</span>
              </div>
            </div>

            {/* socials */}
            <div className="flex items-center gap-2.5 mt-6">
              {[FacebookIcon, InstagramIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 flex items-center justify-center transition-colors hover:bg-[var(--color-olive)]"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map(col => (
            <div key={col.title} className="lg:col-span-2">
              <h4 className="font-heading text-sm font-700 mb-4 text-white" style={{ fontWeight: 700, letterSpacing: '0.08em' }}>
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm transition-colors hover:text-[var(--color-gold)]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / payments */}
          <div className="lg:col-span-2">
            <h4 className="font-heading text-sm font-700 mb-4 text-white" style={{ fontWeight: 700, letterSpacing: '0.08em' }}>
              {lang === 'al' ? 'Pagesa' : 'Payment'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {payments.map(p => (
                <span
                  key={p}
                  className="text-[9px] font-bold px-2 py-1.5 tracking-wider"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-xs)', letterSpacing: '0.06em' }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            © {new Date().getFullYear()} Mali Tactical Store. {lang === 'al' ? 'Të gjitha të drejtat të rezervuara.' : 'All rights reserved.'}
          </p>
          <Link href="/admin" className="text-xs transition-colors hover:text-[var(--color-gold)]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
