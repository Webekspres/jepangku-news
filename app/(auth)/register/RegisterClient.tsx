"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RegisterClientPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Kata sandi tidak cocok");
      return;
    }
    if (form.password.length < 6) {
      setError("Kata sandi minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Pendaftaran gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-jepang-off-white"
      data-testid="register-page"
    >
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center pb-2">
            <Link
              href="/"
              className="font-heading font-black text-3xl tracking-tighter"
            >
              <span className="text-jepang-red">Jepang</span>
              <span className="text-foreground">ku</span>
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted mt-2">
              Bergabunglah dengan kami! Buat akun untuk mulai berbagi dan menikmati berita seputar Jepang.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              data-testid="register-form"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nama Tampilan</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  data-testid="register-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nama Pengguna</Label>
                <Input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value.toLowerCase() })
                  }
                  required
                  pattern="[a-z0-9_]+"
                  data-testid="register-username-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  data-testid="register-email-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  minLength={6}
                  data-testid="register-password-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  required
                  data-testid="register-confirm-password-input"
                />
              </div>

              {error && (
                <div
                  className="bg-jepang-red text-white p-3 text-sm"
                  data-testid="register-error"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                data-testid="register-submit-btn"
              >
                {loading ? "Membuat akun..." : "Buat Akun"}
              </Button>
            </form>

            <p className="text-center text-sm text-jepang-muted mt-6">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-jepang-red font-semibold hover:underline"
                data-testid="link-to-login"
              >
                Masuk
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
