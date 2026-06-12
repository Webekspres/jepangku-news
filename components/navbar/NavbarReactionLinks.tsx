import Link from "next/link";
import { CONTENT_REACTIONS } from "@/lib/reactions-display";
import { cn } from "@/lib/utils";

type NavbarReactionLinksProps = {
  className?: string;
};

export default function NavbarReactionLinks({ className }: NavbarReactionLinksProps) {
  return (
    <nav
      className={cn(
        "flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none",
        className,
      )}
      aria-label="Reaksi komunitas"
      data-testid="navbar-reaction-links"
    >
      {CONTENT_REACTIONS.map((reaction) => (
        <Link
          key={reaction.key}
          href={`/reactions/${reaction.key.toLowerCase()}`}
          className="flex h-7 shrink-0 items-center justify-center rounded px-1.5 text-base leading-none transition-colors hover:bg-white/10"
          title={reaction.label}
          aria-label={`Jelajahi konten dengan reaksi ${reaction.label}`}
          data-testid={`navbar-reaction-${reaction.key.toLowerCase()}`}
        >
          {reaction.emoji}
        </Link>
      ))}
    </nav>
  );
}
