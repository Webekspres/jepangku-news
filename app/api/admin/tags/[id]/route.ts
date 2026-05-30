import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;

  const usage = await db.articleTag.count({ where: { tagId: id } });
  if (usage > 0) {
    return NextResponse.json({ error: `Tag is used by ${usage} article(s)` }, { status: 400 });
  }

  await db.tag.delete({ where: { id } });
  return NextResponse.json({ message: 'Tag deleted' });
}
