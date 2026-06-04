import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import { Bookmark, Share2 } from "lucide-react";

export default function ArticleDetailSkeleton() {
  return (
    <div
      className="bg-white min-h-[60vh]"
      data-testid="article-detail-skeleton"
    >
      <article className="px-4 mx-auto max-w-7xl py-12">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted mb-6">
            Back to Articles
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="h-7 w-24 bg-jepang-red/10 animate-pulse" />
            <div className="h-7 w-16 bg-jepang-red/10 animate-pulse" />
          </div>

          <div className="space-y-6">
            <div className="h-12 bg-jepang-red/10 animate-pulse w-3/4" />
            <div className="h-5 bg-jepang-red/10 animate-pulse w-2/3" />
          </div>

          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-jepang-border text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-jepang-red/10 animate-pulse" />
              <div>
                <div className="h-4 w-28 bg-jepang-red/10 animate-pulse" />
                <p className="text-[10px] uppercase tracking-wider font-mono text-jepang-muted">
                  AUTHOR
                </p>
              </div>
            </div>
            <div className="h-3 w-24 bg-jepang-red/10 animate-pulse" />
            <div className="h-3 w-32 bg-jepang-red/10 animate-pulse" />
            <div className="flex gap-2 ml-auto">
              <button className="h-9 px-4 border border-jepang-border text-xs uppercase font-semibold">
                <Bookmark size={14} />
                Save
              </button>
              <button className="h-9 px-4 border border-jepang-border text-xs uppercase font-semibold">
                <Share2 size={14} />
                Share
              </button>
            </div>
          </div>

          <div className="my-8 -mx-4 md:mx-0">
            <div className="h-72 w-full bg-jepang-red/10 animate-pulse " />
          </div>

          <div className="space-y-4">
            <div className="h-5 w-full bg-jepang-red/10 animate-pulse" />
            <div className="h-5 w-full bg-jepang-red/10 animate-pulse" />
            <div className="h-5 w-5/6 bg-jepang-red/10 animate-pulse" />
            <div className="h-5 w-11/12 bg-jepang-red/10 animate-pulse" />
            <div className="h-5 w-3/4 bg-jepang-red/10 animate-pulse" />
            <div className="h-5 w-4/5 bg-jepang-red/10 animate-pulse" />
            <div className="h-5 w-2/3 bg-jepang-red/10 animate-pulse" />
          </div>

          <div className="pt-6 border-t border-jepang-border">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted mb-3">
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-20 bg-jepang-red/10 animate-pulse" />
              <div className="h-8 w-20 bg-jepang-red/10 animate-pulse" />
              <div className="h-8 w-20 bg-jepang-red/10 animate-pulse" />
            </div>
          </div>
        </div>
      </article>

      <section className="py-12 bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl">
          <h2 className="font-heading font-black text-2xl md:text-3xl tracking-tighter mb-6 pb-3 border-b-2 border-foreground">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}
