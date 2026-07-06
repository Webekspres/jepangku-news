import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import {
  approveContributorApplication,
  rejectContributorApplication,
} from '@/lib/contributor-applications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return apiError('Admin access required' , { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? '').toLowerCase();
  const adminNote = body.adminNote ? String(body.adminNote) : null;

  try {
    if (action === 'approve') {
      await approveContributorApplication(id, admin.id, adminNote);
      return apiSuccess({ message: 'Kontributor disetujui' });
    }

    if (action === 'reject') {
      if (!adminNote?.trim()) {
        return apiError('Catatan penolakan wajib diisi' , { status: 400 });
      }
      await rejectContributorApplication(id, admin.id, adminNote);
      return apiSuccess({ message: 'Permohonan ditolak' });
    }

    return apiError('Action tidak valid' , { status: 400 });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN';
    const messages: Record<string, { status: number; error: string }> = {
      NOT_FOUND: { status: 404, error: 'Permohonan tidak ditemukan' },
      NOT_PENDING: { status: 409, error: 'Permohonan sudah diproses' },
      NOTE_REQUIRED: { status: 400, error: 'Catatan penolakan wajib diisi' },
    };
    const mapped = messages[code];
    if (mapped) {
      return apiSuccess({ error: mapped.error, code }, { status: mapped.status });
    }
    console.error('Contributor review failed:', error);
    return apiError('Gagal memproses permohonan' , { status: 500 });
  }
}
