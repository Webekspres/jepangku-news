import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from '@/lib/auth';
import { auditAdminEntity } from '@/lib/audit-routes';
import { db } from '@/lib/db';
import { captureException } from '@/lib/monitoring';
import { isInfoPageSlug } from '@/lib/info-pages';
import { sanitizeHtmlContent, sanitizeText } from '@/lib/sanitizer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { slug } = await params;
  if (!isInfoPageSlug(slug)) {
    return apiError('Page not found' , { status: 404 });
  }

  const page = await db.infoPage.findUnique({ where: { slug } });
  if (!page) return apiError('Page not found' , { status: 404 });

  return apiSuccess({
    ...page,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError('Admin access required' , { status: 403 });

  const { slug } = await params;
  if (!isInfoPageSlug(slug)) {
    return apiError('Page not found' , { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      content,
      metaTitle,
      metaDescription,
      isPublished,
    } = body;

    const safeTitle = sanitizeText(String(title || ''));
    const safeContent = sanitizeHtmlContent(String(content || ''));

    if (!safeTitle) {
      return apiError('Judul wajib diisi' , { status: 400 });
    }
    if (!safeContent) {
      return apiError('Konten wajib diisi' , { status: 400 });
    }

    const existing = await db.infoPage.findUnique({ where: { slug } });
    if (!existing) {
      return apiError('Page not found' , { status: 404 });
    }

    const page = await db.infoPage.update({
      where: { slug },
      data: {
        title: safeTitle,
        subtitle: subtitle ? sanitizeText(String(subtitle)) : null,
        content: safeContent,
        metaTitle: metaTitle ? sanitizeText(String(metaTitle)) : null,
        metaDescription: metaDescription ? sanitizeText(String(metaDescription)) : null,
        isPublished: typeof isPublished === 'boolean' ? isPublished : existing.isPublished,
        updatedById: admin.id,
      },
    });

    auditAdminEntity(admin, 'info_page', 'update', {
      type: 'info_page',
      id: page.slug,
      label: page.title,
      href: `/admin/info-pages/${slug}/edit`,
    });

    return apiSuccess({
      ...page,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    await captureException(e, { route: 'admin-info-pages-update', slug });
    return apiError(message , { status: 500 });
  }
}
