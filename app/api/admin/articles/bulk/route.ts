import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { recordStatusReview, setLastEditor } from '@/lib/article-audit';

const ALLOWED_ACTIONS = ['approve', 'reject', 'archive', 'delete'] as const;

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const body = await request.json();
    const { ids, action, note } = body as {
      ids: string[];
      action: (typeof ALLOWED_ACTIONS)[number];
      note?: string;
    };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 });
    }
    if (!ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const articles = await db.article.findMany({
      where: { id: { in: ids } },
    });

    if (articles.length === 0) {
      return NextResponse.json({ error: 'No articles found' }, { status: 404 });
    }

    const results: { id: string; ok: boolean; error?: string }[] = [];
    const now = new Date();

    for (const article of articles) {
      try {
        switch (action) {
          case 'approve': {
            if (article.status === 'PUBLISHED') {
              results.push({ id: article.id, ok: true });
              break;
            }
            const previousStatus = article.status;
            await db.article.update({
              where: { id: article.id },
              data: { status: 'PUBLISHED', publishedAt: article.publishedAt ?? now },
            });
            await recordStatusReview({
              articleId: article.id,
              reviewerId: admin.id,
              previousStatus,
              newStatus: 'PUBLISHED',
              note: note?.trim() || 'Disetujui (massal)',
            });
            await setLastEditor(article.id, admin.id);
            results.push({ id: article.id, ok: true });
            break;
          }
          case 'reject': {
            if (article.status === 'REJECTED') {
              results.push({ id: article.id, ok: true });
              break;
            }
            const previousStatus = article.status;
            await db.article.update({
              where: { id: article.id },
              data: { status: 'REJECTED' },
            });
            await recordStatusReview({
              articleId: article.id,
              reviewerId: admin.id,
              previousStatus,
              newStatus: 'REJECTED',
              note: note?.trim() || 'Ditolak (massal)',
            });
            await setLastEditor(article.id, admin.id);
            results.push({ id: article.id, ok: true });
            break;
          }
          case 'archive': {
            const previousStatus = article.status;
            await db.article.update({
              where: { id: article.id },
              data: { status: 'ARCHIVED' },
            });
            if (previousStatus !== 'ARCHIVED') {
              await recordStatusReview({
                articleId: article.id,
                reviewerId: admin.id,
                previousStatus,
                newStatus: 'ARCHIVED',
                note: note?.trim() || 'Diarsipkan oleh admin',
              });
              await setLastEditor(article.id, admin.id);
            }
            results.push({ id: article.id, ok: true });
            break;
          }
          case 'delete': {
            await db.article.delete({ where: { id: article.id } });
            results.push({ id: article.id, ok: true });
            break;
          }
        }
      } catch (e: any) {
        results.push({ id: article.id, ok: false, error: e.message });
      }
    }

    const succeeded = results.filter((r) => r.ok).length;
    return NextResponse.json({
      action,
      total: ids.length,
      processed: articles.length,
      succeeded,
      failed: results.length - succeeded,
      results,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
