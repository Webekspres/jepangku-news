import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AuthorLink({
  username,
  children,
  className,
}: {
  username?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  if (!username) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      href={`/profile/${username}`}
      className={cn("hover:text-jepang-red transition-colors", className)}
      data-testid={`author-link-${username}`}
    >
      {children}
    </Link>
  );
}
