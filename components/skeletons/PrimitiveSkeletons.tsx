interface BoxProps {
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonBox({
  width = "100%",
  height = "1rem",
  className = "",
}: BoxProps) {
  return (
    <div
      aria-hidden
      className={`bg-jepang-red/10 animate-pulse ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="bg-jepang-red/10 animate-pulse"
      style={{ width: size, height: size }}
    />
  );
}

export default function _Dummy() {
  return null;
}
