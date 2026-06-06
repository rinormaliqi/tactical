import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM categories ORDER BY name_al').all();
  return NextResponse.json(categories);
}
