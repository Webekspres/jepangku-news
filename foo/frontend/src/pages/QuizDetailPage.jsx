import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Award, CheckCircle, XCircle } from 'lucide-react';

export default function QuizDetailPage() {
  const { slug } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [slug]);

  const loadQuiz = async () => {
    try {
      const { data } = await api.get(`/quizzes/${slug}`);
      setQuiz(data);
    } catch (e) {
      console.error(e);
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to submit quiz');
      navigate('/login');
      return;
    }
    
    if (Object.keys(answers).length !== quiz.questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      const answerList = Object.entries(answers).map(([question_id, selected_option_id]) => ({
        question_id,
        selected_option_id,
      }));

      const { data } = await api.post(`/quizzes/${quiz.id}/attempt`, { answers: answerList });
      setResult(data);
      toast.success(`+${data.points_awarded} points earned!`);
      refreshUser();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><p className="small-caps text-jepang-muted">Loading quiz...</p></div>;
  }

  if (!quiz) return null;

  // Show result screen
  if (result) {
    return (
      <div className="bg-jepang-off-white min-h-screen py-12" data-testid="quiz-result">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white border border-jepang-black p-8 hard-shadow">
            <div className="text-center mb-6">
              <Award size={64} strokeWidth={1.5} className="mx-auto text-jepang-red mb-3" />
              <p className="small-caps text-jepang-red mb-2">QUIZ COMPLETED</p>
              <h2 className="font-heading font-black text-4xl tracking-tighter">{quiz.title}</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 my-8">
              <div className="text-center p-4 border border-jepang-border">
                <p className="font-mono font-black text-4xl text-jepang-black">{result.correct_answers}</p>
                <p className="text-[10px] uppercase tracking-wider text-jepang-muted mt-1">Correct</p>
              </div>
              <div className="text-center p-4 border border-jepang-border">
                <p className="font-mono font-black text-4xl text-jepang-muted">{result.total_questions}</p>
                <p className="text-[10px] uppercase tracking-wider text-jepang-muted mt-1">Total</p>
              </div>
              <div className="text-center p-4 border border-jepang-red bg-jepang-red text-white">
                <p className="font-mono font-black text-4xl">+{result.points_awarded}</p>
                <p className="text-[10px] uppercase tracking-wider mt-1">Points</p>
              </div>
            </div>

            <div className="text-center">
              <p className="font-mono text-2xl mb-6">Score: <span className="font-black">{Math.round(result.score)}%</span></p>
              <div className="flex gap-3 justify-center">
                <Link to="/quizzes" className="jepang-btn-outline" data-testid="back-to-quizzes">More Quizzes</Link>
                <Link to="/leaderboard" className="jepang-btn-primary" data-testid="view-leaderboard">View Leaderboard</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen" data-testid="quiz-detail-page">
      <div className="px-4 md:px-8 lg:px-12 py-12">
        <div className="max-w-3xl mx-auto">
          <Link to="/quizzes" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-6" data-testid="back-to-quizzes-link">
            <ArrowLeft size={14} /> Back to Quizzes
          </Link>

          <div className="mb-8">
            <span className="jepang-badge-red mb-3 inline-block">QUIZ</span>
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter mb-3 mt-2">{quiz.title}</h1>
            {quiz.description && <p className="text-jepang-muted text-lg">{quiz.description}</p>}
            <div className="flex items-center gap-4 mt-4 text-xs font-mono uppercase tracking-wider text-jepang-muted">
              <span>{quiz.questions?.length || 0} QUESTIONS</span>
              <span className="text-jepang-red font-bold">+{quiz.points_reward} BASE PTS</span>
              <span className="text-jepang-red font-bold">+{quiz.correct_answer_points} PER CORRECT</span>
            </div>
          </div>

          {!user && (
            <div className="bg-jepang-black text-white p-4 mb-8" data-testid="quiz-login-prompt">
              <p className="text-sm">⚠️ <Link to="/login" className="text-jepang-red font-bold underline">Login</Link> to save your results and earn points!</p>
            </div>
          )}

          <div className="space-y-6">
            {quiz.questions?.map((question, qIdx) => (
              <div key={question.id} className="bg-white border border-jepang-black p-6" data-testid={`question-${qIdx}`}>
                <p className="small-caps text-jepang-red mb-2">QUESTION {qIdx + 1}</p>
                <h3 className="font-heading font-bold text-xl mb-4">{question.question_text}</h3>
                <div className="space-y-2">
                  {question.options?.map((option, oIdx) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(question.id, option.id)}
                      className={`w-full text-left p-4 border transition-colors ${answers[question.id] === option.id ? 'border-jepang-red bg-jepang-red text-white' : 'border-jepang-border hover:border-jepang-black'}`}
                      data-testid={`question-${qIdx}-option-${oIdx}`}
                    >
                      <span className="font-mono font-bold mr-3">{String.fromCharCode(65 + oIdx)}.</span>
                      {option.option_text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sticky bottom-0 bg-white border-t-2 border-jepang-black p-4 -mx-4 md:mx-0">
            <div className="flex items-center justify-between">
              <p className="small-caps text-jepang-muted">
                {Object.keys(answers).length} / {quiz.questions?.length || 0} ANSWERED
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting || !user}
                className="jepang-btn-primary disabled:opacity-50"
                data-testid="submit-quiz-btn"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
