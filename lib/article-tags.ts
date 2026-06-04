import { db } from './db';
import { createAdminSlug } from './slug';

export async function syncArticleTags(articleId: string, tagNames: string[]) {
  await db.articleTag.deleteMany({ where: { articleId } });

  for (const tagName of tagNames) {
    if (!tagName.trim()) continue;
    const tagSlug = createAdminSlug(tagName.trim());
    let tag = await db.tag.findUnique({ where: { slug: tagSlug } });
    if (!tag) {
      tag = await db.tag.create({ data: { name: tagName.trim(), slug: tagSlug } });
    }
    const existingLink = await db.articleTag.findFirst({
      where: { articleId, tagId: tag.id },
    });
    if (!existingLink) {
      await db.articleTag.create({ data: { articleId, tagId: tag.id } });
    }
  }
}

export async function resolveCategoryId(categoryId: string | null | undefined) {
  if (!categoryId) return null;
  const cat = await db.category.findFirst({
    where: { OR: [{ id: categoryId }, { slug: categoryId }] },
  });
  return cat?.id ?? null;
}
