'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Printer, Phone, MapPin, FileText, Package } from 'lucide-react';
import { type Order, type OrderStatus } from '@/lib/types';
import { useLang } from '@/lib/LanguageContext';

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--color-pending)',
  processing: 'var(--color-processing)',
  delivered: 'var(--color-delivered)',
  cancelled: 'var(--color-cancelled)',
};
const STATUS_BG: Record<string, string> = {
  pending: 'var(--color-pending-bg)',
  processing: 'var(--color-processing-bg)',
  delivered: 'var(--color-delivered-bg)',
  cancelled: 'var(--color-cancelled-bg)',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tr } = useLang();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(o => { setOrder(o); setLoading(false); });
  }, [id]);

  const updateStatus = async (status: OrderStatus) => {
    if (!order || updating) return;
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setOrder(prev => prev ? { ...prev, status: updated.status } : prev);
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="img-shimmer h-8 rounded-lg w-40" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 img-shimmer rounded-xl h-64" />
          <div className="img-shimmer rounded-xl h-64" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p style={{ color: 'var(--color-text-muted)' }}>Porosia nuk u gjet.</p>
        <Link href="/admin/orders" className="text-sm mt-2 block" style={{ color: 'var(--color-olive)' }}>
          {tr('order_back')}
        </Link>
      </div>
    );
  }

  const statuses: OrderStatus[] = ['pending', 'processing', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--color-olive)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ChevronLeft size={16} />
            {tr('order_back')}
          </Link>
          <div className="flex items-center gap-2">
            <h1
              className="font-heading text-2xl font-800"
              style={{ fontWeight: 800, color: 'var(--color-text)' }}
            >
              {order.order_number}
            </h1>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: STATUS_BG[order.status], color: STATUS_COLORS[order.status] }}
            >
              {tr(`status_${order.status}` as any)}
            </span>
          </div>
        </div>

        <Link
          href={`/admin/orders/${id}/print`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 hover:border-[var(--color-olive)] hover:text-[var(--color-olive)]"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          <Printer size={14} />
          {tr('orders_print')}
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — customer + items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer info */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
          >
            <h2
              className="font-heading text-sm font-700 uppercase tracking-widest mb-4"
              style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.12em' }}
            >
              {tr('order_customer_info')}
            </h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <span
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-olive-light)' }}
                >
                  <Phone size={11} style={{ color: 'var(--color-olive)' }} />
                </span>
                <span style={{ color: 'var(--color-text)' }}>{order.customer_name}</span>
                <span style={{ color: 'var(--color-border-strong)' }}>·</span>
                <a href={`tel:${order.customer_phone}`} style={{ color: 'var(--color-olive)' }}>
                  {order.customer_phone}
                </a>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <span
                  className="w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0"
                  style={{ backgroundColor: 'var(--color-olive-light)' }}
                >
                  <MapPin size={11} style={{ color: 'var(--color-olive)' }} />
                </span>
                <span style={{ color: 'var(--color-text)' }}>
                  {order.customer_address}, {order.customer_city}
                </span>
              </div>
              {order.notes && (
                <div className="flex items-start gap-2.5 text-sm">
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center mt-0.5 shrink-0"
                    style={{ backgroundColor: 'var(--color-olive-light)' }}
                  >
                    <FileText size={11} style={{ color: 'var(--color-olive)' }} />
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order items */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2
                className="font-heading text-sm font-700 uppercase tracking-widest"
                style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.12em' }}
              >
                {tr('order_items_ordered')}
              </h2>
            </div>

            {/* Header row */}
            <div
              className="grid grid-cols-12 gap-2 px-5 py-2 text-[10px] font-semibold uppercase tracking-widest border-b"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', letterSpacing: '0.12em', backgroundColor: 'var(--color-bg)' }}
            >
              <div className="col-span-6">Produkti</div>
              <div className="col-span-2 text-center">Sasia</div>
              <div className="col-span-2 text-right">Çmimi</div>
              <div className="col-span-2 text-right">Totali</div>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {order.items?.map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center">
                  <div className="col-span-6">
                    <div className="flex items-center gap-2">
                      <Package size={13} style={{ color: 'var(--color-olive)' }} />
                      <span className="text-sm" style={{ color: 'var(--color-text)' }}>{item.product_name}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    €{item.price.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                    €{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              className="flex justify-end px-5 py-4 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="text-right">
                <div className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {tr('cart_total')}
                </div>
                <div
                  className="font-heading text-2xl font-700"
                  style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.5rem' }}
                >
                  €{order.total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — status + meta */}
        <div className="space-y-5">
          {/* Update status */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
          >
            <h2
              className="font-heading text-sm font-700 uppercase tracking-widest mb-4"
              style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.12em' }}
            >
              {tr('order_update_status')}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(s as OrderStatus)}
                  disabled={updating || order.status === s}
                  className="px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 border"
                  style={{
                    backgroundColor: order.status === s ? STATUS_BG[s] : 'transparent',
                    borderColor: order.status === s ? STATUS_COLORS[s] : 'var(--color-border)',
                    color: order.status === s ? STATUS_COLORS[s] : 'var(--color-text-muted)',
                  }}
                >
                  {tr(`status_${s}` as any)}
                </button>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
          >
            <h2
              className="font-heading text-sm font-700 uppercase tracking-widest mb-4"
              style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.12em' }}
            >
              {tr('order_summary')}
            </h2>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>Nr. Porosisë</span>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{order.order_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>{tr('orders_date')}</span>
                <span style={{ color: 'var(--color-text)' }}>
                  {new Date(order.created_at).toLocaleDateString('sq-AL', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>Ora</span>
                <span style={{ color: 'var(--color-text)' }}>
                  {new Date(order.created_at).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>{tr('cart_items')}</span>
                <span style={{ color: 'var(--color-text)' }}>{order.items?.length ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{tr('cart_total')}</span>
                <span
                  className="font-heading font-700"
                  style={{ fontWeight: 700, color: 'var(--color-olive)' }}
                >
                  €{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
