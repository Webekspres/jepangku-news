import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { normalizeCommentContent } from '@/lib/comments';

// PATCH /api/comments/[id]  { content }  — edit komentar milik sendiri
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  const { id } = await params;
  const comment = await db.comment.findUnique({ where: { id } });

  if (!comment || comment.deletedAt !== null) {
    return NextResponse.json({ error: 'Komentar tidak ditemukan' }, { status: 404 });
  }
  if (comment.userId !== user.id) {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
  }
  if (comment.status === 'HIDDEN') {
    return NextResponse.json(
      { error: 'Komentar yang disembunyikan moderator tidak dapat diedit' },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const normalized = normalizeCommentContent(body?.content);
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const updated = await db.comment.update({
    where: { id },
    data: { content: normalized.content, editedAt: new Date() },
  });

  return NextResponse.json({
    id: updated.id,
    content: updated.content,
    isEdited: true,
  });
}

// DELETE /api/comments/[id]  — soft delete (pemilik atau admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  const { id } = await params;
  const comment = await db.comment.findUnique({ where: { id } });

  if (!comment || comment.deletedAt !== null) {
    return NextResponse.json({ error: 'Komentar tidak ditemukan' }, { status: 404 });
  }

  const isOwner = comment.userId === user.id;
  const isAdmin = user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
  }

  await db.comment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  logger.info('comment.deleted', { commentId: id, byUserId: user.id, asAdmin: isAdmin && !isOwner });

  return NextResponse.json({ message: 'Komentar dihapus' });
}
