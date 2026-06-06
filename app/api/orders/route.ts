import { NextRequest, NextResponse } from 'next/server';
import { dbAll, dbGet, getDb } from '@/lib/db';
import { isAuthed } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const limit = Number(searchParams.get('limit') ?? 100);

  let query = 'SELECT * FROM orders WHERE 1=1';
  const params: (string | number)[] = [];

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  const orders = await dbAll(query, params);
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customer_name, customer_phone, customer_address, customer_city, notes, items } = body;

  if (!customer_name || !customer_phone || !customer_address || !customer_city || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const countRow = await dbGet<{ c: number }>('SELECT COUNT(*) as c FROM orders');
  const order_number = `MALI-${String((countRow?.c ?? 0) + 1).padStart(4, '0')}`;
  const total = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);

  const db = await getDb();
  const tx = await db.transaction('write');
  let orderId: number;
  try {
    const res = await tx.execute({
      sql: `INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, customer_city, notes, total)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [order_number, customer_name, customer_phone, customer_address, customer_city, notes ?? null, total],
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
  return NextResponse.json(order, { status: 201 });
}
