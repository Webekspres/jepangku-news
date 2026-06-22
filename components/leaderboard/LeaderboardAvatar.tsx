import UserAvatar from "@/components/media/UserAvatar";

type LeaderboardAvatarProps = {
  avatarUrl?: string | null;
  displayName?: string | null;
  size?: "sm" | "lg";
  className?: string;
};

const sizePx = {
  sm: 40,
  lg: 64,
} as const;

export default function LeaderboardAvatar({
  avatarUrl,
  displayName,
  size = "sm",
  className,
}: LeaderboardAvatarProps) {
  return (
    <UserAvatar
      src={avatarUrl}
      alt={displayName ? `Foto profil ${displayName}` : "Foto profil"}
      size={sizePx[size]}
      fallbackInitial={displayName ?? undefined}
      className={className}
    />
  );
}
