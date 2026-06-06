import { NextRequest, NextResponse } from 'next/server';
import { dbAll } from '@/lib/db';
import { Product } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const search = searchParams.get('search');
  const barcode = searchParams.get('barcode');
  const sort = searchParams.get('sort') ?? 'name_al';

  let query = `
    SELECT p.*, c.slug as category_slug, c.name_al as category_name_al, c.name_en as category_name_en
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  // Exact barcode lookup (uses the barcode index) — for POS scanning
  if (barcode) {
    query += ' AND p.barcode = ?';
    params.push(barcode.trim());
  }
  if (category && category !== 'all') {
    query += ' AND c.slug = ?';
    params.push(category);
  }
  if (featured === '1') {
    query += ' AND p.featured = 1';
  }
  if (search) {
    // Match name (AL/EN) or barcode
    query += ' AND (p.name_al LIKE ? OR p.name_en LIKE ? OR p.barcode LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
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

  const rows = await dbAll<Product & { images: string }>(query, params);
  const products = rows.map(r => ({
    ...r,
    images: JSON.parse(r.images || '[]'),
    featured: Boolean(r.featured),
    is_new: Boolean(r.is_new),
  }));

  return NextResponse.json(products);
}
