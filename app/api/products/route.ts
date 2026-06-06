import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Product } from '@/lib/types';

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') ?? 'name_al';

  let query = `
    SELECT p.*, c.slug as category_slug, c.name_al as category_name_al, c.name_en as category_name_en
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (category && category !== 'all') {
    query += ' AND c.slug = ?';
    params.push(category);
  }
  if (featured === '1') {
    query += ' AND p.featured = 1';
  }
  if (search) {
    query += ' AND (p.name_al LIKE ? OR p.name_en LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const orderMap: Record<string, string> = {
    name_al: 'p.name_al ASC',
    name_en: 'p.name_en ASC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    newest: 'p.created_at DESC',
    stock: 'p.stock ASC',
  };
  query += ` ORDER BY ${orderMap[sort] ?? 'p.name_al ASC'}`;

  const rows = db.prepare(query).all(...params) as (Product & { images: string })[];
  const products = rows.map(r => ({
    ...r,
    images: JSON.parse(r.images || '[]'),
    featured: Boolean(r.featured),
    is_new: Boolean(r.is_new),
  }));

  return NextResponse.json(products);
}
