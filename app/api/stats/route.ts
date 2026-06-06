import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll } from '@/lib/db';
import { isAuthed } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const num = async (sql: string) => ((await dbGet<{ v: number }>(sql))?.v ?? 0);

  const totalOrders = await num("SELECT COUNT(*) as v FROM orders");
  const totalRevenue = await num("SELECT COALESCE(SUM(total), 0) as v FROM orders WHERE status != 'cancelled'");
  const ordersToday = await num("SELECT COUNT(*) as v FROM orders WHERE date(created_at) = date('now')");
  const revenueToday = await num("SELECT COALESCE(SUM(total), 0) as v FROM orders WHERE date(created_at) = date('now') AND status != 'cancelled'");
  const ordersWeek = await num("SELECT COUNT(*) as v FROM orders WHERE created_at >= datetime('now', '-7 days')");
  const revenueWeek = await num("SELECT COALESCE(SUM(total), 0) as v FROM orders WHERE created_at >= datetime('now', '-7 days') AND status != 'cancelled'");
  const pendingOrders = await num("SELECT COUNT(*) as v FROM orders WHERE status = 'pending'");
  const lowStock = await num("SELECT COUNT(*) as v FROM products WHERE stock < 10");

  const topProducts = await dbAll(`
    SELECT oi.product_name as name, SUM(oi.quantity) as quantity, SUM(oi.quantity * oi.price) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status != 'cancelled'
    GROUP BY oi.product_name
    ORDER BY quantity DESC
    LIMIT 5
  `);

  const ordersByStatus = await dbAll(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`);

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
