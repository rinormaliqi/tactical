import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAuthed } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
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

  const orders = db.prepare(query).all(...params);
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();

  const { customer_name, customer_phone, customer_address, customer_city, notes, items } = body;

  if (!customer_name || !customer_phone || !customer_address || !customer_city || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const count = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }).c;
  const order_number = `MALI-${String(count + 1).padStart(4, '0')}`;

  const total = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);

  const createOrder = db.transaction(() => {
    const order = db.prepare(`
      INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, customer_city, notes, total)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(order_number, customer_name, customer_phone, customer_address, customer_city, notes ?? null, total);

    const orderId = order.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_slug, quantity, price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(orderId, item.product_id ?? null, item.product_name, item.product_slug ?? null, item.quantity, item.price);
      // Decrease stock
      if (item.product_id) {
        db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?')
          .run(item.quantity, item.product_id);
      }
    }

    return orderId;
  });

  const orderId = createOrder();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

  return NextResponse.json(order, { status: 201 });
}
