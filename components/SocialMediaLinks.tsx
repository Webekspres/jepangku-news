"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import type { SocialLink } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type SocialMediaLinksProps = {
  links: SocialLink[];
  className?: string;
  iconClassName?: string;
  testIdPrefix?: string;
  tone?: "light" | "dark";
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<
  SocialLink["id"],
  ComponentType<{ className?: string }>
> = {
  instagram: Instagram,
  facebook: Facebook,
  x: XIcon,
  youtube: Youtube,
  tiktok: TikTokIcon,
};

export default function SocialMediaLinks({
  links,
  className,
  iconClassName = "h-4 w-4",
  testIdPrefix = "social",
  tone = "light",
}: SocialMediaLinksProps) {
  if (links.length === 0) {
    return null;
  }

  const linkToneClass =
    tone === "light"
      ? "text-white/90 hover:bg-white/15 hover:text-white"
      : "text-jepang-navy/80 hover:bg-jepang-off-white hover:text-jepang-red";

  return (
    <div
      className={cn("flex shrink-0 items-center gap-0.5", className)}
      data-testid={`${testIdPrefix}-links`}
    >
      {links.map((link) => {
        const Icon = PLATFORM_ICONS[link.id];
        return (
          <Link
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
            aria-label={link.label}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              linkToneClass,
            )}
            data-testid={`${testIdPrefix}-${link.id}`}
          >
            <Icon className={iconClassName} />
          </Link>
        );
      })}
    </div>
  );
}
