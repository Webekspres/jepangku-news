"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Save,
  Timer,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AvatarCropModal from "@/components/profile/AvatarCropModal";
import { preloadMediaImage } from "@/lib/media/client-cache";
import { uploadMediaFile } from "@/lib/upload-media";
import UserAvatar from "@/components/media/UserAvatar";
import { AVATAR_OUTPUT_SIZE } from "@/lib/avatar-crop";

interface ProfileForm {
  name: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
}

interface ProfileData extends ProfileForm {
  usernameCooldownDaysLeft: number;
  usernameChangedAt: string | null;
}

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    username: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [usernameCooldownDays, setUsernameCooldownDays] = useState(0);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect jika belum login
  useEffect(() => {
    if (user === false) {
      router.replace("/sign-in");
    }
  }, [user, router]);

  // Load profile data
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data: ProfileData) => {
        setForm({
          name: data.name ?? "",
          username: data.username ?? "",
          displayName: data.displayName ?? data.name ?? "",
          bio: data.bio ?? "",
          avatarUrl: data.avatarUrl ?? "",
        });
        setUsernameCooldownDays(data.usernameCooldownDaysLeft ?? 0);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Gagal memuat data profil");
        setLoading(false);
      });
  }, [user]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format harus JPG, PNG, GIF, atau WebP");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setCropOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadCroppedAvatar = async (file: File) => {
    setUploading(true);
    try {
      const data = await uploadMediaFile(file, "avatar");
      const url = data.url;

      const saveRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      });
      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error || "Gagal menyimpan foto profil");
      }

      setForm((prev) => ({ ...prev, avatarUrl: url }));
      preloadMediaImage(url);
      await refreshUser();
      toast.success("Foto profil diperbarui");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload gagal");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleCropOpenChange = (open: boolean) => {
    setCropOpen(open);
    if (!open && cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Nama tidak boleh kosong");
      return;
    }
    if (!form.username.trim()) {
      setError("Username tidak boleh kosong");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim(),
          displayName: form.displayName.trim() || form.name.trim(),
          bio: form.bio.trim(),
          avatarUrl: form.avatarUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan profil");
      }

      await refreshUser();
      toast.success("Profil berhasil diperbarui");
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  // Skeleton saat loading
  if (loading || user === null) {
    return (
      <div className="bg-white min-h-screen">
        <section className="border-b border-jepang-border bg-jepang-off-white">
          <div className="px-4 mx-auto max-w-7xl py-12">
            <div className="h-4 w-24 bg-jepang-border animate-pulse mb-3" />
            <div className="h-10 w-64 bg-jepang-border animate-pulse" />
          </div>
        </section>
        <div className="px-4 mx-auto max-w-2xl py-12 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-jepang-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (user === false) return null;

  const avatarInitial = form.name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="bg-white min-h-screen" data-testid="edit-profile-page">
      {/* Header */}
      <section className="border-b border-jepang-border bg-jepang-off-white">
        <div className="px-4 mx-auto max-w-7xl py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted hover:text-foreground mb-4"
            data-testid="back-to-profile"
          >
            <ArrowLeft size={14} />
            Kembali ke Profil
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
            PROFIL
          </p>
          <h1 className="font-heading font-black text-4xl tracking-tighter">
            Edit Profil
          </h1>
        </div>
      </section>

      {/* Content */}
      <div className="px-4 mx-auto max-w-2xl py-12">
        <form onSubmit={handleSubmit} data-testid="edit-profile-form">
          {/* Avatar */}
          <Card className="border border-foreground mb-6">
            <CardHeader className="border-b border-jepang-border py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                FOTO PROFIL
              </p>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-6">
                {/* Avatar preview */}
                <div className="relative shrink-0">
                  <UserAvatar
                    src={form.avatarUrl || null}
                    alt="Avatar"
                    size={96}
                    fallbackInitial={avatarInitial}
                    testId={form.avatarUrl ? "avatar-preview" : "avatar-initial"}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 size={24} className="text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload controls */}
                <div className="flex-1">
                  <p className="text-sm text-jepang-muted mb-3">
                    Unggah foto JPG, PNG, atau WebP. Akan di-crop persegi{" "}
                    {AVATAR_OUTPUT_SIZE}×{AVATAR_OUTPUT_SIZE}px sebelum diupload.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="hover:bg-foreground hover:text-white"
                      data-testid="upload-avatar-btn"
                    >
                      <Camera size={14} className="mr-1" />
                      {uploading ? "Mengunggah..." : "Unggah Foto"}
                    </Button>
                    {form.avatarUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading || saving}
                        onClick={async () => {
                          setUploading(true);
                          try {
                            const res = await fetch("/api/user/profile", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ avatarUrl: null }),
                            });
                            if (!res.ok) {
                              const err = await res.json();
                              throw new Error(err.error || "Gagal menghapus foto");
                            }
                            setForm((prev) => ({ ...prev, avatarUrl: "" }));
                            await refreshUser();
                            toast.success("Foto profil dihapus");
                          } catch (err: unknown) {
                            toast.error(
                              err instanceof Error ? err.message : "Gagal menghapus foto",
                            );
                          } finally {
                            setUploading(false);
                          }
                        }}
                        className="text-jepang-red hover:bg-jepang-red hover:text-white border-jepang-red"
                        data-testid="remove-avatar-btn"
                      >
                        <UserIcon size={14} className="mr-1" />
                        Hapus Foto
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFilePick}
                    data-testid="avatar-file-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info dasar */}
          <Card className="border border-foreground mb-6">
            <CardHeader className="border-b border-jepang-border py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                INFORMASI DASAR
              </p>
            </CardHeader>
            <CardContent className="pt-6 pb-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Tampilan{" "}
                  <span className="text-jepang-red" aria-hidden>
                    *
                  </span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  maxLength={100}
                  placeholder="Nama kamu"
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  Username{" "}
                  <span className="text-jepang-red" aria-hidden>
                    *
                  </span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-jepang-muted text-sm select-none">
                    @
                  </span>
                  <Input
                    id="username"
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        username: e.target.value.toLowerCase(),
                      }))
                    }
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="[a-z0-9_]+"
                    placeholder="username_kamu"
                    className="pl-7"
                    disabled={usernameCooldownDays > 0}
                    data-testid="input-username"
                  />
                </div>
                {usernameCooldownDays > 0 ? (
                  <p className="flex items-center gap-1 text-xs font-semibold text-jepang-red">
                    <Timer className="h-3 w-3" />
                    Username bisa diganti lagi dalam{" "}
                    <span className="font-mono">{usernameCooldownDays} hari</span>.
                  </p>
                ) : (
                  <p className="text-xs text-jepang-muted">
                    Huruf kecil, angka, dan underscore. 3–30 karakter.{" "}
                    <span className="text-jepang-red font-semibold">
                      Hanya bisa diganti setiap 14 hari.
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Nama Publik</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  maxLength={100}
                  placeholder="Nama yang ditampilkan publik (opsional)"
                  data-testid="input-display-name"
                />
                <p className="text-xs text-jepang-muted">
                  Jika kosong, nama tampilan akan digunakan.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="border border-foreground mb-6">
            <CardHeader className="border-b border-jepang-border py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                BIO
              </p>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-2">
                <Label htmlFor="bio">Tentang Kamu</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  maxLength={300}
                  rows={4}
                  placeholder="Ceritakan sedikit tentang dirimu... (opsional)"
                  data-testid="input-bio"
                />
                <p className="text-xs text-jepang-muted text-right">
                  {form.bio.length}/300
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div
              className="bg-jepang-red text-white p-3 text-sm mb-6"
              role="alert"
              data-testid="edit-profile-error"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 sm:flex-none"
              data-testid="save-profile-btn"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="hover:bg-foreground hover:text-white"
              data-testid="cancel-edit-btn"
            >
              <Link href="/profile">Batal</Link>
            </Button>
          </div>
        </form>

        <AvatarCropModal
          open={cropOpen}
          imageSrc={cropImageSrc}
          onOpenChange={handleCropOpenChange}
          onConfirm={uploadCroppedAvatar}
        />
      </div>
    </div>
  );
}
