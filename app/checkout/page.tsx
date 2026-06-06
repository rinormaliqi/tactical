'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, MapPin, Building, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { useCart } from '@/lib/CartContext';
import { useLang } from '@/lib/LanguageContext';

const ease = [0.16, 1, 0.3, 1];

interface FormData {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  notes: string;
}

interface FormErrors {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const { lang, tr } = useLang();

  const [form, setForm] = useState<FormData>({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    customer_city: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.customer_name.trim()) errs.customer_name = tr('checkout_required');
    if (!form.customer_phone.trim()) errs.customer_phone = tr('checkout_required');
    if (!form.customer_address.trim()) errs.customer_address = tr('checkout_required');
    if (!form.customer_city.trim()) errs.customer_city = tr('checkout_required');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(i => ({
            product_id: i.product.id,
            product_name: lang === 'al' ? i.product.name_al : i.product.name_en,
            product_slug: i.product.slug,
            quantity: i.quantity,
            price: i.product.price,
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed');
      const order = await res.json();
      clear();
      router.push(`/order-success/${order.id}`);
    } catch {
      setSubmitting(false);
    }
  };

  const field = (
    key: keyof FormData,
    label: string,
    icon: React.ReactNode,
    type = 'text',
    placeholder = '',
    required = true,
  ) => (
    <div>
      <label
        className="block text-xs font-medium uppercase tracking-widest mb-2"
        style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
      >
        {label}{required && ' *'}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
          {icon}
        </span>
        <input
          type={type}
          value={form[key]}
          onChange={e => {
            setForm(f => ({ ...f, [key]: e.target.value }));
            if (errors[key as keyof FormErrors]) setErrors(er => ({ ...er, [key]: undefined }));
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-lg border text-sm outline-none transition-all"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            borderColor: errors[key as keyof FormErrors] ? 'var(--color-cancelled)' : 'var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
      </div>
      {errors[key as keyof FormErrors] && (
        <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--color-cancelled)' }}>
          <AlertCircle size={11} />
          {errors[key as keyof FormErrors]}
        </p>
      )}
    </div>
  );

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>Shporta juaj është bosh.</p>
            <Link href="/products" className="text-sm font-medium" style={{ color: 'var(--color-olive)' }}>
              {tr('nav_products')}
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="font-heading text-4xl font-800 mb-10"
            style={{ fontWeight: 800, color: 'var(--color-text)' }}
          >
            {tr('checkout_title').toUpperCase()}
          </motion.h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.1 }}
              className="lg:col-span-3 space-y-5"
            >
              <div
                className="rounded-2xl border p-6"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <h2
                  className="font-heading text-lg font-700 mb-6"
                  style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.05em' }}
                >
                  {tr('checkout_customer_info').toUpperCase()}
                </h2>
                <div className="space-y-4">
                  {field('customer_name', tr('checkout_name'), <User size={15} />)}
                  {field('customer_phone', tr('checkout_phone'), <Phone size={15} />, 'tel')}
                  {field('customer_address', tr('checkout_address'), <MapPin size={15} />)}
                  {field('customer_city', tr('checkout_city'), <Building size={15} />)}

                  {/* Notes */}
                  <div>
                    <label
                      className="block text-xs font-medium uppercase tracking-widest mb-2"
                      style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
                    >
                      {tr('checkout_notes')}
                    </label>
                    <div className="relative">
                      <FileText
                        size={15}
                        className="absolute left-3.5 top-3.5"
                        style={{ color: 'var(--color-text-muted)' }}
                      />
                      <textarea
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder={tr('checkout_notes_placeholder')}
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border text-sm outline-none transition-all resize-none"
                        style={{
                          backgroundColor: 'var(--color-bg-elevated)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-olive)',
                  color: 'white',
                  boxShadow: submitting ? 'none' : '0 4px 16px rgba(91,106,56,0.35)',
                }}
              >
                {submitting ? tr('checkout_submitting') : tr('checkout_submit')}
              </button>
            </motion.form>

            {/* Order summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div
                className="rounded-2xl border p-6 sticky top-24"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <h2
                  className="font-heading text-lg font-700 mb-5"
                  style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.05em' }}
                >
                  {tr('checkout_order_summary').toUpperCase()}
                </h2>

                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.product.slug} className="flex justify-between items-start gap-2 text-sm">
                      <div style={{ color: 'var(--color-text-muted)' }}>
                        <span>{lang === 'al' ? item.product.name_al : item.product.name_en}</span>
                        <span
                          className="ml-1 text-xs px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                        >
                          ×{item.quantity}
                        </span>
                      </div>
                      <span className="shrink-0" style={{ color: 'var(--color-text)' }}>
                        €{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="border-t pt-4 flex justify-between items-center"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                    {tr('cart_total')}
                  </span>
                  <span
                    className="font-heading text-2xl font-700"
                    style={{ fontWeight: 700, color: 'var(--color-olive)', fontSize: '1.5rem' }}
                  >
                    €{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
