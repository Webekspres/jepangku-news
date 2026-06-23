"use client";

import CommentSection from "@/components/CommentSection";
import ReactionBar from "@/components/ReactionBar";
import AuthorProfileCard from "@/components/AuthorProfileCard";
import ArticleBreadcrumb from "@/components/articles/ArticleBreadcrumb";
import ArticleCoverImage from "@/components/articles/ArticleCoverImage";
import ArticleDetailContent from "@/components/articles/ArticleDetailContent";
import ArticleDetailHero from "@/components/articles/ArticleDetailHero";
import ArticleDetailMetaBar from "@/components/articles/ArticleDetailMetaBar";
import ArticleReadCompleteBanner from "@/components/articles/ArticleReadCompleteBanner";
import ArticleRelatedSection from "@/components/articles/ArticleRelatedSection";
import ArticleSidebarAd from "@/components/articles/ArticleSidebarAd";
import ArticleTagList from "@/components/articles/ArticleTagList";
import { useArticleDetail } from "@/hooks/useArticleDetail";
import { articlePageUrl } from "@/lib/site-url";

type ArticleDetailClientProps = {
  slug: string;
};

export default function ArticleDetailClient({ slug }: ArticleDetailClientProps) {
  const {
    article,
    loading,
    isLoading,
    isBookmarked,
    hasShared,
    readCompleted,
    contentRef,
    user,
    handleBookmark,
    handleShareComplete,
  } = useArticleDetail(slug);

  if (!article && !loading) return null;

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : articlePageUrl(slug);

  return (
    <div className="bg-white" data-testid="article-detail-page">
      <article className="px-4 mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="mx-auto w-full max-w-4xl min-w-0 lg:mx-0">
            <ArticleBreadcrumb
              isLoading={isLoading}
              title={article?.title}
              category={article?.category}
            />

            <ArticleDetailHero
              isLoading={isLoading}
              title={article?.title}
              excerpt={article?.excerpt}
            />

            <ArticleDetailMetaBar
              isLoading={isLoading}
              author={article?.author}
              viewCount={article?.viewCount}
              publishedAt={article?.publishedAt}
              isBookmarked={isBookmarked}
              onBookmark={handleBookmark}
              slug={slug}
              title={article?.title ?? ""}
              shareUrl={shareUrl}
              isAuthenticated={Boolean(user)}
              hasShared={hasShared}
              shareDisabled={loading || isLoading}
              onShared={handleShareComplete}
            />

            <ArticleCoverImage
              isLoading={isLoading}
              src={article?.coverImageUrl}
              alt={article?.title ?? "Cover artikel"}
            />

            <ArticleDetailContent
              ref={contentRef}
              isLoading={isLoading}
              html={article?.content}
            />

            {readCompleted && user && <ArticleReadCompleteBanner />}

            {!isLoading && article && (article.tags?.length ?? 0) > 0 && (
              <ArticleTagList tags={article.tags} />
            )}

            {article && (
              <>
                <ReactionBar targetType="ARTICLE" targetId={article.id} />
                {article.author.username && (
                  <AuthorProfileCard author={article.author} />
                )}
                <CommentSection targetType="ARTICLE" targetId={article.id} />
              </>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ArticleSidebarAd excludeArticleSlug={slug} />
            </div>
          </aside>
        </div>
      </article>

      <ArticleRelatedSection
        isLoading={isLoading}
        articles={article?.relatedArticles}
      />
    </div>
  );
}
