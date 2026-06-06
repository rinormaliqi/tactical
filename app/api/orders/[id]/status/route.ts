import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { OrderStatus } from '@/lib/types';
import { isAuthed } from '@/lib/auth';

const VALID_STATUSES: OrderStatus[] = ['pending', 'processing', 'delivered', 'cancelled'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const { status } = await req.json() as { status: OrderStatus };

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  db.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

  return NextResponse.json(order);
}
