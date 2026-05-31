'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Check, X } from 'lucide-react';

export default function AdminReviewArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => { loadArticles(); }, []);

  const loadArticles = async () => {
    const data = await fetch('/api/admin/articles/pending').then((r) => r.json());
    setArticles(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleApprove = async (articleId: string) => {
    try {
      await fetch(`/api/admin/articles/${articleId}/approve`, { method: 'POST' });
      toast.success('Article approved & published');
      setSelected(null);
      loadArticles();
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (articleId: string) => {
    if (!rejectNote.trim()) { toast.error('Please provide a rejection note'); return; }
    try {
      await fetch(`/api/admin/articles/${articleId}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: rejectNote }) });
      toast.success('Article rejected');
      setSelected(null);
      setRejectNote('');
      loadArticles();
    } catch { toast.error('Failed to reject'); }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-review-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <Link href="/admin" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-4" data-testid="back-to-admin"><ArrowLeft size={14} /> Back to Dashboard</Link>
          <p className="small-caps text-jepang-red mb-2">REVIEW QUEUE</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">Pending Articles</h1>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8">
        {loading ? (
          <p className="text-center small-caps text-jepang-muted py-12">Loading...</p>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="small-caps mb-3">QUEUE ({articles.length})</h3>
              {articles.map((article: any) => (
                <button key={article.id} onClick={() => setSelected(article)} className={`w-full text-left p-4 border transition-colors ${selected?.id === article.id ? 'border-jepang-red bg-jepang-off-white' : 'border-jepang-border hover:border-jepang-black'}`} data-testid={`queue-article-${article.id}`}>
                  <p className="font-semibold text-sm line-clamp-2">{article.title}</p>
                  <p className="text-xs text-jepang-muted font-mono uppercase tracking-wider mt-1">BY {article.author?.name}</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selected ? (
                <div className="bg-white border border-jepang-black p-6" data-testid="review-detail">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="jepang-badge-red">PENDING</span>
                    {selected.author && <span className="text-xs text-jepang-muted font-mono uppercase tracking-wider">BY {selected.author.name} (@{selected.author.username})</span>}
                  </div>
                  <h2 className="font-heading font-black text-3xl tracking-tighter mb-3">{selected.title}</h2>
                  {selected.excerpt && <p className="text-jepang-muted mb-4 italic">{selected.excerpt}</p>}
                  {selected.coverImageUrl && <img src={selected.coverImageUrl} alt={selected.title} className="w-full max-h-96 object-cover mb-4 border border-jepang-border" />}
                  <div className="article-content text-sm max-h-96 overflow-y-auto p-4 bg-jepang-off-white border border-jepang-border mb-6" dangerouslySetInnerHTML={{ __html: selected.content }} />

                  <div className="flex flex-col gap-3">
                    <button onClick={() => handleApprove(selected.id)} className="bg-green-600 text-white px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-green-700 inline-flex items-center justify-center gap-2" data-testid="approve-btn">
                      <Check size={16} strokeWidth={2} /> Approve & Publish
                    </button>
                    <div>
                      <label className="small-caps mb-2 block">Rejection Note (required)</label>
                      <textarea className="jepang-input mb-2" rows={3} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Explain why this article is rejected..." data-testid="reject-note-input" />
                      <button onClick={() => handleReject(selected.id)} className="bg-jepang-red text-white px-6 py-3 font-bold uppercase tracking-wider text-sm hover:opacity-90 w-full inline-flex items-center justify-center gap-2" data-testid="reject-btn">
                        <X size={16} strokeWidth={2} /> Reject Article
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-jepang-off-white border border-jepang-border p-12 text-center">
                  <p className="text-jepang-muted">Select an article to review</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-24" data-testid="no-pending">
            <p className="font-heading font-bold text-2xl mb-2">No pending articles</p>
            <p className="text-jepang-muted">All caught up! Check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
