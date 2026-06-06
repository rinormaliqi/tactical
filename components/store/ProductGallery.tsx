'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product } from '@/lib/types';
import ProductImage from './ProductImage';

export default function ProductGallery({ product }: { product: Product }) {
  const images = product.images ?? [];
  const [active, setActive] = useState(0);

  // No uploaded photos → fall back to the generated placeholder
  if (images.length === 0) {
    return (
      <div
        className="overflow-hidden border group"
        style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)', borderColor: 'var(--color-border)' }}
      >
        <ProductImage product={product} large />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* main image */}
      <div
        className="relative overflow-hidden border"
        style={{ aspectRatio: '1/1', borderRadius: 'var(--radius-md)', borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-soft)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={product.name_al}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* crosshair corner marks */}
        <span className="absolute top-3 left-3 w-5 h-5 pointer-events-none" style={{ borderTop: '2px solid rgba(20,19,15,0.25)', borderLeft: '2px solid rgba(20,19,15,0.25)' }} />
        <span className="absolute bottom-3 right-3 w-5 h-5 pointer-events-none" style={{ borderBottom: '2px solid rgba(20,19,15,0.25)', borderRight: '2px solid rgba(20,19,15,0.25)' }} />
      </div>

      {/* thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className="relative overflow-hidden border transition-all"
              style={{
                aspectRatio: '1/1',
                borderRadius: 'var(--radius-sm)',
                borderColor: active === i ? 'var(--color-olive)' : 'var(--color-border)',
                borderWidth: active === i ? '2px' : '1px',
                backgroundColor: 'var(--color-bg-soft)',
              }}
            >
              <Image src={img} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
