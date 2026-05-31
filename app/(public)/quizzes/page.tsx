'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Award } from 'lucide-react';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quizzes?status=ACTIVE').then((r) => r.json()).then((d) => { setQuizzes(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  return (
    <div className="bg-white min-h-screen" data-testid="quiz-list-page">
      <section className="border-b-2 border-jepang-black bg-jepang-black text-white">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <p className="small-caps text-jepang-red mb-2">クイズ / QUIZ</p>
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-3">Test Your Knowledge</h1>
          <p className="text-zinc-300 max-w-2xl">Ikuti quiz tentang anime, manga, budaya Jepang, dan dapatkan poin!</p>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-12">
        {loading ? (
          <p className="text-center small-caps text-jepang-muted py-12">Loading quizzes...</p>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz: any) => (
              <Link key={quiz.id} href={`/quizzes/${quiz.slug}`} className="group block bg-white border border-jepang-border hover:border-jepang-black transition-all" data-testid={`quiz-card-${quiz.slug}`}>
                {quiz.thumbnailUrl ? (
                  <div className="aspect-video overflow-hidden bg-jepang-off-white">
                    <img src={quiz.thumbnailUrl} alt={quiz.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="aspect-video bg-jepang-black flex items-center justify-center">
                    <Zap size={48} strokeWidth={1.5} className="text-jepang-red" />
                  </div>
                )}
                <div className="p-5">
                  <span className="jepang-badge-red mb-3 inline-block">QUIZ</span>
                  <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-jepang-red transition-colors line-clamp-2">{quiz.title}</h3>
                  {quiz.description && <p className="text-sm text-jepang-muted line-clamp-2 mb-3">{quiz.description}</p>}
                  <div className="pt-3 border-t border-jepang-border flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                    <span className="text-jepang-muted">{quiz.questionCount || 0} Q</span>
                    <span className="flex items-center gap-1 text-jepang-red font-bold"><Award size={12} strokeWidth={1.5} /> +{quiz.pointsReward || 10} PTS</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24" data-testid="no-quizzes">
            <Zap size={48} strokeWidth={1.5} className="mx-auto mb-4 text-jepang-muted" />
            <p className="font-heading font-bold text-2xl mb-2">No quizzes available</p>
            <p className="text-jepang-muted">Check back soon for new quizzes!</p>
          </div>
        )}
      </div>
    </div>
  );
}
