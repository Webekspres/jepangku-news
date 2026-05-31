"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Search, Users, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    const data = await fetch(`/api/admin/users?${params}`).then((r) =>
      r.json(),
    );
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      toast.success("Role updated");
      loadUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (!confirm(`Change status to ${newStatus}?`)) return;
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Status updated");
      loadUsers();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const roleFilters = [
    { v: "", l: "All", t: "role-filter-all" },
    { v: "ADMIN", l: "Admin", t: "role-filter-admin" },
    { v: "USER", l: "User", t: "role-filter-user" },
  ];

  return (
    <div className="bg-white min-h-screen" data-testid="admin-users-page">
      <section className="border-b-2 border-foreground bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-jepang-red mb-4"
            data-testid="back-to-admin"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
            USER MANAGEMENT
          </p>
          <h1 className="font-heading font-black text-4xl tracking-tighter flex items-center gap-3">
            <Users size={36} strokeWidth={1.5} /> All Users
          </h1>
          <p className="text-jepang-muted font-mono uppercase tracking-wider text-sm mt-2">
            {users.length} USERS
          </p>
        </div>
      </section>

      <div className="px-4 mx-auto max-w-7xl py-8">
        <div className="mb-6 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput);
            }}
            className="flex gap-2"
          >
            <Input
              type="text"
              placeholder="Search by name, username, email..."
              className="flex-1"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              data-testid="user-search-input"
            />
            <Button
              type="submit"
              variant="black"
              size="icon"
              data-testid="user-search-submit"
            >
              <Search size={16} strokeWidth={1.5} />
            </Button>
          </form>
          <div className="flex gap-2">
            {roleFilters.map((r) => (
              <Button
                key={r.v}
                size="sm"
                variant={roleFilter === r.v ? "black" : "outline"}
                onClick={() => setRoleFilter(r.v)}
                data-testid={r.t}
              >
                {r.l}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted py-12">
            Loading...
          </p>
        ) : (
          <Card className="border border-foreground overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>USER</TableHead>
                  <TableHead>EMAIL</TableHead>
                  <TableHead>POINTS</TableHead>
                  <TableHead>ARTICLES</TableHead>
                  <TableHead>ROLE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-jepang-muted py-12"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: any) => (
                    <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-foreground text-white flex items-center justify-center font-bold text-xs">
                            {user.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-jepang-muted font-mono">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-jepang-muted text-xs">
                        {user.email}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-jepang-red">
                        {user.totalPoints || 0}
                      </TableCell>
                      <TableCell className="font-mono">
                        {user.articleCount || 0}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "ADMIN" ? "red" : "muted"}
                        >
                          {user.role === "ADMIN" ? (
                            <span className="inline-flex items-center gap-1">
                              <Shield size={10} /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <User size={10} /> User
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active"
                              ? "success"
                              : user.status === "banned"
                                ? "red"
                                : "muted"
                          }
                        >
                          {user.status || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            data-testid={`view-user-${user.id}`}
                          >
                            <Link href={`/admin/users/${user.id}`}>View</Link>
                          </Button>
                          {user.role === "USER" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white"
                              onClick={() => handleRoleChange(user.id, "ADMIN")}
                              data-testid={`promote-${user.id}`}
                            >
                              Promote
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(user.id, "USER")}
                              data-testid={`demote-${user.id}`}
                            >
                              Demote
                            </Button>
                          )}
                          {user.status !== "banned" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white"
                              onClick={() =>
                                handleStatusChange(user.id, "banned")
                              }
                              data-testid={`ban-${user.id}`}
                            >
                              Ban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                              onClick={() =>
                                handleStatusChange(user.id, "active")
                              }
                              data-testid={`unban-${user.id}`}
                            >
                              Unban
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
