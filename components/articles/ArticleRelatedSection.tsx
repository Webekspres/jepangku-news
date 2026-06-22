import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import type { Article } from "@/components/ArticleCard";
import { cn } from "@/lib/utils";

type ArticleRelatedSectionProps = {
  isLoading: boolean;
  articles?: Article[];
  embedded?: boolean;
  title?: string;
};

export default function ArticleRelatedSection({
  isLoading,
  articles = [],
  embedded = false,
  title = "Artikel Terkait",
}: ArticleRelatedSectionProps) {
  if (!isLoading && articles.length === 0) return null;

  return (
    <section
      className={cn(
        embedded
          ? "mt-12 border-t border-jepang-border pt-8"
          : "bg-jepang-off-white py-12",
      )}
      data-testid={embedded ? "profile-related-articles" : "article-related-section"}
    >
      <div className={cn(!embedded && "mx-auto max-w-7xl px-4")}>
        <h2
          className={cn(
            "font-heading font-black tracking-tighter mb-6 border-b border-jepang-border pb-3",
            embedded ? "text-xl" : "text-2xl md:text-3xl",
          )}
        >
          {title}
        </h2>
        <div
          className={cn(
            "grid gap-6",
            embedded ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 md:grid-cols-3",
          )}
        >
          {isLoading
            ? [1, 2, 3].map((key) => <ArticleCardSkeleton key={key} />)
            : articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
        </div>
      </div>
    </section>
  );
}
