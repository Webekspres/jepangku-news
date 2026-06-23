import { NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { db } from '@/lib/db';

export async function GET() {
  const tags = await db.tag.findMany({ orderBy: { name: 'asc' } });
  return apiSuccess(tags);
}
