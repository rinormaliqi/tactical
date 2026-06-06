import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/db';
import { isAuthed } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name_al, name_en, description_al, description_en, price, category_id, slug, stock, featured, images, old_price, is_new, barcode } = body;

  if (!name_al || !price || !slug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const imageArr = Array.isArray(images) ? images.filter(Boolean).slice(0, 4) : [];
  if (imageArr.length < 1) {
    return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
  }

  const existing = await dbGet('SELECT id FROM products WHERE slug = ?', [slug]);
  if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });

  const code = barcode?.trim() || null;
  if (code) {
    const dupe = await dbGet('SELECT id FROM products WHERE barcode = ?', [code]);
    if (dupe) return NextResponse.json({ error: 'Barcode already exists' }, { status: 409 });
  }

  const result = await dbRun(`
    INSERT INTO products (name_al, name_en, description_al, description_en, price, category_id, slug, stock, featured, images, old_price, is_new, barcode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    name_al, name_en ?? name_al, description_al ?? null, description_en ?? null,
    price, category_id ?? null, slug, stock ?? 0, featured ? 1 : 0,
    JSON.stringify(imageArr), old_price || null, is_new ? 1 : 0, code,
  ]);

  const product = await dbGet('SELECT * FROM products WHERE id = ?', [Number(result.lastInsertRowid)]);
  return NextResponse.json(product, { status: 201 });
}
