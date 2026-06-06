'use client';

import Image from 'next/image';
import { type Product } from '@/lib/types';

// Each category gets a tint + a representative silhouette icon
const CATEGORY_META: Record<string, { tint: string; icon: React.ReactNode }> = {
  vests: {
    tint: '#5B6A38',
    icon: <path d="M40 14h44l-8 18v40a6 6 0 0 1-6 6H54a6 6 0 0 1-6-6V32l-8-18zM62 14v76M48 40h28" />,
  },
  bags: {
    tint: '#3E4A5C',
    icon: <path d="M38 38a14 14 0 0 1 14-14h20a14 14 0 0 1 14 14v44a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6V38zM50 24v-4a12 12 0 0 1 24 0v4M44 56h36" />,
  },
  uniforms: {
    tint: '#6E5A30',
    icon: <path d="M76 16l16 6-6 16-8-3v44a4 4 0 0 1-4 4H50a4 4 0 0 1-4-4V35l-8 3-6-16 16-6a14 14 0 0 0 28 0z" />,
  },
  equipment: {
    tint: '#4A4A5C',
    icon: <path d="M58 22a12 12 0 0 1 12 12 12 12 0 0 1-3.5 8.5L86 62l-8 8-19.5-19.5A12 12 0 0 1 46 47 12 12 0 0 1 58 22zM42 78l16-16M30 90l14-14" />,
  },
  accessories: {
    tint: '#5C4A5C',
    icon: <path d="M62 18l44 0M62 18 26 88M62 18 98 88M44 53h36" transform="scale(0.85) translate(8 6)" />,
  },
};

const DEFAULT_META = {
  tint: '#54534D',
  icon: <path d="M62 22 96 42v40L62 102 28 82V42z M62 22v80 M28 42l34 20 34-20" />,
};

export default function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  // Render the real product photo when one has been uploaded
  const photo = product.images?.[0];
  if (photo) {
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
        <Image
          src={photo}
          alt={product.name_al}
          fill
          sizes={large ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 640px) 50vw, 25vw'}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
    );
  }

  const meta = CATEGORY_META[product.category_slug ?? ''] ?? DEFAULT_META;

  const initials = product.slug
    .split('-')
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className="w-full h-full relative overflow-hidden transition-transform duration-700 group-hover:scale-[1.04]"
      style={{
        background: 'radial-gradient(circle at 50% 38%, #FFFFFF 0%, var(--color-bg-soft) 78%)',
      }}
    >
      {/* faint tactical grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(20,19,15,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20,19,15,0.025) 1px, transparent 1px)`,
          backgroundSize: '26px 26px',
        }}
      />

      {/* category silhouette */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width={large ? 200 : 124}
          height={large ? 200 : 124}
          viewBox="0 0 124 124"
          fill="none"
          stroke={meta.tint}
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.34 }}
        >
          {meta.icon}
        </svg>
      </div>

      {/* watermark monogram */}
      <div
        className="absolute bottom-3 right-4 font-display select-none"
        style={{ color: meta.tint, opacity: 0.1, fontSize: large ? '5rem' : '3rem', lineHeight: 1 }}
      >
        {initials}
      </div>

      {/* crosshair corner marks */}
      <span className="absolute top-3 left-3 w-5 h-5" style={{ borderTop: `2px solid ${meta.tint}`, borderLeft: `2px solid ${meta.tint}`, opacity: 0.45 }} />
      <span className="absolute bottom-3 left-3 w-5 h-5" style={{ borderBottom: `2px solid ${meta.tint}`, borderLeft: `2px solid ${meta.tint}`, opacity: 0.45 }} />
    </div>
  );
}
