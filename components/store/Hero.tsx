'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, Headphones, RefreshCw } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Drop your photo at /public/hero.jpg (or change this path). */
const HERO_IMAGE = '/hero.jpg';

export default function Hero() {
  const { lang, tr } = useLang();

  const line1 = lang === 'al' ? 'GATI PËR' : 'READY FOR';
  const line2 = lang === 'al' ? 'ÇDO MISION' : 'ANY MISSION';

  const features = [
    { icon: Truck, al: 'Dërgim i shpejtë', en: 'Fast delivery' },
    { icon: ShieldCheck, al: 'Garanci cilësie', en: 'Quality guarantee' },
    { icon: RefreshCw, al: 'Kthim i lehtë', en: 'Easy returns' },
    { icon: Headphones, al: 'Mbështetje 24/7', en: '24/7 support' },
  ];

  return (
    <section className="relative flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-ink)', minHeight: '100vh' }}>
      {/* Background photo */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease }}
        className="absolute inset-0"
      >
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_center] select-none pointer-events-none"
        />
      </motion.div>

      {/* Scrims for legibility */}
      {/* left → right darken so the text column stays readable */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(13,13,10,0.94) 0%, rgba(13,13,10,0.82) 28%, rgba(13,13,10,0.45) 58%, rgba(13,13,10,0.2) 100%)' }}
      />
      {/* top (header blend) + bottom (feature-strip blend) */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(13,13,10,0.8) 0%, transparent 20%, transparent 60%, var(--color-ink) 100%)' }}
      />
      {/* subtle olive wash + tactical grid for brand texture */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 22% 42%, rgba(91,106,56,0.20) 0%, transparent 65%)' }}
      />
      <div className="absolute inset-0 bg-tactical-grid opacity-30" />

      {/* content */}
      <div className="relative flex-1 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-36 pb-24 lg:pt-28">
          <div className="max-w-2xl">
            {/* eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
              className="inline-flex items-center gap-2.5 mb-7"
            >
              <span className="h-px w-8" style={{ backgroundColor: 'var(--color-gold)' }} />
              <span className="eyebrow" style={{ color: 'var(--color-gold)' }}>
                {lang === 'al' ? 'Tani në stok' : 'Now in stock'}
              </span>
            </motion.div>

            {/* headline */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.18 }}
                className="font-display text-white"
                style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', textShadow: '0 2px 24px rgba(0,0,0,0.45)' }}
              >
                {line1}
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.26 }}
                className="font-display"
                style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: 'var(--color-olive-mid)', textShadow: '0 2px 24px rgba(0,0,0,0.45)' }}
              >
                {line2}
              </motion.h1>
            </div>

            {/* subcopy */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.4 }}
              className="mt-6 text-base sm:text-lg max-w-lg"
              style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}
            >
              {lang === 'al'
                ? 'Jelekë, çanta, uniforma dhe pajisje taktike të klasit profesional — të testuara në terren, gati për çdo sfidë.'
                : 'Professional-grade vests, bags, uniforms and tactical equipment — field-tested and ready for any challenge.'}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/products"
                className="group inline-flex items-center gap-2.5 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all duration-200 hover:gap-4"
                style={{ backgroundColor: 'var(--color-olive)', borderRadius: 'var(--radius-sm)', letterSpacing: '0.08em' }}
              >
                {tr('hero_cta_primary')}
                <ArrowRight size={16} strokeWidth={2.25} />
              </Link>
              <Link
                href="/products?sort=newest"
                className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:bg-white/10"
                style={{ color: 'white', border: '1px solid rgba(255,255,255,0.45)', borderRadius: 'var(--radius-sm)', letterSpacing: '0.08em', backdropFilter: 'blur(2px)' }}
              >
                {lang === 'al' ? 'Të rejat' : 'New arrivals'}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* feature strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="relative border-t"
        style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(13,13,10,0.65)', backdropFilter: 'blur(6px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, al, en }, i) => (
              <div
                key={al}
                className="flex items-center gap-3 py-5 lg:px-6"
                style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                <Icon size={20} style={{ color: 'var(--color-gold)' }} strokeWidth={1.6} />
                <span className="text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {lang === 'al' ? al : en}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
