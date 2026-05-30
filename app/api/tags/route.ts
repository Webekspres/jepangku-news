import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const tags = await db.tag.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(tags);
}
