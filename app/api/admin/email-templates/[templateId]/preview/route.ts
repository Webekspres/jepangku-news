import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { renderEmailFromConfig } from '@/lib/email/render-from-config';
import { getEmailTemplateDefinition } from '@/lib/email/template-definitions';
import { parseEmailTemplateIdParam } from '@/lib/email/template-config';

type RouteParams = { params: Promise<{ templateId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  const { templateId: rawId } = await params;
  const templateId = parseEmailTemplateIdParam(rawId);
  if (!templateId) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  const body = await request.json().catch(() => null);
  const subject = typeof body?.subject === 'string' ? body.subject : '';
  const heading = typeof body?.heading === 'string' ? body.heading : '';
  const bodyHtml = typeof body?.bodyHtml === 'string' ? body.bodyHtml : '';
  const ctaLabel = typeof body?.ctaLabel === 'string' ? body.ctaLabel : '';

  if (!subject.trim() || !heading.trim() || !bodyHtml.trim() || !ctaLabel.trim()) {
    return NextResponse.json({ error: 'Semua field wajib diisi untuk preview' }, { status: 400 });
  }

  const definition = getEmailTemplateDefinition(templateId);
  const rendered = renderEmailFromConfig({
    templateId,
    config: { subject, heading, bodyHtml, ctaLabel },
    payload: definition.samplePayload,
    checkEnabled: false,
    nonInteractive: true,
  });

  return NextResponse.json(rendered);
}
