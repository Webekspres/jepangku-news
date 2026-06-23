"use client";

import { useState, type ComponentType } from "react";
import { parseApiResponse } from '@/lib/fetch-api';
import { Copy, Facebook, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { gamificationPatchFromResponse } from "@/lib/gamification-response";
import {
  buildSharePlatformUrls,
  openShareWindow,
  type ShareMethod,
} from "@/lib/share";
import { cn } from "@/lib/utils";

type ArticleShareButtonsProps = {
  slug: string;
  title: string;
  url: string;
  isAuthenticated: boolean;
  hasShared: boolean;
  onShared: (patch?: ReturnType<typeof gamificationPatchFromResponse>) => void;
  disabled?: boolean;
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function XShareIcon({ className }: { className?: string }) {
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

const PLATFORM_BUTTONS: Array<{
  method: Exclude<ShareMethod, "copy-link">;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}> = [
  { method: "whatsapp", label: "Bagikan via WhatsApp", Icon: WhatsAppIcon },
  { method: "twitter", label: "Bagikan via X", Icon: XShareIcon },
  { method: "facebook", label: "Bagikan via Facebook", Icon: Facebook },
];

export default function ArticleShareButtons({
  slug,
  title,
  url,
  isAuthenticated,
  hasShared,
  onShared,
  disabled = false,
}: ArticleShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false);
  const shareUrls = buildSharePlatformUrls(url, title);

  const trackShare = async (shareMethod: ShareMethod) => {
    if (!isAuthenticated || hasShared) {
      return;
    }

    setIsSharing(true);
    try {
      const trackResponse = await fetch(`/api/articles/${slug}/share`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareMethod }),
      }).then((r) => parseApiResponse(r));

      if (trackResponse.pointsAwarded) {
        const message =
          shareMethod === "copy-link"
            ? `Tautan disalin! +${trackResponse.points} poin untuk berbagi!`
            : `+${trackResponse.points} poin untuk berbagi artikel!`;
        toast.success(message);
        onShared(gamificationPatchFromResponse(trackResponse));
      } else if (trackResponse.error === "Already shared this article") {
        onShared();
      }
    } catch (error) {
      console.error("Error tracking share:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      if (isAuthenticated && !hasShared) {
        await trackShare("copy-link");
      } else {
        toast.success("Tautan disalin!");
      }
    } catch {
      toast.error("Gagal menyalin tautan");
    }
  };

  const handlePlatformShare = async (
    method: Exclude<ShareMethod, "copy-link">,
  ) => {
    openShareWindow(shareUrls[method]);
    if (isAuthenticated && !hasShared) {
      await trackShare(method);
    }
  };

  const iconButtonClass = cn(
    "h-8 w-8 p-0",
    hasShared && isAuthenticated && "opacity-70",
  );

  return (
    <div
      className="flex items-center gap-1"
      data-testid="article-share-buttons"
      role="group"
      aria-label="Bagikan artikel"
    >
      <span className="sr-only">Bagikan</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={iconButtonClass}
        onClick={handleCopyLink}
        disabled={disabled || isSharing}
        aria-label="Salin tautan"
        data-testid="share-copy-link"
      >
        {hasShared && isAuthenticated ? (
          <Link2 size={14} strokeWidth={1.5} />
        ) : (
          <Copy size={14} strokeWidth={1.5} />
        )}
      </Button>

      {PLATFORM_BUTTONS.map(({ method, label, Icon }) => (
        <Button
          key={method}
          type="button"
          variant="outline"
          size="sm"
          className={iconButtonClass}
          onClick={() => handlePlatformShare(method)}
          disabled={disabled || isSharing}
          aria-label={label}
          data-testid={`share-${method}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </Button>
      ))}

      {isAuthenticated && hasShared ? (
        <span
          className="ml-1 hidden text-[10px] font-semibold uppercase tracking-wider text-jepang-muted sm:inline"
          data-testid="share-points-awarded-label"
        >
          Dibagikan
        </span>
      ) : null}
    </div>
  );
}
