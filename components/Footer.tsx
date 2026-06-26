"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import FooterNewsletterForm from "@/components/FooterNewsletterForm";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import { useAuth, getAuthLoginPath, getAuthRegisterPath, isAuthUser } from "@/contexts/AuthContext";
import { getContributorCta } from "@/lib/contributor";
import type { SocialLink } from "@/lib/site-config";
import { NAV_CATEGORIES, categoryArticlesHref } from "@/components/navbar/nav-config";

type FooterProps = {
  socialLinks?: SocialLink[];
};

export default function Footer({ socialLinks = [] }: FooterProps) {
  const { user, loading, logout, isSignedIn } = useAuth();
  const router = useRouter();
  const contributorCta = getContributorCta(isAuthUser(user) ? user : null);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <footer
      className="bg-jepang-red mt-24"
      data-testid="main-footer"
    >
      <div className="px-4 mx-auto max-w-7xl py-12">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-8 text-white">
          <div className="col-span-2 md:col-span-3">
            <div className="flex flex-col items-center md:items-start">
              <img
                src="/assets/images/logo/logo-02-dark.svg"
                width={160}
                height={48}
                className="h-40 w-auto mb-4"
                alt="Jepangku"
                draggable={false}
              />
              <p className="text-sm text-white/80 leading-relaxed mb-4 max-w-sm">
                JepangKu - Jepang versi kamu! 
              </p>
              <p className="text-sm text-white/80 leading-relaxed mb-4 max-w-sm text-center md:text-start">
                Portal media interaktif bertema Jepang untuk pembaca Indonesia, menghadirkan berita terbaru, artikel menarik, dan berbagai informasi seputar budaya, hiburan, lifestyle, hingga edukasi bahasa Jepang.
              </p>
              <div className="w-full max-w-sm">
                <FooterNewsletterForm
                  defaultEmail={""}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="section-label text-jepang-yellow! mb-3 text-lg">Kategori</p>
            <ul className="space-y-2 text-sm">
              {NAV_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={categoryArticlesHref(cat.slug)}
                    className="hover:text-jepang-yellow transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="section-label text-jepang-yellow! mb-3">Informasi</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/advertise"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Advertise
                </Link>
              </li>
              <li>
                <Link
                  href="/media-partner"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Media Partner
                </Link>
              </li>
              <li>
                <Link
                  href="/career"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Career
                </Link>
              </li>
              <li>
                <Link
                  href="/internship"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Internship
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="section-label text-jepang-yellow! mb-3">Akun</p>
            <ul className="space-y-2 text-sm">
              {loading && isSignedIn ? (
                <>
                  <li className="h-4 w-24 bg-white/20 animate-pulse" />
                </>
              ) : isSignedIn ? (
                <>
                  <li>
                    <Link
                      href="/profile"
                      className="hover:text-jepang-yellow transition-colors"
                    >
                      Profil
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="hover:text-jepang-yellow transition-colors"
                    >
                      Keluar
                    </button>
                  </li>
                  <li>
                    <Link
                      href={contributorCta.href}
                      className="hover:text-jepang-yellow transition-colors"
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
                      className="hover:text-jepang-yellow transition-colors"
                    >
                      Masuk
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={getAuthRegisterPath()}
                      className="hover:text-jepang-yellow transition-colors"
                    >
                      Daftar
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={contributorCta.href}
                      className="hover:text-jepang-yellow transition-colors"
                    >
                      {contributorCta.label}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div>
            <p className="section-label text-jepang-yellow! mb-3">Jelajahi</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/articles"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Artikel
                </Link>
              </li>
              <li>
                <Link
                  href="/quizzes"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Kuis
                </Link>
              </li>
              <li>
                <Link
                  href="/polls"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Polling
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="hover:text-jepang-yellow transition-colors"
                >
                  Peringkat
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/70 font-mono">
            &copy; 2026 JEPANGKU. SEMUA HAK DILINDUNGI.
          </p>
          {socialLinks.length > 0 ? (
            <SocialMediaLinks
              links={socialLinks}
              testIdPrefix="footer-social"
              tone="light"
            />
              ) : null}
        </div>
      </div>
    </footer>
  );
}
