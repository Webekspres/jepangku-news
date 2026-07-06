import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { auditAdminEntity } from '@/lib/audit-routes';
import { db } from '@/lib/db';
import { getUserPointBalance, getUserPointTransactions } from '@/lib/points';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, username: true, email: true,
      role: true, status: true,
      avatarUrl: true, createdAt: true, updatedAt: true,
    },
  });
  if (!user) return apiError('User not found' , { status: 404 });

  const [totalPoints, recentTransactions, articles, bookmarkCount, quizAttempts, pollVotes] =
    await Promise.all([
    getUserPointBalance(id),
    getUserPointTransactions(id, 20),
    db.article.findMany({
      where: { authorId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { category: { select: { name: true, slug: true } } },
    }),
    db.bookmark.count({ where: { userId: id, deletedAt: null } }),
    db.quizAttempt.count({ where: { userId: id } }),
    db.pollVote.count({ where: { userId: id } }),
  ]);

  return apiSuccess({
    user: {
      ...user,
      totalPoints,
    },
    articles,
    recentTransactions: recentTransactions.map((tx: (typeof recentTransactions)[number]) => ({
      id: tx.id,
      activityType: tx.activityType,
      points: tx.points,
      description: tx.description,
      occurredAt: tx.occurredAt.toISOString(),
    })),
    stats: { bookmarkCount, quizAttempts, pollVotes, articleCount: articles.length },
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { role, status } = body;

  const updateData: Record<string, unknown> = {};
  if (role && ['USER', 'CONTRIBUTOR', 'ADMIN'].includes(role.toUpperCase())) updateData.role = role.toUpperCase();
  if (status && ['active', 'inactive', 'banned'].includes(status)) updateData.status = status;

  if (Object.keys(updateData).length === 0) {
    return apiError('No valid fields to update' , { status: 400 });
  }

  const updated = await db.user.update({ where: { id }, data: updateData });

  auditAdminEntity(admin, 'user', 'update', {
    type: 'user',
    id: updated.id,
    label: updated.name ?? updated.username ?? updated.email ?? updated.id,
    href: `/admin/users/${updated.id}`,
  });

  return apiSuccess({ message: 'User updated' });
}
