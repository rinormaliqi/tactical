'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductImage from '@/components/store/ProductImage';
import { useCart } from '@/lib/CartContext';
import { useLang } from '@/lib/LanguageContext';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function CartPage() {
  const { items, count, total, remove, setQty } = useCart();
  const { lang, tr } = useLang();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="font-heading text-4xl font-800 mb-8"
            style={{ fontWeight: 800, color: 'var(--color-text)' }}
          >
            {tr('cart_title').toUpperCase()}
          </motion.h1>

          {count === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="text-center py-24"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: 'var(--color-border)' }}
              >
                <ShoppingBag size={32} style={{ color: 'var(--color-text-muted)' }} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                {tr('cart_empty')}
              </h2>
              <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
                Shfleto katallogun tonë dhe shto produkte.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-olive)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(91,106,56,0.3)',
                }}
              >
                {tr('cart_empty_cta')}
                <ArrowRight size={15} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2 space-y-3">
                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <motion.div
                      key={item.product.slug}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="flex gap-4 p-4 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--color-bg-elevated)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {/* Image */}
                      <Link href={`/products/${item.product.slug}`} className="shrink-0 rounded-lg overflow-hidden" style={{ width: 88, height: 88 }}>
                        <ProductImage product={item.product} />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        {item.product.category_name_al && (
                          <div
                            className="text-[10px] font-medium uppercase tracking-widest mb-1"
                            style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
                          >
                            {lang === 'al' ? item.product.category_name_al : item.product.category_name_en}
                          </div>
                        )}
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-medium text-sm leading-snug hover:text-[var(--color-olive)] transition-colors truncate block"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {lang === 'al' ? item.product.name_al : item.product.name_en}
                        </Link>
                        <div
                          className="font-heading text-lg font-700 mt-1"
                          style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.1rem' }}
                        >
                          €{(item.product.price * item.quantity).toFixed(2)}
                        </div>

                        {/* Qty controls */}
                        <div className="flex items-center gap-3 mt-2">
                          <div
                            className="flex items-center border rounded-lg overflow-hidden"
                            style={{ borderColor: 'var(--color-border)' }}
                          >
                            <button
                              onClick={() => setQty(item.product.slug, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-black/5"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              <Minus size={11} />
                            </button>
                            <span
                              className="w-8 text-center text-sm font-medium"
                              style={{ color: 'var(--color-text)' }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => setQty(item.product.slug, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-black/5"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <button
                            onClick={() => remove(item.product.slug)}
                            className="flex items-center gap-1 text-xs transition-colors hover:text-[var(--color-cancelled)] px-2 py-1 rounded"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <Trash2 size={12} />
                            {tr('cart_remove')}
                          </button>
                        </div>
                      </div>

                      {/* Unit price */}
                      <div className="text-xs text-right shrink-0 hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
                        €{item.product.price.toFixed(2)} / {tr('product_pieces')}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="pt-4">
                  <Link
                    href="/products"
                    className="text-sm flex items-center gap-1 transition-colors hover:text-[var(--color-olive)]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    ← {tr('cart_continue')}
                  </Link>
                </div>
              </div>

              {/* Order summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.15 }}
              >
                <div
                  className="rounded-2xl border p-6 sticky top-24"
                  style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <h2
                    className="font-heading text-xl font-700 mb-6"
                    style={{ fontWeight: 700, color: 'var(--color-text)' }}
                  >
                    {tr('checkout_order_summary').toUpperCase()}
                  </h2>

                  {/* Items summary */}
                  <div className="space-y-2 mb-4">
                    {items.map(item => (
                      <div key={item.product.slug} className="flex justify-between text-sm">
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          {lang === 'al' ? item.product.name_al : item.product.name_en} × {item.quantity}
                        </span>
                        <span style={{ color: 'var(--color-text)' }}>
                          €{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="border-t pt-4 mb-4"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: 'var(--color-text-muted)' }}>{tr('cart_subtotal')}</span>
                      <span style={{ color: 'var(--color-text)' }}>€{total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-start justify-between text-sm">
                      <span style={{ color: 'var(--color-text-muted)' }}>{tr('cart_delivery')}</span>
                      <div className="text-right">
                        <div className="flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                          <Package size={12} />
                          <span className="text-xs">{tr('cart_delivery_note')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div
                    className="flex justify-between items-center py-4 border-t border-b mb-6"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {tr('cart_total')}
                    </span>
                    <span
                      className="font-heading text-2xl font-700"
                      style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.5rem' }}
                    >
                      €{total.toFixed(2)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--color-olive)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(91,106,56,0.3)',
                    }}
                  >
                    {tr('cart_proceed')}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
