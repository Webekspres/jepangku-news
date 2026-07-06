import { apiError, apiSuccess } from '@/lib/api-response';
import { db } from '@/lib/db';
import { captureException } from '@/lib/monitoring';
import { sanitizeHtmlContent, sanitizePlainField } from '@/lib/sanitizer';
import { recordArticleView } from '@/lib/record-article-view';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const article = await db.article.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            avatarUrl: true,
            profile: { select: { displayName: true, bio: true } },
          },
        },
        category: { select: { id: true, name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    if (!article) {
      return apiError('Article not found' , { status: 404 });
    }

    await Promise.all([
      db.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 }, weeklyViewCount: { increment: 1 } },
      }),
      recordArticleView(article.id, request),
    ]);

    // Related articles
    let relatedArticles: any[] = [];
    if (article.categoryId) {
      relatedArticles = await db.article.findMany({
        where: {
          categoryId: article.categoryId,
          status: 'PUBLISHED',
          id: { not: article.id },
        },
        take: 3,
        include: {
          author: { select: { name: true, username: true } },
          category: { select: { name: true, slug: true } },
        },
      });
    }

    const result = {
      ...article,
      title: sanitizePlainField(article.title, 300),
      excerpt: article.excerpt ? sanitizePlainField(article.excerpt, 500) : null,
      content: sanitizeHtmlContent(article.content),
      tags: article.tags.map((at: { tag: { id: string; name: string; slug: string } }) => at.tag),
      author: {
        name: article.author.name,
        username: article.author.username,
        avatarUrl: article.author.avatarUrl,
        displayName: article.author.profile?.displayName ?? article.author.name,
        bio: article.author.profile?.bio ?? null,
      },
      relatedArticles,
    };

    return apiSuccess(result);
  } catch (e: any) {
    await captureException(e, { route: 'articles-get', slug });
    return apiError(e.message , { status: 500 });
  }
}
