import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Search, Users, Shield, User } from 'lucide-react';

const STATUS_COLORS = {
  active: 'bg-green-600 text-white',
  inactive: 'bg-zinc-400 text-white',
  banned: 'bg-jepang-red text-white',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data || []);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      toast.success('Role updated');
      loadUsers();
    } catch (e) {
      toast.error('Failed to update role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    try {
      await api.put(`/admin/users/${userId}`, { status: newStatus });
      toast.success('Status updated');
      loadUsers();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="bg-white min-h-screen" data-testid="admin-users-page">
      <section className="border-b-2 border-jepang-black bg-jepang-off-white">
        <div className="px-4 md:px-8 lg:px-12 py-8">
          <Link to="/admin" className="inline-flex items-center gap-2 small-caps text-jepang-muted hover:text-jepang-red mb-4" data-testid="back-to-admin">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <p className="small-caps text-jepang-red mb-2">USER MANAGEMENT</p>
          <h1 className="font-heading font-black text-4xl tracking-tighter flex items-center gap-3">
            <Users size={36} strokeWidth={1.5} /> All Users
          </h1>
          <p className="text-jepang-muted font-mono uppercase tracking-wider text-sm mt-2">{users.length} USERS</p>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-12 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name, username, email..."
              className="jepang-input flex-1"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              data-testid="user-search-input"
            />
            <button type="submit" className="jepang-btn-black" data-testid="user-search-submit">
              <Search size={16} strokeWidth={1.5} />
            </button>
          </form>
          <div className="flex gap-2">
            <button onClick={() => setRoleFilter('')} className={`text-xs uppercase tracking-wider font-bold px-3 py-2 border ${!roleFilter ? 'bg-jepang-black text-white border-jepang-black' : 'border-jepang-border hover:border-jepang-black'}`} data-testid="role-filter-all">All</button>
            <button onClick={() => setRoleFilter('admin')} className={`text-xs uppercase tracking-wider font-bold px-3 py-2 border ${roleFilter === 'admin' ? 'bg-jepang-red text-white border-jepang-red' : 'border-jepang-border hover:border-jepang-black'}`} data-testid="role-filter-admin">Admin</button>
            <button onClick={() => setRoleFilter('user')} className={`text-xs uppercase tracking-wider font-bold px-3 py-2 border ${roleFilter === 'user' ? 'bg-jepang-black text-white border-jepang-black' : 'border-jepang-border hover:border-jepang-black'}`} data-testid="role-filter-user">User</button>
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
                  <tr><td colSpan="7" className="text-center text-jepang-muted py-12">No users found</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-jepang-border last:border-b-0 hover:bg-jepang-off-white" data-testid={`user-row-${user.id}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-jepang-black text-white flex items-center justify-center font-bold text-xs">
                            {user.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-jepang-muted font-mono">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-jepang-muted text-xs">{user.email}</td>
                      <td className="p-3 font-mono font-bold text-jepang-red">{user.total_points || 0}</td>
                      <td className="p-3 font-mono">{user.article_count || 0}</td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 ${user.role === 'admin' ? 'bg-jepang-red text-white' : 'bg-zinc-200 text-jepang-black'}`}>
                          {user.role === 'admin' ? <span className="inline-flex items-center gap-1"><Shield size={10} /> Admin</span> : <span className="inline-flex items-center gap-1"><User size={10} /> User</span>}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 ${STATUS_COLORS[user.status] || STATUS_COLORS.active}`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          <Link to={`/admin/users/${user.id}`} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 border border-jepang-border hover:border-jepang-black" data-testid={`view-user-${user.id}`}>View</Link>
                          {user.role === 'user' ? (
                            <button onClick={() => handleRoleChange(user.id, 'admin')} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 border border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white" data-testid={`promote-${user.id}`}>Promote</button>
                          ) : (
                            <button onClick={() => handleRoleChange(user.id, 'user')} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 border border-jepang-border hover:border-jepang-black" data-testid={`demote-${user.id}`}>Demote</button>
                          )}
                          {user.status !== 'banned' ? (
                            <button onClick={() => handleStatusChange(user.id, 'banned')} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 border border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white" data-testid={`ban-${user.id}`}>Ban</button>
                          ) : (
                            <button onClick={() => handleStatusChange(user.id, 'active')} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white" data-testid={`unban-${user.id}`}>Unban</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
