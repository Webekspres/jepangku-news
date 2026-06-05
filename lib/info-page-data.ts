import { db } from '@/lib/db';
import { isInfoPageSlug } from '@/lib/info-pages';
import { sanitizeHtmlContent, sanitizePlainField } from '@/lib/sanitizer';

export async function getPublishedInfoPage(slug: string) {
  if (!isInfoPageSlug(slug)) return null;

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

  if (!page) return null;

  return {
    ...page,
    title: sanitizePlainField(page.title, 200),
    subtitle: page.subtitle ? sanitizePlainField(page.subtitle, 300) : null,
    content: sanitizeHtmlContent(page.content),
    metaTitle: page.metaTitle ? sanitizePlainField(page.metaTitle, 200) : null,
    metaDescription: page.metaDescription
      ? sanitizePlainField(page.metaDescription, 300)
      : null,
  };
}
