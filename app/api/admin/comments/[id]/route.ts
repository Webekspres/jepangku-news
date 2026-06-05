import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// PATCH /api/admin/comments/[id]  { action: 'hide' | 'unhide' }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const { action } = await request.json().catch(() => ({}));

  if (action !== 'hide' && action !== 'unhide') {
    return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
  }

  const comment = await db.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: 'Komentar tidak ditemukan' }, { status: 404 });
  }

  const updated = await db.comment.update({
    where: { id },
    data: { status: action === 'hide' ? 'HIDDEN' : 'VISIBLE' },
  });

  logger.info('comment.moderated', { commentId: id, action, byAdminId: admin.id });

  return NextResponse.json({ id: updated.id, status: updated.status });
}

// DELETE /api/admin/comments/[id]  — hapus permanen (moderasi admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const comment = await db.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: 'Komentar tidak ditemukan' }, { status: 404 });
  }

  // onDelete: Cascade pada relasi replies akan menghapus balasan juga.
  await db.comment.delete({ where: { id } });

  logger.info('comment.hardDeleted', { commentId: id, byAdminId: admin.id });

  return NextResponse.json({ message: 'Komentar dihapus permanen' });
}
