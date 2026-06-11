import { cn } from "@/lib/utils";

type LeaderboardAvatarProps = {
  avatarUrl?: string | null;
  displayName?: string | null;
  size?: "sm" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-2xl",
} as const;

export default function LeaderboardAvatar({
  avatarUrl,
  displayName,
  size = "sm",
  className,
}: LeaderboardAvatarProps) {
  const initial = displayName?.charAt(0).toUpperCase() || "J";
  const box = cn(
    sizeClass[size],
    "shrink-0 rounded-full border border-jepang-border object-cover",
    className,
  );

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName ? `Foto profil ${displayName}` : "Foto profil"}
        className={box}
      />
    );
  }

  return (
    <div
      className={cn(
        box,
        "flex items-center justify-center bg-jepang-navy font-bold text-white",
        size === "lg" && "font-heading",
      )}
    >
      {initial}
    </div>
  );
}
