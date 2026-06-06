import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Order, OrderItem } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id) as OrderItem[];

  return NextResponse.json({ ...order, items });
}
