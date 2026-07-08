import type { ArticleStatus } from '@prisma/client';
import type { SessionUser } from '@/lib/auth/types';

/** Status yang boleh diedit lewat portal user (/edit-article), termasuk admin sebagai penulis. */
export const USER_PORTAL_EDITABLE_STATUSES = ['DRAFT', 'REJECTED'] as const satisfies readonly ArticleStatus[];

export function isAdminAuthor(
  user: Pick<SessionUser, 'role'> | null | undefined,
): boolean {
  return user?.role === 'ADMIN';
}

export function canEditOnUserPortal(status: string): boolean {
  return (USER_PORTAL_EDITABLE_STATUSES as readonly string[]).includes(status);
}

/** Status yang boleh dipilih saat submit dari portal user. */
export function getUserPortalSubmitStatuses(isAdmin: boolean): ArticleStatus[] {
  return isAdmin ? ['DRAFT', 'PUBLISHED'] : ['DRAFT', 'PENDING_REVIEW'];
}

export function resolveUserPortalSubmitStatus(
  requested: string,
  isAdmin: boolean,
): ArticleStatus {
  const allowed = getUserPortalSubmitStatuses(isAdmin);
  if (allowed.includes(requested as ArticleStatus)) {
    return requested as ArticleStatus;
  }
  return 'DRAFT';
}

/** Copy konfirmasi sebelum artikel dikirim untuk direview (dipakai lintas komponen). */
export const REVIEW_CONFIRM_TITLE =
  'Apakah Anda yakin artikel ini siap untuk direview?';
export const REVIEW_CONFIRM_DESCRIPTION =
  'Artikel yang sedang dalam proses review tidak dapat diedit.';
export const REVIEW_CONFIRM_LABEL = 'Ya, Kirim untuk Review';

export function submitSuccessMessage(status: ArticleStatus, _isAdmin: boolean): string {
  if (status === 'DRAFT') return 'Draft berhasil disimpan';
  if (status === 'PUBLISHED') return 'Artikel berhasil dipublikasikan';
  return 'Artikel berhasil dikirim untuk direview';
}

export function userPortalCreateSubtitle(isAdmin: boolean): string {
  return isAdmin
    ? 'Konten redaksi dapat langsung dipublikasikan tanpa antrian review.'
    : 'Bagikan cerita atau berita Jepang. Artikel akan direview admin sebelum tayang.';
}

export function userPortalEditSubtitle(isAdmin: boolean): string {
  return isAdmin
    ? 'Edit draft Anda. Publikasikan langsung atau simpan sebagai draft.'
    : 'Artikel akan direview ulang oleh admin setelah disubmit.';
}
