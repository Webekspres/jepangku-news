'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Tag as TagIcon } from 'lucide-react';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadTags(); }, []);

  const loadTags = async () => {
    setLoading(true);
    const data = await fetch('/api/admin/tags').then((r) => r.json());
    setTags(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newTagName.trim() }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success('Tag created');
      setNewTagName('');
      loadTags();
    } catch (e: any) { toast.error(e.message || 'Failed to create tag'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (tagId: string, usage: number) => {
    if (usage > 0) { toast.error(`Cannot delete: tag is used by ${usage} article(s)`); return; }
    if (!confirm('Delete this tag?')) return;
    try {
      await fetch(`/api/admin/tags/${tagId}`, { method: 'DELETE' });
      toast.success('Tag deleted');
      loadTags();
    } catch (e: any) { toast.error(e.message || 'Failed to delete tag'); }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-tags-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <Link href="/admin" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-4"><ArrowLeft size={14} /> Back to Dashboard</Link>
          <p className="small-caps text-jepang-red mb-2">TAG MANAGEMENT</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter flex items-center gap-3"><TagIcon size={36} strokeWidth={1.5} /> Tags</h1>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8 max-w-4xl mx-auto">
        <form onSubmit={handleCreate} className="bg-white border border-jepang-black p-5 mb-6" data-testid="create-tag-form">
          <h2 className="small-caps mb-3">CREATE NEW TAG</h2>
          <div className="flex gap-2">
            <input type="text" placeholder="Tag name (e.g. tokyo, sushi)" className="jepang-input flex-1" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} data-testid="new-tag-input" />
            <button type="submit" disabled={creating} className="jepang-btn-primary inline-flex items-center gap-2 disabled:opacity-50" data-testid="create-tag-btn"><Plus size={14} strokeWidth={1.5} /> Create</button>
          </div>
        </form>

        {loading ? (
          <p className="text-center small-caps text-jepang-muted py-12">Loading...</p>
        ) : tags.length > 0 ? (
          <div className="bg-white border border-jepang-black">
            <div className="p-4 border-b border-jepang-border bg-jepang-off-white"><h2 className="small-caps">{tags.length} TAGS</h2></div>
            <div className="divide-y divide-jepang-border">
              {tags.map((tag: any) => (
                <div key={tag.id} className="p-4 flex items-center justify-between hover:bg-jepang-off-white transition-colors" data-testid={`tag-row-${tag.id}`}>
                  <div className="flex items-center gap-3">
                    <span className="jepang-badge">#{tag.name}</span>
                    <span className="text-xs text-jepang-muted font-mono">/{tag.slug}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-jepang-muted font-mono uppercase tracking-wider">{tag.usageCount || 0} ARTICLES</span>
                    <button onClick={() => handleDelete(tag.id, tag.usageCount || 0)} disabled={tag.usageCount > 0} className="p-2 border border-jepang-border hover:border-jepang-red hover:text-jepang-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors" data-testid={`delete-tag-${tag.id}`} title={tag.usageCount > 0 ? 'Tag in use' : 'Delete tag'}>
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-24" data-testid="no-tags">
            <TagIcon size={48} strokeWidth={1.5} className="mx-auto mb-4 text-jepang-muted" />
            <p className="font-heading font-bold text-2xl mb-2">No tags yet</p>
            <p className="text-jepang-muted">Create your first tag above</p>
          </div>
        )}
      </div>
    </div>
  );
}
