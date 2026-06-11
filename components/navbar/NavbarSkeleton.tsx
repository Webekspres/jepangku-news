export function NavbarLayerOneSkeleton() {
  return (
    <div
      className="flex h-10 items-center justify-end px-4"
      style={{ backgroundColor: "var(--color-jepang-navy)" }}
      aria-hidden
    >
      <div className="h-7 w-28 animate-pulse rounded-md bg-white/20" />
    </div>
  );
}

export function NavbarLayerTwoSkeleton() {
  return (
    <div
      className="border-b border-jepang-border"
      style={{ backgroundColor: "var(--color-jepang-off-white)" }}
      aria-hidden
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="h-9 w-32 animate-pulse rounded bg-jepang-border/70" />
        <div className="hidden flex-1 justify-center gap-6 md:flex">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-14 animate-pulse rounded bg-jepang-border/60" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden h-8 w-20 animate-pulse rounded-lg bg-jepang-border/70 md:block" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-jepang-border/70" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-jepang-border/70" />
        </div>
      </div>
    </div>
  );
}

export function NavbarLayerThreeSkeleton() {
  return (
    <div
      className="overflow-hidden transition-all duration-500 ease-out"
      style={{ backgroundColor: "var(--color-jepang-orange)" }}
      aria-hidden
    >
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 flex-1 gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-16 shrink-0 animate-pulse rounded bg-white/30"
            />
          ))}
        </div>
        <div className="h-8 w-8 shrink-0 animate-pulse rounded bg-white/30" />
      </div>
    </div>
  );
}

export default function NavbarSkeleton() {
  return (
    <div data-testid="navbar-skeleton" className="pointer-events-none">
      <NavbarLayerOneSkeleton />
      <NavbarLayerTwoSkeleton />
      <NavbarLayerThreeSkeleton />
    </div>
  );
}
