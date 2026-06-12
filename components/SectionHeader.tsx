import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  label: string;
  title: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  bgImage?: string;
  dark?: boolean;
  className?: string;
  children?: ReactNode;
};

export default function SectionHeader({
  label,
  title,
  subtitle,
  icon,
  bgImage,
  dark = false,
  className,
  children,
}: SectionHeaderProps) {
  const darkMode = bgImage || dark;

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-jepang-border",
        darkMode ? "text-white" : "bg-jepang-off-white text-foreground",
        className,
      )}
    >
      {bgImage ? (
        <div className="absolute inset-0">
          <img src={bgImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ) : null}

      <div className="relative px-4 mx-auto max-w-7xl py-12">
        <div className="flex flex-col gap-4 md:items-start">
          <div className="flex items-start gap-4">
            {icon ? (
              <div className="shrink-0 text-jepang-red">{icon}</div>
            ) : null}
            <div>
              <p className="section-label mb-2">
                {label}
              </p>
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-4">
                {title}
              </h1>
            </div>
          </div>

          {subtitle ? (
            <p
              className={cn(
                "max-w-2xl",
                darkMode ? "text-zinc-100/95" : "text-zinc-500",
              )}
            >
              {subtitle}
            </p>
          ) : null}

          {children ? <div className="mt-4 w-full">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
