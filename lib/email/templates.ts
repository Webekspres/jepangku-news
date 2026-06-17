import { toAbsoluteUrl } from '@/lib/site-url';
import { SITE_BRAND_NAME } from '@/lib/site-config';
import type { EmailTemplateId, EmailTemplatePayload } from '@/lib/email/types';

function layout(title: string, body: string, ctaLabel: string, ctaUrl: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<body style="margin:0;padding:0;background:#f5f5f7;font-family:Arial,sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;">
        <tr><td style="padding:24px;background:#1E1B57;color:#ffffff;">
          <strong style="font-size:18px;">${SITE_BRAND_NAME}</strong>
        </td></tr>
        <tr><td style="padding:24px;">
          <h1 style="margin:0 0 12px;font-size:20px;">${title}</h1>
          <div style="font-size:14px;line-height:1.6;color:#4b5563;">${body}</div>
          <p style="margin:24px 0 0;">
            <a href="${ctaUrl}" style="display:inline-block;background:#FF4B2B;color:#ffffff;text-decoration:none;padding:12px 18px;font-weight:bold;">${ctaLabel}</a>
          </p>
        </td></tr>
        <tr><td style="padding:16px 24px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
          Email otomatis dari ${SITE_BRAND_NAME}. Jangan balas email ini.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function renderEmailTemplate<T extends EmailTemplateId>(
  template: T,
  payload: EmailTemplatePayload[T],
): { subject: string; html: string; text: string } {
  switch (template) {
    case 'article_rejected': {
      const p = payload as EmailTemplatePayload['article_rejected'];
      const note = p.note
        ? `<p><strong>Catatan editor:</strong> ${escapeHtml(p.note)}</p>`
        : '';
      const previewUrl = toAbsoluteUrl(p.previewUrl);
      return {
        subject: `Artikel ditolak: ${p.articleTitle}`,
        html: layout(
          'Artikel Anda perlu perbaikan',
          `<p>Halo ${escapeHtml(p.userName)},</p>
           <p>Artikel <strong>${escapeHtml(p.articleTitle)}</strong> belum dapat dipublikasikan.</p>
           ${note}`,
          'Buka pratinjau artikel',
          previewUrl,
        ),
        text: `Artikel "${p.articleTitle}" ditolak. Buka: ${previewUrl}`,
      };
    }
    case 'contributor_approved': {
      const p = payload as EmailTemplatePayload['contributor_approved'];
      const note = p.adminNote
        ? `<p><strong>Catatan:</strong> ${escapeHtml(p.adminNote)}</p>`
        : '';
      const submitUrl = toAbsoluteUrl(p.submitUrl);
      return {
        subject: `Lamaran kontributor disetujui — ${SITE_BRAND_NAME}`,
        html: layout(
          'Selamat, Anda kini kontributor!',
          `<p>Halo ${escapeHtml(p.userName)},</p>
           <p>Lamaran kontributor Anda disetujui. Anda sudah dapat menulis dan mengirim artikel.</p>
           ${note}`,
          'Tulis artikel',
          submitUrl,
        ),
        text: `Lamaran kontributor disetujui. Mulai menulis: ${submitUrl}`,
      };
    }
    case 'contributor_rejected': {
      const p = payload as EmailTemplatePayload['contributor_rejected'];
      const applyUrl = toAbsoluteUrl(p.applyUrl);
      return {
        subject: `Update lamaran kontributor — ${SITE_BRAND_NAME}`,
        html: layout(
          'Lamaran kontributor belum disetujui',
          `<p>Halo ${escapeHtml(p.userName)},</p>
           <p>Lamaran kontributor Anda belum dapat disetujui saat ini.</p>
           <p><strong>Catatan:</strong> ${escapeHtml(p.adminNote ?? 'Silakan perbaiki dan ajukan ulang.')}</p>`,
          'Ajukan ulang',
          applyUrl,
        ),
        text: `Lamaran kontributor ditolak. Ajukan ulang: ${applyUrl}`,
      };
    }
    case 'welcome_user': {
      const p = payload as EmailTemplatePayload['welcome_user'];
      const homeUrl = toAbsoluteUrl(p.homeUrl);
      return {
        subject: `Selamat datang di ${SITE_BRAND_NAME}!`,
        html: layout(
          `Halo, ${escapeHtml(p.userName)}!`,
          `<p>Terima kasih sudah bergabung di ${SITE_BRAND_NAME}.</p>
           <p>Baca artikel, kumpulkan poin, ikuti kuis & polling, dan jelajahi komunitas pecinta Jepang.</p>`,
          'Mulai jelajah',
          homeUrl,
        ),
        text: `Selamat datang di ${SITE_BRAND_NAME}! Mulai di ${homeUrl}`,
      };
    }
    default:
      throw new Error(`Unknown email template: ${template satisfies never}`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
