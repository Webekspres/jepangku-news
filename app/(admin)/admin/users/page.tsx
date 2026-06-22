"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Users, Shield, User, PenSquare, UserCheck, Ban, UserX, Sparkles } from "lucide-react";
import AdminCard from "@/components/admin/AdminCard";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import AdminStatCards from "@/components/admin/AdminStatCards";
import {
  AdminFilterButtons,
  AdminSearchInput,
  AdminToolbar,
} from "@/components/admin/AdminToolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal, useConfirm } from "@/components/ui/confirm-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SkeletonBox } from "@/components/skeletons/PrimitiveSkeletons";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    banned: number;
    inactive: number;
    draft: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const { confirm, confirmProps } = useConfirm();

  useEffect(() => {
    fetch("/api/admin/users/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

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

  const getRoleLabel = (role: string) => {
    if (role === "ADMIN") return "Admin";
    if (role === "CONTRIBUTOR") return "Kontributor";
    return "Pengguna";
  };

  const getStatusLabel = (status?: string) => {
    if (status === "banned") return "Diblokir";
    if (status === "inactive") return "Tidak Aktif";
    return "Aktif";
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const roleLabel = getRoleLabel(newRole);
    confirm({
      title: `Ubah Role ke ${roleLabel}?`,
      description: `Pengguna ini akan mendapat hak akses sebagai ${roleLabel}.`,
      confirmLabel: "Ya, Ubah",
      variant: "warning",
      onConfirm: async () => {
        await fetch(`/api/admin/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        });
        toast.success("Role berhasil diperbarui");
        loadUsers();
        fetch("/api/admin/users/stats")
          .then((r) => r.json())
          .then(setStats);
      },
    });
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const statusLabel = getStatusLabel(newStatus);
    const isBan = newStatus === "banned";
    confirm({
      title: isBan ? "Blokir Pengguna?" : `Ubah Status ke ${statusLabel}?`,
      description: isBan
        ? "Pengguna tidak akan bisa mengakses platform setelah diblokir."
        : `Status pengguna akan diubah menjadi ${statusLabel}.`,
      confirmLabel: isBan ? "Ya, Blokir" : "Ya, Ubah",
      variant: isBan ? "danger" : "warning",
      onConfirm: async () => {
        await fetch(`/api/admin/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        toast.success("Status berhasil diperbarui");
        loadUsers();
        fetch("/api/admin/users/stats")
          .then((r) => r.json())
          .then(setStats);
      },
    });
  };

  const roleFilters = [
    { value: "", label: "Semua", testId: "role-filter-all" },
    { value: "ADMIN", label: "Admin", testId: "role-filter-admin" },
    { value: "CONTRIBUTOR", label: "Kontributor", testId: "role-filter-contributor" },
    { value: "USER", label: "Pengguna", testId: "role-filter-user" },
  ];

  return (
    <>
      <ConfirmModal {...confirmProps} />

      <AdminPageLayout
        testId="admin-users-page"
        label="MANAJEMEN PENGGUNA"
        title={
          <>
            <Users size={36} strokeWidth={1.5} className="inline mr-3" />
            Semua Pengguna
          </>
        }
        subtitle={loading ? "..." : `${users.length} PENGGUNA`}
      >
        <AdminStatCards
          loading={statsLoading}
          skeletonCount={5}
          gridClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          items={[
            {
              label: "Total Pengguna",
              value: stats?.total ?? users.length,
              icon: Users,
              testId: "stat-total-pengguna",
            },
            {
              label: "Aktif",
              value: stats?.active ?? 0,
              icon: UserCheck,
              testId: "stat-pengguna-aktif",
            },
            {
              label: "Diblokir",
              value: stats?.banned ?? 0,
              icon: Ban,
              testId: "stat-pengguna-diblokir",
            },
            {
              label: "Belum Welcome",
              value: stats?.draft ?? 0,
              icon: Sparkles,
              testId: "stat-pengguna-draft",
            },
            {
              label: "Tidak Aktif",
              value: stats?.inactive ?? 0,
              icon: UserX,
              testId: "stat-pengguna-tidak-aktif",
            },
          ]}
        />
        <AdminToolbar>
          <AdminFilterButtons
            options={roleFilters}
            value={roleFilter}
            onChange={setRoleFilter}
          />
          <AdminSearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={() => setSearch(searchInput)}
            placeholder="Cari berdasarkan nama, username, atau email..."
            className="flex-1 sm:max-w-none"
            testId="user-search-input"
          />
        </AdminToolbar>

        <AdminCard
          title={`${loading ? "..." : users.length} PENGGUNA`}
          variant="list"
          noPadding
          className="overflow-x-auto"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PENGGUNA</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead>POIN</TableHead>
                <TableHead>ARTIKEL</TableHead>
                <TableHead>ROLE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>AKSI</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && users.length === 0 ? (
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                  <TableRow key={r}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <SkeletonBox height="2rem" width="2rem" />

                        <div>
                          <SkeletonBox height="1rem" width="8rem" />

                          <div className="mt-2">
                            <SkeletonBox height="0.8rem" width="6rem" />
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <SkeletonBox height="0.9rem" width="10rem" />
                    </TableCell>

                    <TableCell>
                      <SkeletonBox height="0.9rem" width="4rem" />
                    </TableCell>

                    <TableCell>
                      <SkeletonBox height="0.9rem" width="3rem" />
                    </TableCell>

                    <TableCell>
                      <SkeletonBox height="0.9rem" width="4rem" />
                    </TableCell>

                    <TableCell>
                      <SkeletonBox height="0.9rem" width="4rem" />
                    </TableCell>

                    <TableCell>
                      <SkeletonBox height="0.9rem" width="6rem" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-jepang-muted py-12"
                  >
                    Tidak ada pengguna ditemukan
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
                      {user.totalPoints ?? '—'}
                    </TableCell>

                    <TableCell className="font-mono">
                      {user.articleCount || 0}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          user.role === "ADMIN"
                            ? "red"
                            : user.role === "CONTRIBUTOR"
                              ? "warning"
                              : "muted"
                        }
                      >
                        {user.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1">
                            <Shield size={10} /> Admin
                          </span>
                        ) : user.role === "CONTRIBUTOR" ? (
                          <span className="inline-flex items-center gap-1">
                            <PenSquare size={10} /> Kontributor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <User size={10} /> Pengguna
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
                        {getStatusLabel(user.status)}
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
                          <Link href={`/admin/users/${user.id}`}>Lihat</Link>
                        </Button>

                        {user.role === "USER" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRoleChange(user.id, "CONTRIBUTOR")
                              }
                              data-testid={`promote-contributor-${user.id}`}
                            >
                              Jadikan Kontributor
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white"
                              onClick={() => handleRoleChange(user.id, "ADMIN")}
                              data-testid={`promote-${user.id}`}
                            >
                              Jadikan Admin
                            </Button>
                          </>
                        ) : user.role === "CONTRIBUTOR" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-jepang-red text-jepang-red hover:bg-jepang-red hover:text-white"
                              onClick={() => handleRoleChange(user.id, "ADMIN")}
                              data-testid={`promote-admin-${user.id}`}
                            >
                              Jadikan Admin
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(user.id, "USER")}
                              data-testid={`demote-${user.id}`}
                            >
                              Jadikan Pengguna
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRoleChange(user.id, "USER")}
                            data-testid={`demote-${user.id}`}
                          >
                            Jadikan Pengguna
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
                            Blokir
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
                            Buka Blokir
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </AdminCard>
      </AdminPageLayout>
    </>
  );
}