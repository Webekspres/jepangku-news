'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function AdminCreateQuiz() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', thumbnail_url: '', status: 'ACTIVE' });
  const [questions, setQuestions] = useState([{ question_text: '', options: [{ option_text: '', is_correct: true }, { option_text: '', is_correct: false }] }]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => setQuestions([...questions, { question_text: '', options: [{ option_text: '', is_correct: true }, { option_text: '', is_correct: false }] }]);
  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, val: string) => { const q = [...questions]; q[idx].question_text = val; setQuestions(q); };
  const addOption = (qIdx: number) => { const q = [...questions]; q[qIdx].options.push({ option_text: '', is_correct: false }); setQuestions(q); };
  const removeOption = (qIdx: number, oIdx: number) => { const q = [...questions]; q[qIdx].options = q[qIdx].options.filter((_, i) => i !== oIdx); setQuestions(q); };
  const updateOption = (qIdx: number, oIdx: number, field: string, val: any) => {
    const q = [...questions];
    if (field === 'is_correct') { q[qIdx].options.forEach((o, i) => { o.is_correct = i === oIdx; }); }
    else { (q[qIdx].options[oIdx] as any)[field] = val; }
    setQuestions(q);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (questions.some((q) => !q.question_text.trim() || q.options.some((o) => !o.option_text.trim()))) { toast.error('All questions and options must be filled'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, questions }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success('Quiz created successfully');
      router.push('/admin');
    } catch (e: any) { toast.error(e.message || 'Failed to create quiz'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-create-quiz-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link href="/admin" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-4"><ArrowLeft size={14} /> Back to Dashboard</Link>
          <h1 className="font-heading font-black text-4xl tracking-tighter">Create Quiz</h1>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8 space-y-6">
        <div><label className="small-caps mb-2 block">Quiz Title *</label><input type="text" className="jepang-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="quiz-title-input" /></div>
        <div><label className="small-caps mb-2 block">Description</label><textarea className="jepang-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="quiz-description-input" /></div>
        <div><label className="small-caps mb-2 block">Thumbnail URL</label><input type="text" className="jepang-input" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} data-testid="quiz-thumbnail-input" /></div>
        <div>
          <label className="small-caps mb-2 block">Status</label>
          <select className="jepang-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} data-testid="quiz-status-select">
            <option value="ACTIVE">Active</option><option value="DRAFT">Draft</option><option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="pt-6 border-t border-jepang-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="small-caps">QUESTIONS</h3>
            <button onClick={addQuestion} className="jepang-btn-outline text-xs px-3 py-1 inline-flex items-center gap-2" data-testid="add-question-btn"><Plus size={14} /> Add Question</button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-jepang-off-white border border-jepang-border p-4 mb-3" data-testid={`question-form-${qIdx}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="small-caps text-jepang-red">QUESTION {qIdx + 1}</p>
                {questions.length > 1 && <button onClick={() => removeQuestion(qIdx)} className="text-jepang-red hover:opacity-80" data-testid={`remove-question-${qIdx}`}><Trash2 size={14} /></button>}
              </div>
              <input type="text" className="jepang-input mb-3" placeholder="Question text..." value={q.question_text} onChange={(e) => updateQuestion(qIdx, e.target.value)} data-testid={`question-text-${qIdx}`} />
              <div className="space-y-2">
                {q.options.map((o, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input type="radio" name={`correct-${qIdx}`} checked={o.is_correct} onChange={() => updateOption(qIdx, oIdx, 'is_correct', true)} className="w-4 h-4" data-testid={`correct-${qIdx}-${oIdx}`} />
                    <input type="text" className="jepang-input flex-1" placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} value={o.option_text} onChange={(e) => updateOption(qIdx, oIdx, 'option_text', e.target.value)} data-testid={`option-text-${qIdx}-${oIdx}`} />
                    {q.options.length > 2 && <button onClick={() => removeOption(qIdx, oIdx)} className="text-jepang-red" data-testid={`remove-option-${qIdx}-${oIdx}`}><Trash2 size={14} /></button>}
                  </div>
                ))}
                <button onClick={() => addOption(qIdx)} className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline" data-testid={`add-option-${qIdx}`}>+ Add Option</button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-jepang-border">
          <button onClick={handleSubmit} disabled={loading} className="jepang-btn-primary disabled:opacity-50" data-testid="create-quiz-submit">
            {loading ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
