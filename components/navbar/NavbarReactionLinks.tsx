import Link from "next/link";
import ReactionIcon from "@/components/reactions/ReactionIcon";
import { CONTENT_REACTIONS } from "@/lib/reactions-display";
import { cn } from "@/lib/utils";

type NavbarReactionLinksProps = {
  className?: string;
  variant?: "dark" | "light" | "sidebar";
};

export default function NavbarReactionLinks({
  className,
  variant = "dark",
}: NavbarReactionLinksProps) {
  const iconSize = variant === "dark" ? 20 : variant === "sidebar" ? 36 : 24;
  const linkClass =
    variant === "dark"
      ? "flex h-7 shrink-0 items-center justify-center rounded px-1.5 transition-colors hover:bg-white/10"
      : variant === "sidebar"
        ? "flex min-h-14 w-full cursor-pointer items-center justify-center rounded-lg border border-transparent transition-colors hover:border-jepang-red/20 hover:bg-jepang-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jepang-red focus-visible:ring-offset-2"
      : "flex h-8 shrink-0 items-center justify-center rounded-md px-2 transition-colors hover:bg-jepang-off-white";
  return (
    <nav
      className={cn(
        variant === "sidebar"
          ? "grid min-w-0 grid-cols-3 gap-2"
          : "flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none",
        className,
      )}
      aria-label="Reaksi komunitas"
      data-testid="navbar-reaction-links"
    >
      {CONTENT_REACTIONS.map((reaction) => (
        <Link
          key={reaction.key}
          href={`/reactions/${reaction.key.toLowerCase()}`}
          className={linkClass}
          title={reaction.label}
          aria-label={`Jelajahi konten dengan reaksi ${reaction.label}`}
          data-testid={`navbar-reaction-${reaction.key.toLowerCase()}`}
        >
          <ReactionIcon src={reaction.iconSrc} size={iconSize} />
        </Link>
      ))}
    </nav>
  );
}
