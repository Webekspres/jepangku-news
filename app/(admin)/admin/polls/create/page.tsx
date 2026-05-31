'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function AdminCreatePoll() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', poll_type: 'POLLING', thumbnail_url: '', status: 'ACTIVE' });
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (options.some((o) => !o.trim())) { toast.error('All options must be filled'); return; }
    if (options.length < 2) { toast.error('At least 2 options required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/polls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, options }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success('Poll created successfully');
      router.push('/admin');
    } catch (e: any) { toast.error(e.message || 'Failed to create poll'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-create-poll-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <Link href="/admin" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-4"><ArrowLeft size={14} /> Back to Dashboard</Link>
          <h1 className="font-heading font-black text-4xl tracking-tighter">Create Poll / Voting</h1>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8 max-w-3xl mx-auto space-y-6">
        <div>
          <label className="small-caps mb-2 block">Type</label>
          <div className="flex gap-2">
            <button onClick={() => setForm({ ...form, poll_type: 'POLLING' })} className={`text-xs uppercase tracking-wider font-bold px-4 py-2 border ${form.poll_type === 'POLLING' ? 'bg-jepang-black text-white border-jepang-black' : 'border-jepang-border'}`} data-testid="type-polling">Polling</button>
            <button onClick={() => setForm({ ...form, poll_type: 'VOTING' })} className={`text-xs uppercase tracking-wider font-bold px-4 py-2 border ${form.poll_type === 'VOTING' ? 'bg-jepang-red text-white border-jepang-red' : 'border-jepang-border'}`} data-testid="type-voting">Voting</button>
          </div>
        </div>
        <div><label className="small-caps mb-2 block">Title / Question *</label><input type="text" className="jepang-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="poll-title-input" /></div>
        <div><label className="small-caps mb-2 block">Description</label><textarea className="jepang-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="poll-description-input" /></div>
        <div>
          <label className="small-caps mb-2 block">Status</label>
          <select className="jepang-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} data-testid="poll-status-select">
            <option value="ACTIVE">Active</option><option value="DRAFT">Draft</option><option value="CLOSED">Closed</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="small-caps">Options</label>
            <button onClick={() => setOptions([...options, ''])} className="text-xs uppercase tracking-wider font-bold text-jepang-red hover:underline inline-flex items-center gap-1" data-testid="add-option-btn"><Plus size={12} /> Add Option</button>
          </div>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="font-mono font-bold text-jepang-muted self-center w-8">{String.fromCharCode(65 + idx)}.</span>
                <input type="text" className="jepang-input flex-1" placeholder={`Option ${String.fromCharCode(65 + idx)}`} value={opt} onChange={(e) => { const o = [...options]; o[idx] = e.target.value; setOptions(o); }} data-testid={`option-input-${idx}`} />
                {options.length > 2 && <button onClick={() => setOptions(options.filter((_, i) => i !== idx))} className="p-2 text-jepang-red hover:bg-jepang-off-white" data-testid={`remove-option-${idx}`}><Trash2 size={14} /></button>}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-jepang-border">
          <button onClick={handleSubmit} disabled={loading} className="jepang-btn-primary disabled:opacity-50" data-testid="create-poll-submit">
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </div>
    </div>
  );
}
