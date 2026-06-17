import type {
  ContributorApplicationStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { db } from '@/lib/db';
import { sanitizeText } from '@/lib/sanitizer';

export type ContributorApplicationSummary = {
  id: string;
  status: ContributorApplicationStatus;
  motivation: string;
  portfolioUrl: string | null;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type AdminContributorApplication = ContributorApplicationSummary & {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatarUrl: string | null;
    role: Role;
    createdAt: string;
  };
  reviewedBy: {
    id: string;
    name: string;
    username: string;
  } | null;
};

const PAGE_SIZE = 20;

export async function getLatestContributorApplication(
  userId: string,
): Promise<ContributorApplicationSummary | null> {
  const row = await db.contributorApplication.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      motivation: true,
      portfolioUrl: true,
      adminNote: true,
      createdAt: true,
      reviewedAt: true,
    },
  });

  if (!row) return null;

  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  };
}

export async function getContributorApplicationStatusForUser(
  userId: string,
  role: Role,
): Promise<ContributorApplicationStatus | null> {
  if (role === 'CONTRIBUTOR' || role === 'ADMIN') return null;
  const latest = await getLatestContributorApplication(userId);
  return latest?.status ?? null;
}

export async function createContributorApplication(
  userId: string,
  input: { motivation: string; portfolioUrl?: string | null },
): Promise<ContributorApplicationSummary> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) throw new Error('USER_NOT_FOUND');
  if (user.role === 'CONTRIBUTOR' || user.role === 'ADMIN') {
    throw new Error('ALREADY_CONTRIBUTOR');
  }

  const pending = await db.contributorApplication.findFirst({
    where: { userId, status: 'PENDING' },
    select: { id: true },
  });
  if (pending) throw new Error('PENDING_EXISTS');

  const motivation = sanitizeText(input.motivation).trim();
  if (motivation.length < 20) throw new Error('MOTIVATION_TOO_SHORT');
  if (motivation.length > 2000) throw new Error('MOTIVATION_TOO_LONG');

  let portfolioUrl: string | null = null;
  if (input.portfolioUrl?.trim()) {
    const raw = input.portfolioUrl.trim();
    try {
      const parsed = new URL(raw);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('INVALID_PORTFOLIO_URL');
      }
      portfolioUrl = parsed.toString();
    } catch {
      throw new Error('INVALID_PORTFOLIO_URL');
    }
  }

  const created = await db.contributorApplication.create({
    data: {
      userId,
      motivation,
      portfolioUrl,
    },
    select: {
      id: true,
      status: true,
      motivation: true,
      portfolioUrl: true,
      adminNote: true,
      createdAt: true,
      reviewedAt: true,
    },
  });

  return {
    ...created,
    createdAt: created.createdAt.toISOString(),
    reviewedAt: null,
  };
}

export async function listContributorApplicationsForAdmin(options: {
  status?: ContributorApplicationStatus | '';
  page?: number;
}): Promise<{
  applications: AdminContributorApplication[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = Math.max(1, options.page ?? 1);
  const where: Prisma.ContributorApplicationWhereInput = {};
  if (options.status) where.status = options.status;

  const [rows, total] = await Promise.all([
    db.contributorApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            avatarUrl: true,
            role: true,
            createdAt: true,
          },
        },
        reviewedBy: {
          select: { id: true, name: true, username: true },
        },
      },
    }),
    db.contributorApplication.count({ where }),
  ]);

  return {
    applications: rows.map((row) => ({
      id: row.id,
      status: row.status,
      motivation: row.motivation,
      portfolioUrl: row.portfolioUrl,
      adminNote: row.adminNote,
      createdAt: row.createdAt.toISOString(),
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      user: {
        ...row.user,
        createdAt: row.user.createdAt.toISOString(),
      },
      reviewedBy: row.reviewedBy,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

async function reviewContributorApplication(
  applicationId: string,
  adminId: string,
  status: 'APPROVED' | 'REJECTED',
  adminNote?: string | null,
): Promise<void> {
  const note = adminNote ? sanitizeText(adminNote).trim() : null;
  if (status === 'REJECTED' && !note) throw new Error('NOTE_REQUIRED');

  await db.$transaction(async (tx) => {
    const application = await tx.contributorApplication.findUnique({
      where: { id: applicationId },
      select: { id: true, status: true, userId: true },
    });
    if (!application) throw new Error('NOT_FOUND');
    if (application.status !== 'PENDING') throw new Error('NOT_PENDING');

    await tx.contributorApplication.update({
      where: { id: applicationId },
      data: {
        status,
        adminNote: note,
        reviewedById: adminId,
        reviewedAt: new Date(),
      },
    });

    if (status === 'APPROVED') {
      await tx.user.update({
        where: { id: application.userId },
        data: { role: 'CONTRIBUTOR' },
      });
    }
  });
}

export async function approveContributorApplication(
  applicationId: string,
  adminId: string,
  adminNote?: string | null,
): Promise<void> {
  await reviewContributorApplication(applicationId, adminId, 'APPROVED', adminNote);
}

export async function rejectContributorApplication(
  applicationId: string,
  adminId: string,
  adminNote: string,
): Promise<void> {
  await reviewContributorApplication(applicationId, adminId, 'REJECTED', adminNote);
}
