import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-response';
import { db } from '@/lib/db';
import { captureException } from '@/lib/monitoring';
import { isInfoPageSlug } from '@/lib/info-pages';
import { sanitizeHtmlContent, sanitizePlainField } from '@/lib/sanitizer';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!isInfoPageSlug(slug)) {
    return apiError('Page not found' , { status: 404 });
  }

  try {
    const page = await db.infoPage.findFirst({
      where: { slug, isPublished: true },
      select: {
        slug: true,
        title: true,
        subtitle: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        updatedAt: true,
      },
    });

    if (!page) {
      return apiError('Page not found' , { status: 404 });
    }

    return apiSuccess({
      ...page,
      title: sanitizePlainField(page.title, 200),
      subtitle: page.subtitle ? sanitizePlainField(page.subtitle, 300) : null,
      content: sanitizeHtmlContent(page.content),
      metaTitle: page.metaTitle ? sanitizePlainField(page.metaTitle, 200) : null,
      metaDescription: page.metaDescription
        ? sanitizePlainField(page.metaDescription, 300)
        : null,
      updatedAt: page.updatedAt.toISOString(),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    await captureException(e, { route: 'pages-get', slug });
    return apiError(message , { status: 500 });
  }
}
