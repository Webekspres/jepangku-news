import { randomBytes } from 'node:crypto';
import type { NewsletterSubscription } from '@prisma/client';
import { db } from '@/lib/db';
import { queueNewsletterConfirmEmail } from '@/lib/newsletter/email';
import {
  isValidNewsletterEmail,
  normalizeNewsletterEmail,
} from '@/lib/newsletter/validation';

export { isValidNewsletterEmail, normalizeNewsletterEmail } from '@/lib/newsletter/validation';

export function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'Pembaca';
  return local.replace(/[._-]+/g, ' ').trim() || 'Pembaca';
}

function createUnsubscribeToken(): string {
  return randomBytes(32).toString('hex');
}

export type SubscribeNewsletterResult =
  | { ok: true; alreadySubscribed: true }
  | { ok: true; alreadySubscribed: false };

export async function subscribeToNewsletter(
  email: string,
  userId?: string | null,
): Promise<SubscribeNewsletterResult> {
  const normalized = normalizeNewsletterEmail(email);

  const existing = await db.newsletterSubscription.findUnique({
    where: { email: normalized },
  });

  if (existing?.isActive) {
    return { ok: true, alreadySubscribed: true };
  }

  let subscription: NewsletterSubscription;

  if (existing) {
    subscription = await db.newsletterSubscription.update({
      where: { id: existing.id },
      data: {
        isActive: true,
        unsubscribedAt: null,
        subscribedAt: new Date(),
        userId: userId ?? existing.userId,
      },
    });
  } else {
    subscription = await db.newsletterSubscription.create({
      data: {
        email: normalized,
        userId: userId ?? null,
        unsubscribeToken: createUnsubscribeToken(),
      },
    });
  }

  void queueNewsletterConfirmEmail({
    subscriptionId: subscription.id,
    email: subscription.email,
    unsubscribeToken: subscription.unsubscribeToken,
    userName: displayNameFromEmail(subscription.email),
    userId: subscription.userId,
  }).catch(() => {});

  return { ok: true, alreadySubscribed: false };
}

export async function getNewsletterSubscriptionByToken(token: string) {
  const trimmed = token.trim();
  if (!trimmed) return null;

  return db.newsletterSubscription.findUnique({
    where: { unsubscribeToken: trimmed },
    select: {
      id: true,
      email: true,
      isActive: true,
      subscribedAt: true,
      unsubscribedAt: true,
    },
  });
}

export async function unsubscribeNewsletterForUser(params: {
  userEmail: string;
  token?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const userEmail = normalizeNewsletterEmail(params.userEmail);
  const token = params.token?.trim();

  const subscription = token
    ? await db.newsletterSubscription.findUnique({ where: { unsubscribeToken: token } })
    : await db.newsletterSubscription.findUnique({ where: { email: userEmail } });

  if (!subscription) {
    return { ok: false, error: 'Langganan tidak ditemukan' };
  }

  if (subscription.email !== userEmail) {
    return { ok: false, error: 'Token tidak cocok dengan akun yang login' };
  }

  if (!subscription.isActive) {
    return { ok: true };
  }

  await db.newsletterSubscription.update({
    where: { id: subscription.id },
    data: {
      isActive: false,
      unsubscribedAt: new Date(),
    },
  });

  return { ok: true };
}

export type AdminNewsletterRow = {
  id: string;
  email: string;
  userId: string | null;
  userName: string | null;
  username: string | null;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
};

export async function listNewsletterSubscriptions(params: {
  page: number;
  pageSize: number;
  status?: 'active' | 'inactive' | 'all';
  search?: string;
}) {
  const { page, pageSize, status = 'all', search } = params;
  const where: {
    isActive?: boolean;
    email?: { contains: string; mode: 'insensitive' };
  } = {};

  if (status === 'active') where.isActive = true;
  if (status === 'inactive') where.isActive = false;

  const q = search?.trim();
  if (q) {
    where.email = { contains: q, mode: 'insensitive' };
  }

  const [total, rows] = await Promise.all([
    db.newsletterSubscription.count({ where }),
    db.newsletterSubscription.findMany({
      where,
      orderBy: { subscribedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, username: true } },
      },
    }),
  ]);

  const subscriptions: AdminNewsletterRow[] = rows.map((row) => ({
    id: row.id,
    email: row.email,
    userId: row.userId,
    userName: row.user?.name ?? null,
    username: row.user?.username ?? null,
    isActive: row.isActive,
    subscribedAt: row.subscribedAt.toISOString(),
    unsubscribedAt: row.unsubscribedAt?.toISOString() ?? null,
  }));

  return {
    subscriptions,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function deleteNewsletterSubscription(id: string): Promise<boolean> {
  const result = await db.newsletterSubscription.deleteMany({ where: { id } });
  return result.count > 0;
}

export async function exportNewsletterSubscriptions(params: {
  status?: 'active' | 'inactive' | 'all';
  search?: string;
}) {
  const { status = 'all', search } = params;
  const where: {
    isActive?: boolean;
    email?: { contains: string; mode: 'insensitive' };
  } = {};

  if (status === 'active') where.isActive = true;
  if (status === 'inactive') where.isActive = false;

  const q = search?.trim();
  if (q) {
    where.email = { contains: q, mode: 'insensitive' };
  }

  const rows = await db.newsletterSubscription.findMany({
    where,
    orderBy: { subscribedAt: 'desc' },
    take: 10000,
    include: {
      user: { select: { name: true, username: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    isActive: row.isActive,
    userName: row.user?.name ?? '',
    username: row.user?.username ?? '',
    subscribedAt: row.subscribedAt.toISOString(),
    unsubscribedAt: row.unsubscribedAt?.toISOString() ?? '',
  }));
}
