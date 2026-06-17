"use client";

import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { formatNotificationTime } from "@/lib/notifications/format";
import { cn } from "@/lib/utils";

type NotificationBellMenuProps = {
  buttonTestId?: string;
  menuTestId?: string;
  buttonClassName?: string;
};

export default function NotificationBellMenu({
  buttonTestId = "navbar-notifications-button",
  menuTestId = "navbar-notifications-menu",
  buttonClassName,
}: NotificationBellMenuProps) {
  const router = useRouter();
  const {
    unreadCount,
    items,
    listLoading,
    loadList,
    reloadList,
    markRead,
    markAllRead,
  } = useNotifications(true);

  const handleOpenChange = (open: boolean) => {
    if (open) void loadList({ force: true });
  };

  const handleItemClick = async (
    notificationId: string,
    link: string | null,
    readAt: string | null,
  ) => {
    if (!readAt) await markRead(notificationId);
    if (link) {
      router.push(link);
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "relative shrink-0 text-jepang-muted hover:text-foreground",
            buttonClassName,
          )}
          aria-label={
            unreadCount > 0
              ? `Notifikasi, ${unreadCount} belum dibaca`
              : "Notifikasi"
          }
          data-testid={buttonTestId}
        >
          <Bell size={20} strokeWidth={1.5} />
          {unreadCount > 0 ? (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-jepang-red px-1 text-[10px] font-bold leading-none text-white"
              data-testid={`${buttonTestId}-badge`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0"
        data-testid={menuTestId}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notifikasi
            {unreadCount > 0 ? (
              <span className="ml-1 font-normal text-jepang-muted">
                ({unreadCount} baru)
              </span>
            ) : null}
          </DropdownMenuLabel>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-xs text-jepang-muted hover:text-foreground"
              onClick={() => void markAllRead().then(() => reloadList())}
              data-testid={`${menuTestId}-mark-all`}
            >
              <CheckCheck size={14} />
              Tandai semua
            </Button>
          ) : null}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="max-h-80 overflow-y-auto">
          {listLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-jepang-muted">
              <Loader2 size={16} className="animate-spin" />
              Memuat...
            </div>
          ) : items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-jepang-muted">
              Belum ada notifikasi.
            </p>
          ) : (
            <ul className="divide-y divide-jepang-border">
              {items.map((item) => {
                const unread = !item.readAt;
                const content = (
                  <div
                    className={cn(
                      "flex w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-jepang-surface/60",
                      unread && "bg-jepang-surface/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        unread ? "bg-jepang-red" : "bg-transparent",
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-snug text-foreground">
                        {item.title}
                      </span>
                      {item.body ? (
                        <span className="mt-0.5 block line-clamp-2 text-xs text-jepang-muted">
                          {item.body}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-[11px] text-jepang-muted">
                        {formatNotificationTime(item.createdAt)}
                      </span>
                    </span>
                  </div>
                );

                return (
                  <li key={item.id}>
                    {item.link ? (
                      <button
                        type="button"
                        className="block w-full"
                        onClick={() =>
                          void handleItemClick(item.id, item.link, item.readAt)
                        }
                        data-testid={`${menuTestId}-item-${item.id}`}
                      >
                        {content}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="block w-full"
                        onClick={() => {
                          if (!item.readAt) void markRead(item.id);
                        }}
                        data-testid={`${menuTestId}-item-${item.id}`}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
