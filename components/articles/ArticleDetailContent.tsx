import { forwardRef } from "react";

type ArticleDetailContentProps = {
  isLoading: boolean;
  html?: string;
};

const ArticleDetailContent = forwardRef<HTMLDivElement, ArticleDetailContentProps>(
  function ArticleDetailContent({ isLoading, html }, ref) {
    return (
      <div className="article-content" data-testid="article-content">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-5 bg-jepang-red/10 animate-pulse w-full" />
            <div className="h-5 bg-jepang-red/10 animate-pulse w-full" />
            <div className="h-5 bg-jepang-red/10 animate-pulse w-5/6" />
            <div className="h-5 bg-jepang-red/10 animate-pulse w-11/12" />
            <div className="h-5 bg-jepang-red/10 animate-pulse w-3/4" />
            <div className="h-5 bg-jepang-red/10 animate-pulse w-4/5" />
            <div className="h-5 bg-jepang-red/10 animate-pulse w-2/3" />
          </div>
        ) : (
          <div ref={ref} dangerouslySetInnerHTML={{ __html: html ?? "" }} />
        )}
      </div>
    );
  },
);

export default ArticleDetailContent;
