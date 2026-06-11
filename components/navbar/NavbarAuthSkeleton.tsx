export default function NavbarAuthSkeleton() {
  return (
    <div
      className="hidden items-center gap-3 md:flex"
      data-testid="navbar-auth-skeleton"
      aria-hidden
    >
      <div className="h-8 w-24 animate-pulse bg-jepang-border/70" />
      <div className="flex h-9 w-9 animate-pulse items-center justify-center border border-jepang-border/70 bg-jepang-border/50" />
    </div>
  );
}
