'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, ShoppingCart, Check, Minus, Plus, Package, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import ProductGallery from '@/components/store/ProductGallery';
import Stars from '@/components/ui/Stars';
import { type Product } from '@/lib/types';
import { useCart } from '@/lib/CartContext';
import { useLang } from '@/lib/LanguageContext';

const ease = [0.16, 1, 0.3, 1];

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { lang, tr } = useLang();
  const { add } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(p => {
        setProduct(p);
        setLoading(false);
        if (p?.category_slug) {
          fetch(`/api/products?category=${p.category_slug}`)
            .then(r => r.json())
            .then((all: Product[]) => setRelated(all.filter(x => x.slug !== slug).slice(0, 4)));
        }
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleAdd = () => {
    if (!product || product.stock === 0 || added) return;
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-16" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="img-shimmer rounded-2xl" style={{ aspectRatio: '4/3' }} />
              <div className="space-y-4 pt-8">
                <div className="img-shimmer h-4 rounded-full w-1/4" />
                <div className="img-shimmer h-8 rounded-full w-3/4" />
                <div className="img-shimmer h-6 rounded-full w-1/3" />
                <div className="img-shimmer h-20 rounded-xl w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium mb-2" style={{ color: 'var(--color-text)' }}>Produkti nuk u gjet</h1>
            <Link href="/products" className="text-sm" style={{ color: 'var(--color-olive)' }}>
              {tr('nav_products')}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const name = lang === 'al' ? product.name_al : product.name_en;
  const description = lang === 'al' ? product.description_al : product.description_en;
  const isOutOfStock = product.stock === 0;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 mb-10"
          >
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--color-olive)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ChevronLeft size={15} />
              {tr('nav_products')}
            </Link>
            <span style={{ color: 'var(--color-border-strong)' }}>/</span>
            <span className="text-sm" style={{ color: 'var(--color-text)' }}>{name}</span>
          </motion.div>

          {/* Product */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              <ProductGallery product={product} />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              {/* Category */}
              {product.category_name_al && (
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={12} style={{ color: 'var(--color-olive)' }} />
                  <span
                    className="text-xs font-medium uppercase tracking-widest"
                    style={{ color: 'var(--color-olive)', letterSpacing: '0.12em' }}
                  >
                    {lang === 'al' ? product.category_name_al : product.category_name_en}
                  </span>
                </div>
              )}

              {/* Name */}
              <h1
                className="font-display leading-tight mb-3"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', color: 'var(--color-text)' }}
              >
                {name.toUpperCase()}
              </h1>

              {/* Rating */}
              <div className="mb-5">
                <Stars rating={product.rating} count={product.review_count} size={15} />
              </div>

              {/* Price */}
              {(() => {
                const onSale = !!product.old_price && product.old_price > product.price;
                return (
                  <div className="flex items-baseline gap-3 mb-6">
                    <span
                      className="font-display"
                      style={{ fontSize: '2.5rem', color: onSale ? 'var(--color-sale)' : 'var(--color-text)' }}
                    >
                      €{product.price.toFixed(2)}
                    </span>
                    {onSale && (
                      <>
                        <span className="text-xl line-through" style={{ color: 'var(--color-border-strong)' }}>
                          €{(product.old_price as number).toFixed(2)}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-1 text-white"
                          style={{ backgroundColor: 'var(--color-sale)', borderRadius: 'var(--radius-sm)' }}
                        >
                          -{Math.round((1 - product.price / (product.old_price as number)) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Description */}
              {description && (
                <p
                  className="text-sm leading-relaxed mb-8"
                  style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}
                >
                  {description}
                </p>
              )}

              {/* Stock indicator */}
              <div
                className="flex items-center gap-2 mb-6 pb-6 border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isOutOfStock ? 'var(--color-cancelled)' : product.stock < 10 ? 'var(--color-pending)' : 'var(--color-delivered)' }}
                />
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {isOutOfStock
                    ? tr('product_out_of_stock')
                    : product.stock < 10
                    ? `${product.stock} ${tr('product_stock_left')} ${tr('product_pieces')}`
                    : tr('product_in_stock')}
                </span>
              </div>

              {/* Quantity + Add */}
              {!isOutOfStock && (
                <div className="flex items-center gap-3 mb-4">
                  {/* Qty selector */}
                  <div
                    className="flex items-center border rounded-lg overflow-hidden"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-10 h-11 flex items-center justify-center transition-colors hover:bg-black/5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span
                      className="w-12 text-center font-medium text-sm"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="w-10 h-11 flex items-center justify-center transition-colors hover:bg-black/5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to cart */}
                  <button
                    onClick={handleAdd}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-sm uppercase tracking-wider transition-all duration-200"
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      letterSpacing: '0.06em',
                      backgroundColor: added ? 'var(--color-delivered-bg)' : 'var(--color-olive)',
                      color: added ? 'var(--color-delivered)' : 'white',
                      boxShadow: added ? 'none' : '0 6px 18px rgba(91,106,56,0.3)',
                    }}
                  >
                    {added ? (
                      <>
                        <Check size={16} strokeWidth={2.5} />
                        {tr('product_added')}
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={16} strokeWidth={1.75} />
                        {tr('product_add_cart')}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Meta */}
              <div
                className="mt-4 pt-4 border-t grid grid-cols-2 gap-3"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-start gap-2">
                  <Package size={13} className="mt-0.5" style={{ color: 'var(--color-olive)' }} />
                  <div>
                    <div className="text-[11px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
                      {tr('product_sku')}
                    </div>
                    <div className="text-xs font-medium uppercase" style={{ color: 'var(--color-text)' }}>
                      {product.slug.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <section className="mt-24">
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'var(--color-olive)', letterSpacing: '0.15em' }}
              >
                {tr('product_related')}
              </div>
              <h2
                className="font-display mb-8"
                style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)', color: 'var(--color-text)' }}
              >
                {lang === 'al' ? 'PRODUKTE TË NGJASHME' : 'RELATED PRODUCTS'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
