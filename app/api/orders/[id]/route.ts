import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll } from '@/lib/db';
import { Order, OrderItem } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await dbGet<Order>('SELECT * FROM orders WHERE id = ?', [id]);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const items = await dbAll<OrderItem>('SELECT * FROM order_items WHERE order_id = ?', [id]);

  return NextResponse.json({ ...order, items });
}
