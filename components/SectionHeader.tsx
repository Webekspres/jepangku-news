import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type SectionHeaderProps = {
  label: string;
  title: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  bgImage?: string;
  /** Override object-position / object-fit pada gambar latar */
  bgImageClassName?: string;
  dark?: boolean;
  className?: string;
  /** Override gaya judul (mis. ukuran teks responsif) */
  titleClassName?: string;
  /** Override gaya label (mis. warna agar kontras dengan latar) */
  labelClassName?: string;
  /** Lebar penuh tanpa max-w-7xl (mis. halaman admin) */
  fullWidth?: boolean;
  children?: ReactNode;
};

export default function SectionHeader({
  label,
  title,
  subtitle,
  icon,
  bgImage,
  bgImageClassName,
  dark = false,
  className,
  titleClassName,
  labelClassName,
  fullWidth = false,
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
          <Image
            src={bgImage}
            alt="Background image"
            className={cn("h-full w-full object-cover object-left", bgImageClassName)}
            width={1920}
            height={1080}
            priority
          />
        </div>
      ) : null}

      <div
        className={cn(
          "relative py-12",
          fullWidth ? "w-full px-4 lg:px-6" : "mx-auto max-w-7xl px-4",
        )}
      >
        <div className="flex flex-col gap-4 md:items-start">
          <div className="flex items-start gap-4">
            {icon ? (
              <div className="shrink-0 text-jepang-red">{icon}</div>
            ) : null}
            <div>
              <p
                className={cn(
                  "section-label mb-2",
                  darkMode && !labelClassName && "text-jepang-orange",
                  labelClassName,
                )}
              >
                {label}
              </p>
              <h1
                className={cn(
                  "font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tighter mb-4 max-w-4xl",
                  titleClassName,
                )}
              >
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
