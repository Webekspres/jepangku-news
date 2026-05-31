'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Send, Upload, Bold, Italic, List as ListIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>()!;
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [article, setArticle] = useState<any>(null);
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', coverImageUrl: '', categoryId: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(Array.isArray(d) ? d : []));
    fetch('/api/articles/my').then((r) => r.json()).then((articles: any[]) => {
      const found = Array.isArray(articles) ? articles.find((a) => a.id === id) : null;
      if (found) {
        setArticle(found);
        setForm({
          title: found.title || '',
          excerpt: found.excerpt || '',
          content: found.content || '',
          coverImageUrl: found.coverImageUrl || '',
          categoryId: found.categoryId || '',
          tags: '',
        });
      } else {
        router.push('/my-articles');
      }
      setFetching(false);
    });
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const data = await fetch('/api/upload', { method: 'POST', body: fd }).then((r) => {
        if (!r.ok) throw new Error('Upload failed');
        return r.json();
      });
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
    const map: Record<string, string> = {
      bold: `<strong>${sel || 'bold text'}</strong>`,
      italic: `<em>${sel || 'italic text'}</em>`,
      h2: `<h2>${sel || 'Heading'}</h2>`,
      h3: `<h3>${sel || 'Subheading'}</h3>`,
      ul: `<ul><li>${sel || 'List item'}</li></ul>`,
      p: `<p>${sel || 'Paragraph'}</p>`,
    };
    const newContent = form.content.substring(0, start) + (map[tag] || sel) + form.content.substring(end);
    setForm((f) => ({ ...f, content: newContent }));
  };

  const handleSubmit = async (status: string) => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content are required'); return; }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        coverImageUrl: form.coverImageUrl || null,
        categoryId: form.categoryId || null,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status,
      };
      const res = await fetch(`/api/articles/${article.slug}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success(status === 'DRAFT' ? 'Draft saved' : 'Article submitted for review');
      router.push('/my-articles');
    } catch (e: any) { toast.error(e.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52525B]">Loading...</p>
    </div>
  );

  return (
    <div className="bg-white min-h-screen" data-testid="edit-article-page">
      <section className="border-b-2 border-[#0A0A0A] bg-[#F4F4F5]">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D90429] mb-2">EDIT ARTICLE</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">Edit Your Article</h1>
          <p className="text-[#52525B] mt-2">Artikel akan direview ulang setelah disubmit.</p>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              className="text-xl font-heading font-bold"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Article title..."
              data-testid="article-title-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Brief summary..."
              data-testid="article-excerpt-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger data-testid="article-category-select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="anime, manga, tokyo"
                data-testid="article-tags-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="flex gap-3 items-start">
              <Input
                type="text"
                className="flex-1"
                value={form.coverImageUrl}
                onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                placeholder="Image URL or upload..."
                data-testid="article-cover-input"
              />
              <Button variant="outline" asChild className="cursor-pointer">
                <label>
                  <Upload size={14} strokeWidth={1.5} /> {uploading ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                    data-testid="article-cover-upload"
                  />
                </label>
              </Button>
            </div>
            {form.coverImageUrl && (
              <img src={form.coverImageUrl} alt="Preview" className="mt-3 max-h-48 object-cover border border-[#E4E4E7]" />
            )}
          </div>

          <div className="space-y-2">
            <Label>Content *</Label>
            <div className="border border-[#E4E4E7] bg-[#F4F4F5] p-2 flex flex-wrap gap-1">
              {[
                ['h2', 'H2'], ['h3', 'H3'],
                ['bold', <Bold key="b" size={14} strokeWidth={2} />],
                ['italic', <Italic key="i" size={14} strokeWidth={2} />],
                ['p', 'P'],
                ['ul', <ListIcon key="l" size={14} strokeWidth={2} />],
              ].map(([tag, label]) => (
                <button
                  key={String(tag)}
                  type="button"
                  onClick={() => insertFormatting(String(tag))}
                  className="px-3 py-1 hover:bg-white border border-transparent hover:border-[#E4E4E7] text-sm font-bold"
                  data-testid={`format-${tag}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Textarea
              ref={contentRef}
              className="font-mono text-sm border-t-0"
              rows={16}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="<p>Write your article...</p>"
              data-testid="article-content-input"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-[#E4E4E7]">
            <Button
              variant="outline"
              onClick={() => handleSubmit('DRAFT')}
              disabled={loading}
              data-testid="save-draft-btn"
            >
              <Save size={14} strokeWidth={1.5} /> Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit('PENDING_REVIEW')}
              disabled={loading}
              data-testid="submit-review-btn"
            >
              <Send size={14} strokeWidth={1.5} /> Submit for Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
