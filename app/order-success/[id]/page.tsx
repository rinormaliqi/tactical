'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, Phone, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { type Order } from '@/lib/types';
import { useLang } from '@/lib/LanguageContext';

const ease = [0.16, 1, 0.3, 1];

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tr } = useLang();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(setOrder);
  }, [id]);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease, type: 'spring', stiffness: 200, damping: 20 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ backgroundColor: 'var(--color-delivered-bg)' }}
          >
            <CheckCircle size={36} style={{ color: 'var(--color-delivered)' }} strokeWidth={1.75} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.2 }}
          >
            <h1
              className="font-heading text-4xl font-800 mb-3"
              style={{ fontWeight: 800, color: 'var(--color-text)' }}
            >
              {tr('success_title').toUpperCase()}
            </h1>
            <p className="text-base mb-8" style={{ color: 'var(--color-text-muted)' }}>
              {tr('success_subtitle')}
            </p>

            {/* Order number */}
            {order && (
              <div
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-8 border"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <Package size={16} style={{ color: 'var(--color-olive)' }} />
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {tr('success_order_number')}:
                </span>
                <span
                  className="font-heading font-700 text-lg"
                  style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.1rem' }}
                >
                  {order.order_number}
                </span>
              </div>
            )}
          </motion.div>

          {/* Order details */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.3 }}
              className="rounded-2xl border p-6 text-left mb-8"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h2
                className="font-heading text-lg font-700 mb-5"
                style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.05em' }}
              >
                {tr('success_details').toUpperCase()}
              </h2>

              {/* Customer */}
              <div className="space-y-2.5 mb-5 pb-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone size={14} style={{ color: 'var(--color-olive)' }} />
                  <span style={{ color: 'var(--color-text-muted)' }}>{order.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin size={14} style={{ color: 'var(--color-olive)' }} />
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {order.customer_address}, {order.customer_city}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span style={{ color: 'var(--color-text)' }}>
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="border-t mt-4 pt-4 flex justify-between"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  {tr('cart_total')}
                </span>
                <span
                  className="font-heading font-700 text-xl"
                  style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.25rem' }}
                >
                  €{order.total.toFixed(2)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Contact note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm mb-8"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {tr('success_contact')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-olive)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(91,106,56,0.3)',
              }}
            >
              {tr('success_continue')}
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
