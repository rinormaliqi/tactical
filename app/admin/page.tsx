'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ShoppingBag, AlertTriangle, Clock, BarChart3, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Stats, type Order } from '@/lib/types';
import { useLang } from '@/lib/LanguageContext';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

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

export default function AdminDashboard() {
  const { tr } = useLang();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/orders?limit=6').then(r => r.json()),
    ]).then(([s, o]) => {
      setStats(s);
      setRecentOrders(o);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-5 img-shimmer h-28" style={{ borderColor: 'var(--color-border)' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: tr('admin_total_orders'), value: stats.total_orders, icon: ShoppingBag, suffix: '' },
    { label: tr('admin_total_revenue'), value: `€${stats.total_revenue.toFixed(2)}`, icon: TrendingUp, suffix: '' },
    { label: tr('admin_today_orders'), value: stats.orders_today, icon: Clock, suffix: '' },
    { label: tr('admin_today_revenue'), value: `€${stats.revenue_today.toFixed(2)}`, icon: TrendingUp, suffix: '' },
    { label: tr('admin_week_orders'), value: stats.orders_this_week, icon: BarChart3, suffix: '' },
    { label: tr('admin_week_revenue'), value: `€${stats.revenue_this_week.toFixed(2)}`, icon: TrendingUp, suffix: '' },
    { label: tr('admin_pending'), value: stats.pending_orders, icon: Clock, suffix: '' },
    { label: tr('admin_low_stock'), value: stats.low_stock_products, icon: AlertTriangle, suffix: '' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease, delay: i * 0.05 }}
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-olive-light)' }}
              >
                <card.icon size={15} style={{ color: 'var(--color-olive)' }} strokeWidth={1.75} />
              </div>
            </div>
            <div
              className="font-heading text-2xl font-700 mb-0.5"
              style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.5rem' }}
            >
              {card.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {card.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
          className="lg:col-span-2 rounded-xl border"
          style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h2
              className="font-heading text-sm font-700 uppercase tracking-widest"
              style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.12em' }}
            >
              {tr('admin_recent_orders')}
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs transition-colors hover:text-[var(--color-olive)]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {tr('admin_view_all')} →
            </Link>
          </div>
          <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
            {recentOrders.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {tr('orders_no_orders')}
              </div>
            ) : (
              recentOrders.map(order => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-black/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="font-heading font-700 text-sm"
                        style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.875rem' }}
                      >
                        {order.order_number}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: STATUS_BG[order.status],
                          color: STATUS_COLORS[order.status],
                        }}
                      >
                        {tr(`status_${order.status}` as any)}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {order.customer_name} — {order.customer_city}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className="font-heading font-700 text-sm"
                      style={{ fontWeight: 700, color: 'var(--color-text)' }}
                    >
                      €{order.total.toFixed(2)}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(order.created_at).toLocaleDateString('sq-AL')}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.4 }}
          className="rounded-xl border"
          style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h2
              className="font-heading text-sm font-700 uppercase tracking-widest"
              style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.12em' }}
            >
              {tr('admin_top_products')}
            </h2>
          </div>
          <div className="px-6 py-4">
            {stats.top_products.length === 0 ? (
              <div className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
                Nuk ka të dhëna.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.top_products.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: 'var(--color-olive-light)', color: 'var(--color-olive-dark)' }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                        {p.name}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {p.quantity} cope
                      </div>
                    </div>
                    <div
                      className="font-heading text-sm font-700 shrink-0"
                      style={{ fontWeight: 700, color: 'var(--color-text)' }}
                    >
                      €{(p.revenue as number).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Orders by status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.5 }}
        className="rounded-xl border p-6"
        style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
      >
        <h2
          className="font-heading text-sm font-700 uppercase tracking-widest mb-5"
          style={{ fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.12em' }}
        >
          Statusi i Porosive
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['pending', 'processing', 'delivered', 'cancelled'] as const).map(status => {
            const found = stats.orders_by_status.find(s => s.status === status);
            const count = found?.count ?? 0;
            return (
              <Link
                key={status}
                href={`/admin/orders?status=${status}`}
                className="p-4 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: STATUS_BG[status],
                }}
              >
                <div
                  className="font-heading text-2xl font-700 mb-1"
                  style={{ fontWeight: 700, color: STATUS_COLORS[status], fontSize: '1.5rem' }}
                >
                  {count}
                </div>
                <div className="text-xs font-medium" style={{ color: STATUS_COLORS[status] }}>
                  {tr(`status_${status}` as any)}
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
