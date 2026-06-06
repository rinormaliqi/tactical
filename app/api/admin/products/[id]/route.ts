import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import { isAuthed } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const fields = ['name_al', 'name_en', 'description_al', 'description_en', 'price', 'category_id', 'stock', 'featured', 'old_price', 'is_new'] as const;
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  for (const field of fields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      if (field === 'featured' || field === 'is_new') values.push(body[field] ? 1 : 0);
      else values.push(body[field]);
    }
  }

  // Barcode (with uniqueness check against other products)
  if (body.barcode !== undefined) {
    const code = typeof body.barcode === 'string' ? body.barcode.trim() : '';
    if (code) {
      const dupe = await dbGet('SELECT id FROM products WHERE barcode = ? AND id != ?', [code, id]);
      if (dupe) return NextResponse.json({ error: 'Barcode already exists' }, { status: 409 });
    }
    updates.push('barcode = ?');
    values.push(code || null);
  }

  // Images handled separately (JSON column, min 1 enforced)
  if (body.images !== undefined) {
    const imageArr = Array.isArray(body.images) ? body.images.filter(Boolean).slice(0, 4) : [];
    if (imageArr.length < 1) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }
    updates.push('images = ?');
    values.push(JSON.stringify(imageArr));
  }

  if (!updates.length) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

  values.push(id);
  await dbRun(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

  const product = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await dbRun('DELETE FROM products WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
