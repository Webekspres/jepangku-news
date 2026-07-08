import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { getUserPointTransactions } from '@/lib/points';
import { withRequestLogging } from '@/lib/logging/request-logger';

function escapeCsv(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const GET = withRequestLogging(async (request: NextRequest) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return apiError('Not authenticated', { status: 401, code: 'UNAUTHORIZED' });
  }

  const transactions = await getUserPointTransactions(user.id, 5000);

  const headers = [
    'id',
    'activityType',
    'sourceType',
    'sourceId',
    'points',
    'description',
    'occurredAt',
  ];

  const lines = [
    headers.join(','),
    ...transactions.map((tx) =>
      [
        escapeCsv(tx.id),
        escapeCsv(tx.activityType),
        escapeCsv(tx.sourceType),
        escapeCsv(tx.sourceId),
        escapeCsv(tx.points),
        escapeCsv(tx.description),
        escapeCsv(tx.occurredAt.toISOString()),
      ].join(','),
    ),
  ];

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="riwayat-poin.csv"',
    },
  });
});

export { GET };
