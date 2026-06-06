'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye, Printer, X } from 'lucide-react';
import { type Order } from '@/lib/types';
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

function OrdersContent() {
  const { tr } = useLang();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') ?? 'all');

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (search) params.set('search', search);
    const res = await fetch(`/api/orders?${params}`);
    setOrders(await res.json());
    setLoading(false);
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const statuses = ['all', 'pending', 'processing', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="font-heading text-3xl font-800"
          style={{ fontWeight: 800, color: 'var(--color-text)' }}
        >
          {tr('orders_title').toUpperCase()}
        </h1>
        <span
          className="text-sm px-3 py-1 rounded-full"
          style={{ backgroundColor: 'var(--color-olive-light)', color: 'var(--color-olive-dark)' }}
        >
          {orders.length} total
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tr('orders_search')}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-150"
              style={{
                backgroundColor: status === s
                  ? s === 'all' ? 'var(--color-olive)' : STATUS_BG[s]
                  : 'var(--color-bg-elevated)',
                borderColor: status === s
                  ? s === 'all' ? 'var(--color-olive)' : STATUS_COLORS[s]
                  : 'var(--color-border)',
                color: status === s
                  ? s === 'all' ? 'white' : STATUS_COLORS[s]
                  : 'var(--color-text-muted)',
              }}
            >
              {s === 'all' ? tr('orders_all_status') : tr(`status_${s}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
      >
        {/* Table header */}
        <div
          className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b text-[10px] font-semibold uppercase tracking-widest"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', letterSpacing: '0.12em', backgroundColor: 'var(--color-bg)' }}
        >
          <div className="col-span-2">{tr('orders_date')}</div>
          <div className="col-span-2">Nr.</div>
          <div className="col-span-3">{tr('orders_customer')}</div>
          <div className="col-span-1">{tr('orders_items')}</div>
          <div className="col-span-2">{tr('orders_total')}</div>
          <div className="col-span-1">{tr('orders_status')}</div>
          <div className="col-span-1">{tr('orders_actions')}</div>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {tr('loading')}
          </div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {tr('orders_no_orders')}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {orders.map(order => (
              <div
                key={order.id}
                className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-black/[0.015] transition-colors"
              >
                <div className="col-span-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(order.created_at).toLocaleDateString('sq-AL')}
                </div>
                <div className="col-span-2">
                  <span className="font-heading text-sm font-700" style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    {order.order_number}
                  </span>
                </div>
                <div className="col-span-3">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{order.customer_name}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{order.customer_city}</div>
                </div>
                <div className="col-span-1 text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>—</div>
                <div className="col-span-2 font-heading text-sm font-700" style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                  €{order.total.toFixed(2)}
                </div>
                <div className="col-span-1">
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{ backgroundColor: STATUS_BG[order.status], color: STATUS_COLORS[order.status] }}
                  >
                    {tr(`status_${order.status}` as any)}
                  </span>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-black/5"
                    title={tr('orders_view')}
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Eye size={14} />
                  </Link>
                  <Link
                    href={`/admin/orders/${order.id}/print`}
                    target="_blank"
                    className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-black/5"
                    title={tr('orders_print')}
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Printer size={14} />
                  </Link>
                </div>
              </div>
            ))}

            {/* Mobile view */}
            {orders.map(order => (
              <Link
                key={`m-${order.id}`}
                href={`/admin/orders/${order.id}`}
                className="sm:hidden flex items-start gap-3 px-5 py-4 hover:bg-black/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading text-sm font-700" style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                      {order.order_number}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: STATUS_BG[order.status], color: STATUS_COLORS[order.status] }}
                    >
                      {tr(`status_${order.status}` as any)}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{order.customer_name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-border-strong)' }}>
                    {new Date(order.created_at).toLocaleDateString('sq-AL')}
                  </div>
                </div>
                <div className="font-heading text-sm font-700 shrink-0" style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                  €{order.total.toFixed(2)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}
