import { NextResponse } from 'next/server';
import { dbAll } from '@/lib/db';

export async function GET() {
  const categories = await dbAll('SELECT * FROM categories ORDER BY name_al');
  return NextResponse.json(categories);
}
