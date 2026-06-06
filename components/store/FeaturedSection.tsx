'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Product, type Category } from '@/lib/types';
import ProductCard from './ProductCard';
import { useLang } from '@/lib/LanguageContext';

const ease = [0.16, 1, 0.3, 1];

export default function FeaturedSection() {
  const { lang } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/products?featured=1').then(r => r.json()).then(setProducts).catch(() => {});
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  // three lifestyle segments à la Tactiko
  const segments = [
    { slug: 'vests', al: 'TAKTIKE', en: 'TACTICAL', from: '#3D4826', to: '#5B6A38' },
    { slug: 'uniforms', al: 'USHTARAKE', en: 'MILITARY', from: '#1E1D18', to: '#3A382E' },
    { slug: 'bags', al: 'OUTDOOR', en: 'OUTDOOR', from: '#2C3A2A', to: '#46583F' },
  ];

  return (
    <>
      {/* ── Segment triptych ── */}
      <section className="grid grid-cols-1 md:grid-cols-3">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease, delay: i * 0.1 }}
          >
            <Link
              href={`/products?category=${seg.slug}`}
              className="group relative flex items-center justify-center overflow-hidden"
              style={{ minHeight: '440px', background: `linear-gradient(150deg, ${seg.from} 0%, ${seg.to} 100%)` }}
            >
              <div className="absolute inset-0 bg-tactical-grid opacity-60 transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 70%, rgba(0,0,0,0.35) 0%, transparent 70%)' }} />
              <div className="relative text-center px-6">
                <div className="eyebrow mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {lang === 'al' ? 'Koleksioni' : 'Collection'}
                </div>
                <h3 className="font-display text-white mb-5" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}>
                  {lang === 'al' ? seg.al : seg.en}
                </h3>
                <span
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white pb-1 transition-all"
                  style={{ borderBottom: '2px solid var(--color-gold)', letterSpacing: '0.1em' }}
                >
                  {lang === 'al' ? 'Shfleto' : 'Shop now'}
                  <ArrowUpRight size={14} strokeWidth={2.25} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* ── Bestsellers ── */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="flex flex-wrap items-end justify-between gap-4 mb-10"
          >
            <div>
              <div className="eyebrow mb-2" style={{ color: 'var(--color-olive)' }}>
                {lang === 'al' ? 'Më të shiturat' : 'Bestsellers'}
              </div>
              <h2 className="font-display" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: 'var(--color-text)' }}>
                {lang === 'al' ? 'PRODUKTET KRYESORE' : 'TOP PRODUCTS'}
              </h2>
            </div>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:gap-3"
              style={{ backgroundColor: 'var(--color-ink)', borderRadius: 'var(--radius-sm)', letterSpacing: '0.08em' }}
            >
              {lang === 'al' ? 'Shiko të gjitha' : 'See all products'}
              <ArrowRight size={14} strokeWidth={2.25} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Popular categories (dark block) ── */}
      <section style={{ backgroundColor: 'var(--color-ink)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* intro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="lg:col-span-4 flex flex-col justify-center"
            >
              <div className="eyebrow mb-3" style={{ color: 'var(--color-gold)' }}>
                {lang === 'al' ? 'Eksploro' : 'Explore'}
              </div>
              <h2 className="font-display text-white mb-5" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}>
                {lang === 'al' ? 'KATEGORITË POPULLORE' : 'POPULAR CATEGORIES'}
              </h2>
              <p className="text-sm mb-8 max-w-sm" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                {lang === 'al'
                  ? 'Gjej pajisjet që të duhen, të ndara sipas kategorive për një blerje të shpejtë dhe të saktë.'
                  : 'Find the gear you need, organized by category for fast and precise shopping.'}
              </p>
              <Link
                href="/products"
                className="self-start inline-flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:gap-3"
                style={{ border: '1px solid rgba(255,255,255,0.25)', borderRadius: 'var(--radius-sm)', letterSpacing: '0.08em' }}
              >
                {lang === 'al' ? 'Të gjitha kategoritë' : 'All categories'}
                <ArrowRight size={14} strokeWidth={2.25} />
              </Link>
            </motion.div>

            {/* category tiles */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, ease, delay: i * 0.06 }}
                  className={i === 0 ? 'col-span-2 sm:col-span-3' : ''}
                >
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="group relative flex items-end overflow-hidden p-5"
                    style={{
                      minHeight: i === 0 ? '180px' : '150px',
                      background: 'linear-gradient(155deg, var(--color-charcoal) 0%, var(--color-charcoal-light) 100%)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div className="absolute inset-0 bg-tactical-grid opacity-50 transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 right-4 transition-all duration-300 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight size={18} style={{ color: 'var(--color-gold)' }} strokeWidth={2} />
                    </div>
                    <div className="relative">
                      <div className="font-display text-white" style={{ fontSize: i === 0 ? '1.9rem' : '1.4rem' }}>
                        {lang === 'al' ? cat.name_al : cat.name_en}
                      </div>
                      <div className="text-[11px] uppercase tracking-widest mt-1" style={{ color: 'var(--color-olive-mid)', letterSpacing: '0.15em' }}>
                        {lang === 'al' ? 'Shfleto' : 'Browse'}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
