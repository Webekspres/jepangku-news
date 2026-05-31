'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quizzes?status=ACTIVE').then((r) => r.json()).then((d) => {
      setQuizzes(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-white min-h-screen" data-testid="quiz-list-page">
      <section className="border-b-2 border-[#0A0A0A] bg-[#0A0A0A] text-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D90429] mb-2">クイズ / QUIZ</p>
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-3">Test Your Knowledge</h1>
          <p className="text-zinc-300 max-w-2xl">Ikuti quiz tentang anime, manga, budaya Jepang, dan dapatkan poin!</p>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-12">
        {loading ? (
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#52525B] py-12">Loading quizzes...</p>
        ) : quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz: any) => (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.slug}`}
                className="group block bg-white border border-[#E4E4E7] hover:border-[#0A0A0A] transition-all"
                data-testid={`quiz-card-${quiz.slug}`}
              >
                {quiz.thumbnailUrl ? (
                  <div className="aspect-video overflow-hidden bg-[#F4F4F5]">
                    <img
                      src={quiz.thumbnailUrl}
                      alt={quiz.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-[#0A0A0A] flex items-center justify-center">
                    <Zap size={48} strokeWidth={1.5} className="text-[#D90429]" />
                  </div>
                )}
                <div className="p-5">
                  <Badge variant="red" className="mb-3 inline-block">QUIZ</Badge>
                  <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-[#D90429] transition-colors line-clamp-2">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-sm text-[#52525B] line-clamp-2 mb-3">{quiz.description}</p>
                  )}
                  <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                    <span className="text-[#52525B]">{quiz.questionCount || 0} Q</span>
                    <span className="flex items-center gap-1 text-[#D90429] font-bold">
                      <Award size={12} strokeWidth={1.5} /> +{quiz.pointsReward || 10} PTS
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24" data-testid="no-quizzes">
            <Zap size={48} strokeWidth={1.5} className="mx-auto mb-4 text-[#52525B]" />
            <p className="font-heading font-bold text-2xl mb-2">No quizzes available</p>
            <p className="text-[#52525B]">Check back soon for new quizzes!</p>
          </div>
        )}
      </div>
    </div>
  );
}
