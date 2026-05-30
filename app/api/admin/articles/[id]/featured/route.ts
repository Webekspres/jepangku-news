import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const { value } = await request.json();

  const article = await db.article.update({ where: { id }, data: { isFeatured: value } });
  return NextResponse.json({ message: 'Updated', isFeatured: article.isFeatured });
}
