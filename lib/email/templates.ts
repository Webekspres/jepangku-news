import type { EmailTemplateId, EmailTemplatePayload } from '@/lib/email/types';
import { renderStoredEmailTemplate } from '@/lib/email/render-from-config';

export { EmailTemplateDisabledError } from '@/lib/email/render-from-config';

export async function renderEmailTemplate<T extends EmailTemplateId>(
  template: T,
  payload: EmailTemplatePayload[T],
): Promise<{ subject: string; html: string; text: string }> {
  return renderStoredEmailTemplate(template, payload);
}
