"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, isAuthUser } from "@/contexts/AuthContext";

export default function Footer() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <footer
      className="bg-jepang-black text-white mt-24"
      data-testid="main-footer"
    >
      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/assets/images/logo/Logo-02-dark.svg"
              alt="Jepangku"
              width={160}
              height={48}
              className="h-40 mb-4"
            />
            <p className="text-sm text-zinc-400 leading-relaxed">
              Portal media interaktif bertema Jepang untuk pembaca Indonesia.
            </p>
          </div>
          <div>
            <h4 className="small-caps text-jepang-red mb-3">Jelajahi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/articles"
                  className="hover:text-jepang-red transition-colors"
                >
                  Artikel
                </Link>
              </li>
              <li>
                <Link
                  href="/quizzes"
                  className="hover:text-jepang-red transition-colors"
                >
                  Kuis
                </Link>
              </li>
              <li>
                <Link
                  href="/polls"
                  className="hover:text-jepang-red transition-colors"
                >
                  Polling
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="hover:text-jepang-red transition-colors"
                >
                  Peringkat
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="small-caps text-jepang-red mb-3">Kategori</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/articles?category=anime"
                  className="hover:text-jepang-red transition-colors"
                >
                  Anime
                </Link>
              </li>
              <li>
                <Link
                  href="/articles?category=manga"
                  className="hover:text-jepang-red transition-colors"
                >
                  Manga
                </Link>
              </li>
              <li>
                <Link
                  href="/articles?category=culture"
                  className="hover:text-jepang-red transition-colors"
                >
                  Budaya
                </Link>
              </li>
              <li>
                <Link
                  href="/articles?category=food"
                  className="hover:text-jepang-red transition-colors"
                >
                  Kuliner
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="small-caps text-jepang-red mb-3">Akun</h4>
            <ul className="space-y-2 text-sm">
              {loading ? (
                <>
                  <li className="h-4 w-24 bg-zinc-800 animate-pulse" />
                </>
              ) : isAuthUser(user) ? (
                <>
                  <li>
                    <Link
                      href="/profile"
                      className="hover:text-jepang-red transition-colors"
                    >
                      Profil
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="hover:text-jepang-red transition-colors"
                    >
                      Keluar
                    </button>
                  </li>
                  <li>
                    <Link
                      href="/submit-article"
                      className="hover:text-jepang-red transition-colors"
                    >
                      Kirim Artikel
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-jepang-red transition-colors"
                    >
                      Masuk
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="hover:text-jepang-red transition-colors"
                    >
                      Daftar
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/submit-article"
                      className="hover:text-jepang-red transition-colors"
                    >
                      Kirim Artikel
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 font-mono">
            &copy; 2026 JEPANGKU. SEMUA HAK DILINDUNGI. DIBUAT OLEH{" "}
            <Link href={"https://webekspres.id"} className="font-bold">
              WEBEKSPRES
            </Link>
          </p>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
            日本語ポータル | INDONESIA
          </p>
        </div>
      </div>
    </footer>
  );
}
