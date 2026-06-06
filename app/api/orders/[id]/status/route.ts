import { NextRequest, NextResponse } from 'next/server';
import { dbRun, dbGet } from '@/lib/db';
import { OrderStatus } from '@/lib/types';
import { isAuthed } from '@/lib/auth';

const VALID_STATUSES: OrderStatus[] = ['pending', 'processing', 'delivered', 'cancelled'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json() as { status: OrderStatus };

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await dbRun("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, id]);
  const order = await dbGet('SELECT * FROM orders WHERE id = ?', [id]);

  return NextResponse.json(order);
}
