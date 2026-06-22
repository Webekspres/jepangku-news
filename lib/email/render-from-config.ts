import { SITE_BRAND_NAME } from '@/lib/site-config';
import type { EmailTemplateId, EmailTemplatePayload } from '@/lib/email/types';
import {
  getEmailTemplateDefinition,
  type EmailTemplateDefaultConfig,
} from '@/lib/email/template-definitions';
import {
  htmlToPlainText,
  interpolateTemplate,
  payloadToInterpolationMap,
} from '@/lib/email/interpolate';
import { getResolvedEmailTemplateConfig } from '@/lib/email/template-config';

export class EmailTemplateDisabledError extends Error {
  constructor(templateId: EmailTemplateId) {
    super(`EMAIL_TEMPLATE_DISABLED:${templateId}`);
    this.name = 'EmailTemplateDisabledError';
  }
}

function emailLayout(
  title: string,
  body: string,
  ctaLabel: string,
  ctaUrl: string,
  nonInteractive = false,
): string {
  const previewStyles = nonInteractive
    ? `<style>
  a, button, [role="button"] {
    pointer-events: none !important;
    cursor: default !important;
  }
</style>`
    : '';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  ${previewStyles}
</head>
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

export function renderEmailFromConfig(params: {
  templateId: EmailTemplateId;
  config: EmailTemplateDefaultConfig & { isEnabled?: boolean };
  payload: EmailTemplatePayload[EmailTemplateId];
  checkEnabled?: boolean;
  nonInteractive?: boolean;
}): { subject: string; html: string; text: string } {
  if (params.checkEnabled && params.config.isEnabled === false) {
    throw new EmailTemplateDisabledError(params.templateId);
  }

  const definition = getEmailTemplateDefinition(params.templateId);
  const values = payloadToInterpolationMap(params.payload as Record<string, unknown>);
  const ctaUrl = definition.resolveCtaUrl(params.payload);

  const subject = interpolateTemplate(params.config.subject, values);
  const heading = interpolateTemplate(params.config.heading, values);
  const bodyHtml = interpolateTemplate(params.config.bodyHtml, values);
  const ctaLabel = interpolateTemplate(params.config.ctaLabel, values);

  const html = emailLayout(
    heading,
    bodyHtml,
    ctaLabel,
    ctaUrl.replace(/"/g, '&quot;'),
    params.nonInteractive ?? false,
  );
  const text = htmlToPlainText(`${heading}\n\n${bodyHtml}\n\n${ctaLabel}: ${ctaUrl}`);

  return { subject, html, text };
}

export async function renderStoredEmailTemplate<T extends EmailTemplateId>(
  templateId: T,
  payload: EmailTemplatePayload[T],
  options?: { checkEnabled?: boolean },
): Promise<{ subject: string; html: string; text: string }> {
  const stored = await getResolvedEmailTemplateConfig(templateId);
  return renderEmailFromConfig({
    templateId,
    config: stored,
    payload,
    checkEnabled: options?.checkEnabled ?? true,
  });
}
