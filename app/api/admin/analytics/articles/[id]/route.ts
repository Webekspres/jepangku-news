import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getArticleViewSeries, parseAnalyticsPeriod, periodLabel } from '@/lib/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const period = parseAnalyticsPeriod(searchParams.get('period'));

  const article = await db.article.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, viewCount: true, status: true },
  });
  if (!article) {
    return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
  }

  const views = await getArticleViewSeries(id, period);

  return NextResponse.json({
    article,
    period,
    periodLabel: periodLabel(period),
    ...views,
    lifetimeViews: article.viewCount,
  });
}
