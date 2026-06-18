import { db } from '@/lib/db';
import { renderEmailTemplate } from '@/lib/email/templates';
import { queueEmailSafe } from '@/lib/email/queue';
import { sendTransactionalEmail } from '@/lib/email/transport';
import { isEmailConfigured } from '@/lib/email/config';
import { logger } from '@/lib/logger';
import { toAbsoluteUrl } from '@/lib/site-url';
import { SITE_BRAND_NAME } from '@/lib/site-config';

export async function queueNewsletterConfirmEmail(params: {
  subscriptionId: string;
  email: string;
  unsubscribeToken: string;
  userName: string;
  userId: string | null;
}): Promise<void> {
  if (!isEmailConfigured()) return;

  const unsubscribeUrl = toAbsoluteUrl(
    `/newsletter/unsubscribe?token=${encodeURIComponent(params.unsubscribeToken)}`,
  );

  const payload = {
    userName: params.userName,
    homeUrl: '/',
    unsubscribeUrl,
  };

  const subject = `Anda berlangganan newsletter ${SITE_BRAND_NAME}`;

  if (params.userId) {
    queueEmailSafe({
      userId: params.userId,
      toEmail: params.email,
      template: 'newsletter_subscribed',
      subject,
      dedupeKey: `email:newsletter_subscribed:${params.subscriptionId}`,
      payload,
    });
    return;
  }

  try {
    const rendered = renderEmailTemplate('newsletter_subscribed', payload);
    await sendTransactionalEmail({
      to: params.email,
      subject: rendered.subject || subject,
      html: rendered.html,
      text: rendered.text,
    });
  } catch (error) {
    logger.warn('newsletter.confirm_email.failed', {
      subscriptionId: params.subscriptionId,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
  }
}

/** Link guest subscriptions when user registers with the same email. */
export async function linkNewsletterSubscriptionToUser(
  userId: string,
  email: string,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await db.newsletterSubscription.updateMany({
    where: { email: normalized, userId: null },
    data: { userId },
  });
}
