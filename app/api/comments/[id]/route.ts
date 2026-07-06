import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { normalizeCommentContent } from '@/lib/comments';
import { auditCommentDelete, auditCommentUpdate } from '@/lib/audit-routes';

// PATCH /api/comments/[id]  { content }  — edit komentar milik sendiri
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Tidak terautentikasi' , { status: 401 });
  }

  const { id } = await params;
  const comment = await db.comment.findUnique({ where: { id } });

  if (!comment || comment.deletedAt !== null) {
    return apiError('Komentar tidak ditemukan' , { status: 404 });
  }
  if (comment.userId !== user.id) {
    return apiError('Tidak diizinkan' , { status: 403 });
  }
  if (comment.status === 'HIDDEN') {
    return apiSuccess(
      { error: 'Komentar yang disembunyikan moderator tidak dapat diedit' },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const normalized = normalizeCommentContent(body?.content);
  if (!normalized.ok) {
    return apiError(normalized.error , { status: 400 });
  }

  const updated = await db.comment.update({
    where: { id },
    data: { content: normalized.content, editedAt: new Date() },
  });

  auditCommentUpdate(user, updated.id);

  return apiSuccess({
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
    return apiError('Tidak terautentikasi' , { status: 401 });
  }

  const { id } = await params;
  const comment = await db.comment.findUnique({ where: { id } });

  if (!comment || comment.deletedAt !== null) {
    return apiError('Komentar tidak ditemukan' , { status: 404 });
  }

  const isOwner = comment.userId === user.id;
  const isAdmin = user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return apiError('Tidak diizinkan' , { status: 403 });
  }

  await db.comment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  logger.info('comment.deleted', { commentId: id, byUserId: user.id, asAdmin: isAdmin && !isOwner });

  auditCommentDelete(user, id, isAdmin && !isOwner);

  return apiSuccess({ message: 'Komentar dihapus' });
}
