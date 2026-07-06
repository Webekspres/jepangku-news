import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { auditAdminEntity } from '@/lib/audit-routes';
import { getEmailTemplateDefinition } from '@/lib/email/template-definitions';
import {
  getEmailTemplateConfig,
  parseEmailTemplateIdParam,
  resetEmailTemplateConfig,
  upsertEmailTemplateConfig,
} from '@/lib/email/template-config';

type RouteParams = { params: Promise<{ templateId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { templateId: rawId } = await params;
  const templateId = parseEmailTemplateIdParam(rawId);
  if (!templateId) return apiError('Template not found' , { status: 404 });

  const definition = getEmailTemplateDefinition(templateId);
  const config = await getEmailTemplateConfig(templateId);

  return apiSuccess({
    ...config,
    label: definition.label,
    description: definition.description,
    category: definition.category,
    variables: definition.variables,
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { templateId: rawId } = await params;
  const templateId = parseEmailTemplateIdParam(rawId);
  if (!templateId) return apiError('Template not found' , { status: 404 });

  const body = await request.json().catch(() => null);
  const subject = typeof body?.subject === 'string' ? body.subject : '';
  const heading = typeof body?.heading === 'string' ? body.heading : '';
  const bodyHtml = typeof body?.bodyHtml === 'string' ? body.bodyHtml : '';
  const ctaLabel = typeof body?.ctaLabel === 'string' ? body.ctaLabel : '';
  const isEnabled = body?.isEnabled !== false;

  if (!subject.trim() || !heading.trim() || !bodyHtml.trim() || !ctaLabel.trim()) {
    return apiError('Semua field wajib diisi' , { status: 400 });
  }

  const saved = await upsertEmailTemplateConfig(
    templateId,
    { subject, heading, bodyHtml, ctaLabel, isEnabled },
    admin.id,
  );

  auditAdminEntity(admin, 'email_template', 'update', {
    type: 'email_template',
    id: templateId,
    label: getEmailTemplateDefinition(templateId).label,
    href: `/admin/email-config/${templateId}`,
  });

  return apiSuccess(saved);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { templateId: rawId } = await params;
  const templateId = parseEmailTemplateIdParam(rawId);
  if (!templateId) return apiError('Template not found' , { status: 404 });

  const reset = await resetEmailTemplateConfig(templateId);

  auditAdminEntity(admin, 'email_template', 'reset', {
    type: 'email_template',
    id: templateId,
    label: getEmailTemplateDefinition(templateId).label,
    href: `/admin/email-config/${templateId}`,
  });

  return apiSuccess(reset);
}
