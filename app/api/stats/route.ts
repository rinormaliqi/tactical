import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAuthed } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();

  const totalOrders = (db.prepare("SELECT COUNT(*) as c FROM orders").get() as { c: number }).c;
  const totalRevenue = (db.prepare("SELECT COALESCE(SUM(total), 0) as r FROM orders WHERE status != 'cancelled'").get() as { r: number }).r;

  const ordersToday = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE date(created_at) = date('now')").get() as { c: number }).c;
  const revenueToday = (db.prepare("SELECT COALESCE(SUM(total), 0) as r FROM orders WHERE date(created_at) = date('now') AND status != 'cancelled'").get() as { r: number }).r;

  const ordersWeek = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE created_at >= datetime('now', '-7 days')").get() as { c: number }).c;
  const revenueWeek = (db.prepare("SELECT COALESCE(SUM(total), 0) as r FROM orders WHERE created_at >= datetime('now', '-7 days') AND status != 'cancelled'").get() as { r: number }).r;

  const pendingOrders = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'").get() as { c: number }).c;
  const lowStock = (db.prepare("SELECT COUNT(*) as c FROM products WHERE stock < 10").get() as { c: number }).c;

  const topProducts = db.prepare(`
    SELECT oi.product_name as name, SUM(oi.quantity) as quantity, SUM(oi.quantity * oi.price) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status != 'cancelled'
    GROUP BY oi.product_name
    ORDER BY quantity DESC
    LIMIT 5
  `).all();

  const ordersByStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM orders GROUP BY status
  `).all();

  return NextResponse.json({
    total_orders: totalOrders,
    total_revenue: totalRevenue,
    orders_today: ordersToday,
    revenue_today: revenueToday,
    orders_this_week: ordersWeek,
    revenue_this_week: revenueWeek,
    pending_orders: pendingOrders,
    low_stock_products: lowStock,
    top_products: topProducts,
    orders_by_status: ordersByStatus,
  });
}
