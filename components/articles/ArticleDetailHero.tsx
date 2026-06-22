type ArticleDetailHeroProps = {
  isLoading: boolean;
  title?: string;
  excerpt?: string | null;
};

export default function ArticleDetailHero({
  isLoading,
  title,
  excerpt,
}: ArticleDetailHeroProps) {
  return (
    <>
      <h1
        className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-6 leading-[1.05]"
        data-testid="article-title"
      >
        {isLoading ? (
          <div className="h-14 w-full max-w-3xl bg-jepang-red/10 animate-pulse" />
        ) : (
          title
        )}
      </h1>

      {isLoading ? (
        <div className="space-y-3 mb-6">
          <div className="h-5 bg-jepang-red/10 animate-pulse w-full" />
          <div className="h-5 bg-jepang-red/10 animate-pulse w-5/6" />
        </div>
      ) : (
        excerpt && (
          <p
            className="text-xl text-jepang-muted leading-relaxed mb-6 font-light"
            data-testid="article-excerpt"
          >
            {excerpt}
          </p>
        )
      )}
    </>
  );
}
