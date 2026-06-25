"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AssetImage from "@/components/AssetImage";
import { imageLoadingProps } from "@/lib/image-loading";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams?.get("from") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "ADMIN") router.push("/admin");
      else router.push(from);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Masuk gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-jepang-off-white"
      data-testid="login-page"
    >
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center pb-2">
            <Link
              href="/"
              className="font-heading font-black tracking-tighter"
            >
              <AssetImage
                src="/assets/images/logo/logo-01.svg"
                alt="Jepangku Logo"
                width={180}
                height={18}
                className="mx-auto"
                {...imageLoadingProps(true)}
              />
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted mt-2">
              Selamat datang kembali! Silakan masuk untuk melanjutkan.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              data-testid="login-form"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email atau Nama Pengguna</Label>
                <Input
                  id="email"
                  type="text"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  data-testid="login-email-input"
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
                  data-testid="login-password-input"
                />
              </div>

              {error && (
                <div
                  className="bg-jepang-red text-white p-3 text-sm"
                  data-testid="login-error"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                data-testid="login-submit-btn"
              >
                {loading ? "Masuk.." : "Masuk"}
              </Button>
            </form>

            <p className="text-center text-sm text-jepang-muted mt-6">
              Tidak punya akun?{" "}
              <Link
                href="/register"
                className="text-jepang-red font-semibold hover:underline"
                data-testid="link-to-register"
              >
                Daftar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginClientPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-muted">
            Memuat halaman login...
          </p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
