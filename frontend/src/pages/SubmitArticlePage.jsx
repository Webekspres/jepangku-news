import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Save, Send, Upload, Bold, Italic, Heading, List as ListIcon } from 'lucide-react';

export default function SubmitArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    category_id: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    loadCategories();
    if (isEdit) loadArticle();
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadArticle = async () => {
    try {
      const { data } = await api.get('/articles/my/list');
      const article = data.find((a) => a.id === id || a._id === id);
      if (article) {
        setForm({
          title: article.title || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          cover_image_url: article.cover_image_url || '',
          category_id: article.category_id?.toString() || '',
          tags: '',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const fullUrl = `${backendUrl}${data.url}`;
      setForm({ ...form, cover_image_url: fullUrl });
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const insertFormatting = (tag) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.content.substring(start, end);
    let formatted = '';
    
    switch (tag) {
      case 'bold':
        formatted = `<strong>${selected || 'bold text'}</strong>`;
        break;
      case 'italic':
        formatted = `<em>${selected || 'italic text'}</em>`;
        break;
      case 'h2':
        formatted = `<h2>${selected || 'Heading'}</h2>`;
        break;
      case 'h3':
        formatted = `<h3>${selected || 'Subheading'}</h3>`;
        break;
      case 'ul':
        formatted = `<ul><li>${selected || 'List item'}</li></ul>`;
        break;
      case 'p':
        formatted = `<p>${selected || 'Paragraph'}</p>`;
        break;
      default:
        formatted = selected;
    }
    
    const newContent = form.content.substring(0, start) + formatted + form.content.substring(end);
    setForm({ ...form, content: newContent });
  };

  const handleSubmit = async (status) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        cover_image_url: form.cover_image_url || null,
        category_id: form.category_id || null,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status,
      };

      if (isEdit) {
        await api.put(`/articles/${id}`, payload);
        toast.success(status === 'draft' ? 'Draft saved' : 'Article submitted for review');
      } else {
        await api.post('/articles', payload);
        toast.success(status === 'draft' ? 'Draft saved' : 'Article submitted for review');
      }
      navigate('/my-articles');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="submit-article-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-12">
          <p className="small-caps text-jepang-red mb-2">{isEdit ? 'EDIT ARTICLE' : 'NEW ARTICLE'}</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">{isEdit ? 'Edit Your Article' : 'Submit New Article'}</h1>
          <p className="text-jepang-muted mt-2">Bagikan cerita atau berita Jepang. Artikel akan direview admin sebelum tayang.</p>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-12 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="small-caps mb-2 block">Title *</label>
            <input
              type="text"
              className="jepang-input text-xl font-heading font-bold"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Article title..."
              data-testid="article-title-input"
            />
          </div>

          <div>
            <label className="small-caps mb-2 block">Excerpt</label>
            <textarea
              className="jepang-input"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Brief summary..."
              data-testid="article-excerpt-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="small-caps mb-2 block">Category</label>
              <select
                className="jepang-input"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                data-testid="article-category-select"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat._id || cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="small-caps mb-2 block">Tags (comma separated)</label>
              <input
                type="text"
                className="jepang-input"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="anime, manga, tokyo"
                data-testid="article-tags-input"
              />
            </div>
          </div>

          <div>
            <label className="small-caps mb-2 block">Cover Image</label>
            <div className="flex gap-3 items-start">
              <input
                type="text"
                className="jepang-input flex-1"
                value={form.cover_image_url}
                onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                placeholder="Image URL or upload..."
                data-testid="article-cover-input"
              />
              <label className="jepang-btn-outline cursor-pointer inline-flex items-center gap-2">
                <Upload size={14} strokeWidth={1.5} />
                {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} data-testid="article-cover-upload" />
              </label>
            </div>
            {form.cover_image_url && (
              <img src={form.cover_image_url} alt="Preview" className="mt-3 max-h-48 object-cover border border-jepang-border" />
            )}
          </div>

          <div>
            <label className="small-caps mb-2 block">Content *</label>
            <div className="border border-jepang-border bg-jepang-off-white p-2 flex flex-wrap gap-1 mb-0">
              <button type="button" onClick={() => insertFormatting('h2')} className="px-3 py-1 hover:bg-white border border-transparent hover:border-jepang-border text-sm font-bold" data-testid="format-h2" title="Heading 2">H2</button>
              <button type="button" onClick={() => insertFormatting('h3')} className="px-3 py-1 hover:bg-white border border-transparent hover:border-jepang-border text-sm font-bold" data-testid="format-h3" title="Heading 3">H3</button>
              <button type="button" onClick={() => insertFormatting('bold')} className="px-3 py-1 hover:bg-white border border-transparent hover:border-jepang-border" data-testid="format-bold" title="Bold"><Bold size={14} strokeWidth={2} /></button>
              <button type="button" onClick={() => insertFormatting('italic')} className="px-3 py-1 hover:bg-white border border-transparent hover:border-jepang-border" data-testid="format-italic" title="Italic"><Italic size={14} strokeWidth={2} /></button>
              <button type="button" onClick={() => insertFormatting('p')} className="px-3 py-1 hover:bg-white border border-transparent hover:border-jepang-border text-sm font-bold" data-testid="format-p" title="Paragraph">P</button>
              <button type="button" onClick={() => insertFormatting('ul')} className="px-3 py-1 hover:bg-white border border-transparent hover:border-jepang-border" data-testid="format-list" title="List"><ListIcon size={14} strokeWidth={2} /></button>
            </div>
            <textarea
              ref={contentRef}
              className="jepang-input font-mono text-sm border-t-0"
              rows={16}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="<p>Write your article using HTML tags...</p>"
              data-testid="article-content-input"
            />
            <p className="text-xs text-jepang-muted font-mono mt-2">Use HTML tags: &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;&lt;li&gt;</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-jepang-border">
            <button onClick={() => handleSubmit('draft')} disabled={loading} className="jepang-btn-outline inline-flex items-center gap-2 disabled:opacity-50" data-testid="save-draft-btn">
              <Save size={14} strokeWidth={1.5} /> Save as Draft
            </button>
            <button onClick={() => handleSubmit('pending_review')} disabled={loading} className="jepang-btn-primary inline-flex items-center gap-2 disabled:opacity-50" data-testid="submit-review-btn">
              <Send size={14} strokeWidth={1.5} /> Submit for Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
