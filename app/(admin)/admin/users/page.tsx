'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Search, Users, Shield, User } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-600 text-white',
  inactive: 'bg-zinc-400 text-white',
  banned: 'bg-jepang-red text-white',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => { loadUsers(); }, [search, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    const data = await fetch(`/api/admin/users?${params}`).then((r) => r.json());
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) });
      toast.success('Role updated');
      loadUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (!confirm(`Change status to ${newStatus}?`)) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      toast.success('Status updated');
      loadUsers();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-users-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <Link href="/admin" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-4" data-testid="back-to-admin"><ArrowLeft size={14} /> Back to Dashboard</Link>
          <p className="small-caps text-jepang-red mb-2">USER MANAGEMENT</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter flex items-center gap-3"><Users size={36} strokeWidth={1.5} /> All Users</h1>
          <p className="text-jepang-muted font-mono uppercase tracking-wider text-sm mt-2">{users.length} USERS</p>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8">
        <div className="mb-6 space-y-3">
          <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }} className="flex gap-2">
            <input type="text" placeholder="Search by name, username, email..." className="jepang-input flex-1" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} data-testid="user-search-input" />
            <button type="submit" className="jepang-btn-black px-4 py-3" data-testid="user-search-submit"><Search size={16} strokeWidth={1.5} /></button>
          </form>
          <div className="flex gap-2">
            {[{ v: '', l: 'All', t: 'role-filter-all' }, { v: 'ADMIN', l: 'Admin', t: 'role-filter-admin' }, { v: 'USER', l: 'User', t: 'role-filter-user' }].map((r) => (
              <button key={r.v} onClick={() => setRoleFilter(r.v)} className={`text-xs uppercase tracking-wider font-bold px-3 py-2 border ${roleFilter === r.v ? 'bg-jepang-black text-white border-jepang-black' : 'border-jepang-border hover:border-jepang-black'}`} data-testid={r.t}>{r.l}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center small-caps text-jepang-muted py-12">Loading...</p>
        ) : (
          <div className="bg-white border border-jepang-black overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-jepang-off-white border-b border-jepang-border">
                <tr>
                  <th className="text-left p-3 small-caps">USER</th>
                  <th className="text-left p-3 small-caps">EMAIL</th>
                  <th className="text-left p-3 small-caps">POINTS</th>
                  <th className="text-left p-3 small-caps">ARTICLES</th>
                  <th className="text-left p-3 small-caps">ROLE</th>
                  <th className="text-left p-3 small-caps">STATUS</th>
                  <th className="text-left p-3 small-caps">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-jepang-muted py-12">No users found</td></tr>
                ) : users.map((user: any) => (
                  <tr key={user.id} className="border-b border-jepang-border last:border-b-0 hover:bg-jepang-off-white" data-testid={`user-row-${user.id}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-jepang-black text-white flex items-center justify-center font-bold text-xs">{user.name?.charAt(0).toUpperCase() || '?'}</div>
                        <div><p className="font-semibold">{user.name}</p><p className="text-xs text-jepang-muted font-mono">@{user.username}</p></div>
                      </div>
                    </td>
                    <td className="p-3 text-jepang-muted text-xs">{user.email}</td>
                    <td className="p-3 font-mono font-bold text-jepang-red">{user.totalPoints || 0}</td>
                    <td className="p-3 font-mono">{user.articleCount || 0}</td>
                    <td className="p-3">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 ${user.role === 'ADMIN' ? 'bg-jepang-red text-white' : 'bg-zinc-200 text-jepang-black'}`}>
                        {user.role === 'ADMIN' ? <span className="inline-flex items-center gap-1"><Shield size={10} /> Admin</span> : <span className="inline-flex items-center gap-1"><User size={10} /> User</span>}
                      </span>
                    </td>
                    <td className="p-3"><span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 ${STATUS_COLORS[user.status] || STATUS_COLORS.active}`}>{user.status || 'active'}</span></td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        <Link href={`/admin/users/${user.id}`} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 border border-jepang-border hover:border-jepang-black" data-testid={`view-user-${user.id}`}>View</Link>
                        {user.role === 'USER' ? (
                          <button onClick={() => handleRoleChange(user.id, 'ADMIN')} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 border border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white" data-testid={`promote-${user.id}`}>Promote</button>
                        ) : (
                          <button onClick={() => handleRoleChange(user.id, 'USER')} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 border border-jepang-border hover:border-jepang-black" data-testid={`demote-${user.id}`}>Demote</button>
                        )}
                        {user.status !== 'banned' ? (
                          <button onClick={() => handleStatusChange(user.id, 'banned')} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 border border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white" data-testid={`ban-${user.id}`}>Ban</button>
                        ) : (
                          <button onClick={() => handleStatusChange(user.id, 'active')} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white" data-testid={`unban-${user.id}`}>Unban</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
