'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Send, Upload, Bold, Italic, List as ListIcon } from 'lucide-react';

export default function SubmitArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', coverImageUrl: '', categoryId: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(Array.isArray(d) ? d : [])); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const data = await fetch('/api/upload', { method: 'POST', body: fd }).then((r) => { if (!r.ok) throw new Error('Upload failed'); return r.json(); });
      setForm((f) => ({ ...f, coverImageUrl: data.url }));
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const insertFormatting = (tag: string) => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const sel = form.content.substring(start, end);
    const map: Record<string, string> = { bold: `<strong>${sel || 'bold text'}</strong>`, italic: `<em>${sel || 'italic text'}</em>`, h2: `<h2>${sel || 'Heading'}</h2>`, h3: `<h3>${sel || 'Subheading'}</h3>`, ul: `<ul><li>${sel || 'List item'}</li></ul>`, p: `<p>${sel || 'Paragraph'}</p>` };
    const newContent = form.content.substring(0, start) + (map[tag] || sel) + form.content.substring(end);
    setForm((f) => ({ ...f, content: newContent }));
  };

  const handleSubmit = async (status: string) => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content are required'); return; }
    setLoading(true);
    try {
      const payload = { title: form.title, excerpt: form.excerpt, content: form.content, coverImageUrl: form.coverImageUrl || null, categoryId: form.categoryId || null, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean), status };
      const res = await fetch('/api/articles/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success(status === 'DRAFT' ? 'Draft saved' : 'Article submitted for review');
      router.push('/my-articles');
    } catch (e: any) { toast.error(e.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="submit-article-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <p className="small-caps text-jepang-red mb-2">NEW ARTICLE</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">Submit New Article</h1>
          <p className="text-jepang-muted mt-2">Bagikan cerita atau berita Jepang. Artikel akan direview admin sebelum tayang.</p>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-12 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="small-caps mb-2 block">Title *</label>
            <input type="text" className="jepang-input text-xl font-heading font-bold" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article title..." data-testid="article-title-input" />
          </div>
          <div>
            <label className="small-caps mb-2 block">Excerpt</label>
            <textarea className="jepang-input" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief summary..." data-testid="article-excerpt-input" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="small-caps mb-2 block">Category</label>
              <select className="jepang-input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} data-testid="article-category-select">
                <option value="">Select category</option>
                {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="small-caps mb-2 block">Tags (comma separated)</label>
              <input type="text" className="jepang-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="anime, manga, tokyo" data-testid="article-tags-input" />
            </div>
          </div>
          <div>
            <label className="small-caps mb-2 block">Cover Image</label>
            <div className="flex gap-3 items-start">
              <input type="text" className="jepang-input flex-1" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="Image URL or upload..." data-testid="article-cover-input" />
              <label className="jepang-btn-outline cursor-pointer inline-flex items-center gap-2">
                <Upload size={14} strokeWidth={1.5} /> {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} data-testid="article-cover-upload" />
              </label>
            </div>
            {form.coverImageUrl && <img src={form.coverImageUrl} alt="Preview" className="mt-3 max-h-48 object-cover border border-jepang-border" />}
          </div>
          <div>
            <label className="small-caps mb-2 block">Content *</label>
            <div className="border border-jepang-border bg-jepang-off-white p-2 flex flex-wrap gap-1">
              {[['h2','H2'],['h3','H3'],['bold',<Bold key="b" size={14} strokeWidth={2} />],['italic',<Italic key="i" size={14} strokeWidth={2} />],['p','P'],['ul',<ListIcon key="l" size={14} strokeWidth={2} />]].map(([tag, label]) => (
                <button key={String(tag)} type="button" onClick={() => insertFormatting(String(tag))} className="px-3 py-1 hover:bg-white border border-transparent hover:border-jepang-border text-sm font-bold" data-testid={`format-${tag}`}>{label}</button>
              ))}
            </div>
            <textarea ref={contentRef} className="jepang-input font-mono text-sm border-t-0" rows={16} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="<p>Write your article using HTML tags...</p>" data-testid="article-content-input" />
            <p className="text-xs text-jepang-muted font-mono mt-2">Use HTML tags: &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;&lt;li&gt;</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-jepang-border">
            <button onClick={() => handleSubmit('DRAFT')} disabled={loading} className="jepang-btn-outline inline-flex items-center gap-2 disabled:opacity-50" data-testid="save-draft-btn"><Save size={14} strokeWidth={1.5} /> Save as Draft</button>
            <button onClick={() => handleSubmit('PENDING_REVIEW')} disabled={loading} className="jepang-btn-primary inline-flex items-center gap-2 disabled:opacity-50" data-testid="submit-review-btn"><Send size={14} strokeWidth={1.5} /> Submit for Review</button>
          </div>
        </div>
      </div>
    </div>
  );
}
