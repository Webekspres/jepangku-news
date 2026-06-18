import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import type { Article } from "@/components/ArticleCard";

type ArticleRelatedSectionProps = {
  isLoading: boolean;
  articles?: Article[];
};

export default function ArticleRelatedSection({
  isLoading,
  articles = [],
}: ArticleRelatedSectionProps) {
  if (!isLoading && articles.length === 0) return null;

  return (
    <section className="py-12 bg-jepang-off-white">
      <div className="px-4 mx-auto max-w-7xl">
        <h2 className="font-heading font-black text-2xl md:text-3xl tracking-tighter mb-6 pb-3 border-b border-jepang-border">
          Artikel Terkait
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
