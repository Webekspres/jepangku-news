import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { exportNewsletterSubscriptions } from '@/lib/newsletter';

function escapeCsv(value: string | number | boolean | null | undefined): string {
  const s = value == null ? '' : String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const status =
    statusParam === 'active' || statusParam === 'inactive' ? statusParam : 'all';
  const search = searchParams.get('search') ?? undefined;

  const rows = await exportNewsletterSubscriptions({ status, search });

  const headers = [
    'id',
    'email',
    'isActive',
    'userName',
    'username',
    'subscribedAt',
    'unsubscribedAt',
  ];

  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        escapeCsv(r.id),
        escapeCsv(r.email),
        escapeCsv(r.isActive),
        escapeCsv(r.userName),
        escapeCsv(r.username),
        escapeCsv(r.subscribedAt),
        escapeCsv(r.unsubscribedAt),
      ].join(','),
    ),
  ];

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="newsletter-subscribers.csv"',
    },
  });
}
