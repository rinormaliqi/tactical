import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll } from '@/lib/db';
import { isAuthed } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type Period = 'daily' | 'monthly' | 'yearly';

const AL_MONTHS = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);

  // Strict validation — only allow known periods and a numeric YYYY-MM-DD date.
  // This guarantees the values interpolated into the strftime comparisons are digits only.
  const rawPeriod = searchParams.get('period') ?? 'daily';
  const period = (['daily', 'monthly', 'yearly'].includes(rawPeriod) ? rawPeriod : 'daily') as Period;

  const rawDate = searchParams.get('date') ?? '';
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(rawDate);
  const base = valid ? new Date(rawDate) : new Date();
  if (Number.isNaN(base.getTime())) base.setTime(Date.now());

  const y = String(base.getFullYear()).padStart(4, '0');
  const m = String(base.getMonth() + 1).padStart(2, '0');
  const d = String(base.getDate()).padStart(2, '0');
  const date = `${y}-${m}-${d}`;

  // WHERE clause confining rows to the requested period (local time via 'localtime')
  let where: string;
  let label: string;
  let seriesExpr: string; // strftime bucket
  let bucketsAll: string[]; // full set of buckets to zero-fill

  if (period === 'daily') {
    where = `date(created_at, 'localtime') = '${y}-${m}-${d}'`;
    label = `${d}.${m}.${y}`;
    seriesExpr = `strftime('%H', created_at, 'localtime')`;
    bucketsAll = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  } else if (period === 'monthly') {
    where = `strftime('%Y-%m', created_at, 'localtime') = '${y}-${m}'`;
    label = `${AL_MONTHS[parseInt(m) - 1]} ${y}`;
    seriesExpr = `strftime('%d', created_at, 'localtime')`;
    const days = new Date(parseInt(y), parseInt(m), 0).getDate();
    bucketsAll = Array.from({ length: days }, (_, i) => String(i + 1).padStart(2, '0'));
  } else {
    where = `strftime('%Y', created_at, 'localtime') = '${y}'`;
    label = `${y}`;
    seriesExpr = `strftime('%m', created_at, 'localtime')`;
    bucketsAll = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  }

  const notCancelled = `status != 'cancelled'`;

  // Summary
  const revRow = (await dbGet<Record<string, number>>(`
    SELECT
      COALESCE(SUM(total), 0) AS revenue_total,
      COALESCE(SUM(CASE WHEN source = 'online' THEN total ELSE 0 END), 0) AS revenue_online,
      COALESCE(SUM(CASE WHEN source = 'in_store' THEN total ELSE 0 END), 0) AS revenue_instore,
      COUNT(*) AS orders_total,
      COALESCE(SUM(CASE WHEN source = 'online' THEN 1 ELSE 0 END), 0) AS orders_online,
      COALESCE(SUM(CASE WHEN source = 'in_store' THEN 1 ELSE 0 END), 0) AS orders_instore
    FROM orders WHERE ${where} AND ${notCancelled}
  `))!;

  const itemsRow = (await dbGet<{ items_sold: number }>(`
    SELECT COALESCE(SUM(oi.quantity), 0) AS items_sold
    FROM order_items oi JOIN orders o ON oi.order_id = o.id
    WHERE ${where.replace(/created_at/g, 'o.created_at')} AND o.status != 'cancelled'
  `))!;

  const avg = revRow.orders_total > 0 ? revRow.revenue_total / revRow.orders_total : 0;

  // Series (zero-filled)
  const seriesRows = await dbAll<{ bucket: string; revenue: number; orders: number }>(`
    SELECT ${seriesExpr} AS bucket, COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
    FROM orders WHERE ${where} AND ${notCancelled}
    GROUP BY bucket
  `);

  const seriesMap = new Map(seriesRows.map(r => [r.bucket, r]));
  const series = bucketsAll.map(b => {
    const row = seriesMap.get(b);
    let display = b;
    if (period === 'daily') display = `${b}:00`;
    else if (period === 'yearly') display = AL_MONTHS[parseInt(b) - 1].slice(0, 3);
    return { bucket: display, revenue: row?.revenue ?? 0, orders: row?.orders ?? 0 };
  });

  // Top products
  const topProducts = await dbAll(`
    SELECT oi.product_name AS name, SUM(oi.quantity) AS quantity, SUM(oi.quantity * oi.price) AS revenue
    FROM order_items oi JOIN orders o ON oi.order_id = o.id
    WHERE ${where.replace(/created_at/g, 'o.created_at')} AND o.status != 'cancelled'
    GROUP BY oi.product_name ORDER BY revenue DESC LIMIT 10
  `);

  // By status (includes cancelled for completeness)
  const byStatus = await dbAll(`
    SELECT status, COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue
    FROM orders WHERE ${where} GROUP BY status
  `);

  const bySource = await dbAll(`
    SELECT source, COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue
    FROM orders WHERE ${where} AND ${notCancelled} GROUP BY source
  `);

  return NextResponse.json({
    period,
    date,
    label,
    summary: {
      revenue_total: revRow.revenue_total,
      revenue_online: revRow.revenue_online,
      revenue_instore: revRow.revenue_instore,
      orders_total: revRow.orders_total,
      orders_online: revRow.orders_online,
      orders_instore: revRow.orders_instore,
      items_sold: itemsRow.items_sold,
      avg_order_value: avg,
    },
    series,
    top_products: topProducts,
    by_status: byStatus,
    by_source: bySource,
    generated_at: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
}
