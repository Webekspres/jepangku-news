import Link from "next/link";
import { User } from "lucide-react";
import AuthorLink from "@/components/AuthorLink";

export type ArticleAuthor = {
  name: string;
  username: string;
  avatarUrl?: string | null;
  displayName?: string;
  bio?: string | null;
};

export default function AuthorProfileCard({ author }: { author: ArticleAuthor }) {
  const displayName = author.displayName ?? author.name;

  return (
    <section
      className="mt-8 flex gap-4 rounded-xl border border-jepang-border p-5 shadow-sm"
      data-testid="author-profile-card"
    >
      {author.avatarUrl ? (
        <img
          src={author.avatarUrl}
          alt={displayName}
          className="h-16 w-16 shrink-0 rounded-full border border-jepang-border object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-jepang-navy text-xl font-bold text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-mono uppercase tracking-wider text-jepang-muted mb-1">
          Ditulis oleh
        </p>
        <AuthorLink
          username={author.username}
          className="font-heading font-black text-xl tracking-tighter"
        >
          {displayName}
        </AuthorLink>
        <p className="text-xs font-mono text-jepang-muted mt-0.5">@{author.username}</p>
        {author.bio ? (
          <p className="mt-3 text-sm leading-relaxed text-jepang-muted line-clamp-3">
            {author.bio}
          </p>
        ) : (
          <p className="mt-3 text-sm italic text-jepang-muted">Belum ada bio.</p>
        )}
        <Link
          href={`/profile/${author.username}`}
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-jepang-red hover:underline"
          data-testid="author-profile-view-all"
        >
          <User size={12} /> Lihat profil penulis
        </Link>
      </div>
    </section>
  );
}
