import { NextRequest, NextResponse } from 'next/server';
import { dbGet } from '@/lib/db';
import { Product } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const row = await dbGet<Product & { images: string }>(`
    SELECT p.*, c.slug as category_slug, c.name_al as category_name_al, c.name_en as category_name_en
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ?
  `, [slug]);

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    ...row,
    images: JSON.parse(row.images || '[]'),
    featured: Boolean(row.featured),
    is_new: Boolean(row.is_new),
  });
}
