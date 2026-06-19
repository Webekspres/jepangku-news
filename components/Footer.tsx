"use client";

import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import { useRouter } from "next/navigation";
import FooterNewsletterForm from "@/components/FooterNewsletterForm";
import { useAuth, getAuthLoginPath, getAuthRegisterPath, isAuthUser } from "@/contexts/AuthContext";
import { getContributorCta } from "@/lib/contributor";
import { imageLoadingProps } from "@/lib/image-loading";
import { NAV_CATEGORIES, categoryArticlesHref } from "@/components/navbar/nav-config";

export default function Footer() {
  const { user, loading, logout, isSignedIn } = useAuth();
  const router = useRouter();
  const contributorCta = getContributorCta(isAuthUser(user) ? user : null);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <footer
      className="bg-jepang-navy mt-24"
      data-testid="main-footer"
    >
      {/* MENU JELAJAHI PINDAHKAN KE BAWAH AKUN FORM NESWLETTER PINDAHKAN KEBAWAH DESCRIPTION LOGO, DAN BUAT KOLOM DESKRIPTION LOGO LEBIH LEBAR DARI KOLOM LAINNYA DAN DEKRIPSI DI KOLOM SATU LEBIHH LEBAR DAN RATA KANAN */}
      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 text-white">
          <div className="col-span-2 md:col-span-1">
          <AssetImage
              src="/assets/images/logo/Logo-02-dark.svg"
              alt="Jepangku"
              width={160}
              height={48}
              className="h-40 w-auto mb-4"
              {...imageLoadingProps(false)}
            />
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Portal media interaktif bertema Jepang untuk pembaca Indonesia.
            </p>
          </div>
          <div>
            <p className="section-label text-jepang-orange mb-3">Jelajahi</p>
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
            <p className="section-label text-jepang-orange mb-3">Kategori</p>
            <ul className="space-y-2 text-sm">
              {NAV_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={categoryArticlesHref(cat.slug)}
                    className="hover:text-jepang-red transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="section-label text-jepang-orange mb-3">Informasi</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-jepang-red transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-jepang-red transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/advertise"
                  className="hover:text-jepang-red transition-colors"
                >
                  Advertise
                </Link>
              </li>
              <li>
                <Link
                  href="/media-partner"
                  className="hover:text-jepang-red transition-colors"
                >
                  Media Partner
                </Link>
              </li>
              <li>
                <Link
                  href="/career"
                  className="hover:text-jepang-red transition-colors"
                >
                  Career
                </Link>
              </li>
              <li>
                <Link
                  href="/internship"
                  className="hover:text-jepang-red transition-colors"
                >
                  Internship
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-jepang-red transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="hover:text-jepang-red transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="hover:text-jepang-red transition-colors"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="section-label text-jepang-orange mb-3">Akun</p>
            <ul className="space-y-2 text-sm">
              {loading && isSignedIn ? (
                <>
                  <li className="h-4 w-24 bg-zinc-800 animate-pulse" />
                </>
              ) : isSignedIn ? (
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
                      href={contributorCta.href}
                      className="hover:text-jepang-red transition-colors"
                    >
                      {contributorCta.label}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href={getAuthLoginPath()}
                      className="hover:text-jepang-red transition-colors"
                    >
                      Masuk
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={getAuthRegisterPath()}
                      className="hover:text-jepang-red transition-colors"
                    >
                      Daftar
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={contributorCta.href}
                      className="hover:text-jepang-red transition-colors"
                    >
                      {contributorCta.label}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div>
            <FooterNewsletterForm
              defaultEmail={isAuthUser(user) ? user.email : ""}
            />
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 font-mono">
            &copy; 2026 JEPANGKU. SEMUA HAK DILINDUNGI. DIBUAT OLEH{" "}
            <Link href={"https://webekspres.id"} className="font-bold">
              WEBEKSPRES
            </Link>
          </p>
          <p className="font-japanese text-xs text-zinc-400 tracking-wide">
            日本語ポータル | INDONESIA
          </p>
        </div>
      </div>
    </footer>
  );
}
