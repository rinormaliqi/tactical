import { NextRequest, NextResponse } from 'next/server';
import { dbAll, dbGet, getDb } from '@/lib/db';
import { isAuthed } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// List recent in-store sales
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sales = await dbAll(`SELECT * FROM orders WHERE source = 'in_store' ORDER BY created_at DESC LIMIT 50`);
  return NextResponse.json(sales, { headers: { 'Cache-Control': 'no-store' } });
}

// Record a new in-store (cash) sale
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { customer_name, notes, items } = body as {
    customer_name?: string;
    notes?: string;
    items: { product_id?: number; product_name: string; product_slug?: string; quantity: number; price: number }[];
  };

  if (!items?.length) {
    return NextResponse.json({ error: 'No items' }, { status: 400 });
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const posRow = await dbGet<{ c: number }>(`SELECT COUNT(*) as c FROM orders WHERE source = 'in_store'`);
  const order_number = `POS-${String((posRow?.c ?? 0) + 1).padStart(4, '0')}`;

  const db = await getDb();
  const tx = await db.transaction('write');
  let orderId: number;
  try {
    const res = await tx.execute({
      sql: `INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, customer_city, notes, status, source, total)
            VALUES (?, ?, '', '', '', ?, 'delivered', 'in_store', ?)`,
      args: [order_number, customer_name?.trim() || 'Klient në dyqan', notes ?? null, total],
    });
    orderId = Number(res.lastInsertRowid);

    for (const item of items) {
      await tx.execute({
        sql: `INSERT INTO order_items (order_id, product_id, product_name, product_slug, quantity, price)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [orderId, item.product_id ?? null, item.product_name, item.product_slug ?? null, item.quantity, item.price],
      });
      if (item.product_id) {
        await tx.execute({ sql: 'UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?', args: [item.quantity, item.product_id] });
      }
    }
    await tx.commit();
  } catch (e) {
    await tx.rollback();
    throw e;
  }

  const order = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
  return NextResponse.json(order, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
