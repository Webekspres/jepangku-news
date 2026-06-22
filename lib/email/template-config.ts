import { db } from '@/lib/db';
import type { EmailTemplateId } from '@/lib/email/types';
import {
  EMAIL_TEMPLATE_DEFINITIONS,
  EMAIL_TEMPLATE_IDS,
  getEmailTemplateDefinition,
  isEmailTemplateId,
} from '@/lib/email/template-definitions';

export type EmailTemplateConfigDto = {
  templateId: EmailTemplateId;
  subject: string;
  heading: string;
  bodyHtml: string;
  ctaLabel: string;
  isEnabled: boolean;
  isCustomized: boolean;
  updatedAt: string | null;
};

export type EmailTemplateListItem = EmailTemplateConfigDto & {
  label: string;
  description: string;
  category: string;
  variables: { key: string; label: string; description: string }[];
};

function toDto(
  templateId: EmailTemplateId,
  row: {
    subject: string;
    heading: string;
    bodyHtml: string;
    ctaLabel: string;
    isEnabled: boolean;
    updatedAt: Date;
  } | null,
): EmailTemplateConfigDto {
  const defaults = getEmailTemplateDefinition(templateId).defaultConfig;

  if (!row) {
    return {
      templateId,
      subject: defaults.subject,
      heading: defaults.heading,
      bodyHtml: defaults.bodyHtml,
      ctaLabel: defaults.ctaLabel,
      isEnabled: true,
      isCustomized: false,
      updatedAt: null,
    };
  }

  return {
    templateId,
    subject: row.subject,
    heading: row.heading,
    bodyHtml: row.bodyHtml,
    ctaLabel: row.ctaLabel,
    isEnabled: row.isEnabled,
    isCustomized: true,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function getStaticEmailTemplateList(): EmailTemplateListItem[] {
  return EMAIL_TEMPLATE_IDS.map((templateId) => {
    const definition = EMAIL_TEMPLATE_DEFINITIONS[templateId];
    const dto = toDto(templateId, null);
    return {
      ...dto,
      label: definition.label,
      description: definition.description,
      category: definition.category,
      variables: definition.variables,
    };
  });
}

export async function listEmailTemplateConfigs(): Promise<EmailTemplateListItem[]> {
  const fallback = getStaticEmailTemplateList();

  try {
    const rows = await db.emailTemplateConfig.findMany({
      where: { templateId: { in: [...EMAIL_TEMPLATE_IDS] } },
    });
    const byId = new Map(rows.map((row) => [row.templateId, row]));

    return EMAIL_TEMPLATE_IDS.map((templateId) => {
      const definition = EMAIL_TEMPLATE_DEFINITIONS[templateId];
      const dto = toDto(templateId, byId.get(templateId) ?? null);
      return {
        ...dto,
        label: definition.label,
        description: definition.description,
        category: definition.category,
        variables: definition.variables,
      };
    });
  } catch {
    return fallback;
  }
}

export async function getEmailTemplateConfig(
  templateId: EmailTemplateId,
): Promise<EmailTemplateConfigDto> {
  try {
    const row = await db.emailTemplateConfig.findUnique({ where: { templateId } });
    return toDto(templateId, row);
  } catch {
    return toDto(templateId, null);
  }
}

export async function getResolvedEmailTemplateConfig(templateId: EmailTemplateId): Promise<{
  subject: string;
  heading: string;
  bodyHtml: string;
  ctaLabel: string;
  isEnabled: boolean;
  isCustomized: boolean;
}> {
  const dto = await getEmailTemplateConfig(templateId);
  return {
    subject: dto.subject,
    heading: dto.heading,
    bodyHtml: dto.bodyHtml,
    ctaLabel: dto.ctaLabel,
    isEnabled: dto.isEnabled,
    isCustomized: dto.isCustomized,
  };
}

export async function upsertEmailTemplateConfig(
  templateId: EmailTemplateId,
  input: {
    subject: string;
    heading: string;
    bodyHtml: string;
    ctaLabel: string;
    isEnabled: boolean;
  },
  updatedById: string,
): Promise<EmailTemplateConfigDto> {
  const row = await db.emailTemplateConfig.upsert({
    where: { templateId },
    create: {
      templateId,
      subject: input.subject.trim(),
      heading: input.heading.trim(),
      bodyHtml: input.bodyHtml,
      ctaLabel: input.ctaLabel.trim(),
      isEnabled: input.isEnabled,
      updatedById,
    },
    update: {
      subject: input.subject.trim(),
      heading: input.heading.trim(),
      bodyHtml: input.bodyHtml,
      ctaLabel: input.ctaLabel.trim(),
      isEnabled: input.isEnabled,
      updatedById,
    },
  });

  return toDto(templateId, row);
}

export async function resetEmailTemplateConfig(
  templateId: EmailTemplateId,
): Promise<EmailTemplateConfigDto> {
  await db.emailTemplateConfig.deleteMany({ where: { templateId } });
  return toDto(templateId, null);
}

export function parseEmailTemplateIdParam(value: string): EmailTemplateId | null {
  return isEmailTemplateId(value) ? value : null;
}
