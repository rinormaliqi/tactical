'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, Check, Heart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Product } from '@/lib/types';
import { useCart } from '@/lib/CartContext';
import { useLang } from '@/lib/LanguageContext';
import ProductImage from './ProductImage';
import Stars from '@/components/ui/Stars';

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { add } = useCart();
  const { lang, tr } = useLang();
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  const name = lang === 'al' ? product.name_al : product.name_en;
  const isOutOfStock = product.stock === 0;
  const onSale = !!product.old_price && product.old_price > product.price;
  const discount = onSale ? Math.round((1 - product.price / (product.old_price as number)) * 100) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || added) return;
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link href={`/products/${product.slug}`} className="group block h-full">
        <div
          className="h-full flex flex-col border transition-all duration-300 group-hover:shadow-[0_12px_40px_-12px_rgba(20,19,15,0.25)] group-hover:border-[var(--color-border-strong)]"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Image */}
          <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
            <ProductImage product={product} />

            {/* top-left badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
              {onSale && (
                <span
                  className="text-[10px] font-bold px-2 py-1 text-white"
                  style={{ backgroundColor: 'var(--color-sale)', borderRadius: 'var(--radius-sm)', letterSpacing: '0.04em' }}
                >
                  -{discount}%
                </span>
              )}
              {product.is_new && (
                <span
                  className="text-[10px] font-bold px-2 py-1"
                  style={{ backgroundColor: 'var(--color-ink)', color: 'white', borderRadius: 'var(--radius-sm)', letterSpacing: '0.08em' }}
                >
                  {tr('new_arrivals').toUpperCase()}
                </span>
              )}
            </div>

            {/* hover action rail */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <button
                onClick={(e) => { e.preventDefault(); setWished(v => !v); }}
                className="w-8 h-8 flex items-center justify-center bg-white shadow-sm transition-colors hover:bg-[var(--color-olive)] hover:text-white"
                style={{ borderRadius: 'var(--radius-sm)', color: wished ? 'var(--color-sale)' : 'var(--color-text-muted)' }}
                title="Wishlist"
              >
                <Heart size={14} strokeWidth={1.75} fill={wished ? 'var(--color-sale)' : 'transparent'} />
              </button>
              <span
                className="w-8 h-8 flex items-center justify-center bg-white shadow-sm transition-colors group-hover/icon:bg-[var(--color-olive)]"
                style={{ borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)' }}
                title={tr('product_details')}
              >
                <Eye size={14} strokeWidth={1.75} />
              </span>
            </div>

            {/* out of stock overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(250,250,248,0.72)' }}>
                <span
                  className="font-heading text-xs font-700 px-3 py-1.5 border"
                  style={{ backgroundColor: 'white', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-muted)', letterSpacing: '0.12em', borderRadius: 'var(--radius-sm)' }}
                >
                  {tr('product_out_of_stock').toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {/* category */}
            {product.category_name_al && (
              <div className="eyebrow mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                {lang === 'al' ? product.category_name_al : product.category_name_en}
              </div>
            )}

            {/* name */}
            <h3 className="font-medium text-[15px] leading-snug mb-2" style={{ color: 'var(--color-text)' }}>
              {name}
            </h3>

            {/* rating */}
            <div className="mb-3">
              <Stars rating={product.rating} count={product.review_count} size={12} />
            </div>

            {/* price + cart */}
            <div className="mt-auto flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span
                  className="font-display text-xl"
                  style={{ color: onSale ? 'var(--color-sale)' : 'var(--color-text)' }}
                >
                  €{product.price.toFixed(2)}
                </span>
                {onSale && (
                  <span className="text-sm line-through" style={{ color: 'var(--color-border-strong)' }}>
                    €{(product.old_price as number).toFixed(2)}
                  </span>
                )}
              </div>

              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: added ? 'var(--color-olive)' : 'transparent',
                  color: added ? 'white' : 'var(--color-olive)',
                  borderColor: 'var(--color-olive)',
                }}
              >
                {added ? (
                  <><Check size={13} strokeWidth={2.5} /> {tr('product_added')}</>
                ) : (
                  <><ShoppingCart size={13} strokeWidth={2} /> <span className="hidden sm:inline">{tr('product_add_cart')}</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
