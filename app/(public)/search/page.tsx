"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ArticleCardSkeleton from "@/components/skeletons/ArticleCardSkeleton";
import SectionHeader from "@/components/SectionHeader";
import { Search, MessageSquare, Zap, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams?.get("q") || "";
  const [query, setQuery] = useState(q);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    articles: any[];
    quizzes: any[];
    polls: any[];
    total: number;
  }>({ articles: [], quizzes: [], polls: [], total: 0 });

  useEffect(() => {
    setQuery(q);
    if (!q.trim()) {
      setResults({ articles: [], quizzes: [], polls: [], total: 0 });
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      .then((r) => r.json())
      .then((d) => {
        setResults({
          articles: Array.isArray(d.articles) ? d.articles : [],
          quizzes: Array.isArray(d.quizzes) ? d.quizzes : [],
          polls: Array.isArray(d.polls) ? d.polls : [],
          total: d.total || 0,
        });
      })
      .catch(() => setResults({ articles: [], quizzes: [], polls: [], total: 0 }))
      .finally(() => setLoading(false));
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const hasResults =
    results.articles.length > 0 ||
    results.quizzes.length > 0 ||
    results.polls.length > 0;

  return (
    <div className="bg-white min-h-screen" data-testid="search-page">
      <SectionHeader
        label="検索 / Pencarian"
        title="Hasil Pencarian"
        subtitle={
          q
            ? `Menampilkan hasil untuk "${q}"`
            : "Cari artikel, kuis, dan polling sekaligus"
        }
      />

      <div className="px-4 mx-auto max-w-7xl py-8">
        <form onSubmit={handleSearch} className="flex gap-2 mb-10 max-w-2xl">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari artikel, kuis, polling..."
            data-testid="search-page-input"
          />
          <Button type="submit" data-testid="search-page-submit">
            <Search size={16} strokeWidth={2} />
          </Button>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        ) : !q.trim() ? (
          <p className="text-center text-jepang-muted py-16" data-testid="search-empty-query">
            Ketik kata kunci lalu tekan cari.
          </p>
        ) : !hasResults ? (
          <p className="text-center text-jepang-muted py-16" data-testid="search-no-results">
            Tidak ada hasil untuk &ldquo;{q}&rdquo;.
          </p>
        ) : (
          <div className="space-y-12">
            {results.articles.length > 0 && (
              <section data-testid="search-articles">
                <h2 className="font-heading font-black text-2xl tracking-tighter mb-6 flex items-center gap-2">
                  Artikel
                  <span className="text-jepang-red text-lg">({results.articles.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}

            {results.quizzes.length > 0 && (
              <section data-testid="search-quizzes">
                <h2 className="font-heading font-black text-2xl tracking-tighter mb-6 flex items-center gap-2">
                  <Zap size={22} className="text-jepang-red" />
                  Kuis
                  <span className="text-jepang-red text-lg">({results.quizzes.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.quizzes.map((quiz) => (
                    <Link
                      key={quiz.id}
                      href={`/quizzes/${quiz.slug}`}
                      className="block border border-jepang-border p-5 hover:border-foreground transition-colors"
                      data-testid={`search-quiz-${quiz.slug}`}
                    >
                      <Badge variant="black" className="mb-2">KUIS</Badge>
                      <h3 className="font-heading font-bold text-lg">{quiz.title}</h3>
                      <p className="text-xs font-mono text-jepang-muted mt-2 uppercase tracking-wider">
                        {quiz.questionCount || 0} pertanyaan
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.polls.length > 0 && (
              <section data-testid="search-polls">
                <h2 className="font-heading font-black text-2xl tracking-tighter mb-6 flex items-center gap-2">
                  <MessageSquare size={22} className="text-jepang-red" />
                  Polling & Voting
                  <span className="text-jepang-red text-lg">({results.polls.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.polls.map((poll) => (
                    <Link
                      key={poll.id}
                      href={`/polls/${poll.slug}`}
                      className="block border border-jepang-border p-5 hover:border-foreground transition-colors"
                      data-testid={`search-poll-${poll.slug}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={poll.pollType === "VOTING" ? "red" : "black"}>
                          {poll.pollType}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs font-mono text-jepang-red">
                          <Award size={11} /> +{poll.pointsReward || 5}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-lg">{poll.title}</h3>
                      <p className="text-xs font-mono text-jepang-muted mt-2 uppercase tracking-wider">
                        {poll.totalVotes || 0} suara
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-jepang-muted">
          Memuat...
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
