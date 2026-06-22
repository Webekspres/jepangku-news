"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdSlotDimensions } from "@/lib/ads/dimensions";
import { getAdSlotLabel } from "@/lib/ads/constants";
import { getAdScheduleInfo } from "@/lib/ads/schedule";

export type AdminAdListItem = {
  id: string;
  position: string;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  sortOrder: number;
};

type AdminAdsTableProps = {
  ads: AdminAdListItem[];
  onToggleActive: (ad: AdminAdListItem) => void;
  onDelete: (ad: AdminAdListItem) => void;
};

function ScheduleBadge({ status }: { status: ReturnType<typeof getAdScheduleInfo>["status"] }) {
  if (status === "expired") return <Badge variant="muted">Berakhir</Badge>;
  if (status === "upcoming") return <Badge variant="warning">Belum mulai</Badge>;
  if (status === "scheduled") return <Badge variant="success">Terjadwal</Badge>;
  return <Badge variant="muted">Tanpa jadwal</Badge>;
}

export default function AdminAdsTable({ ads, onToggleActive, onDelete }: AdminAdsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Banner</TableHead>
          <TableHead>Slot & Ukuran</TableHead>
          <TableHead>Jadwal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Urutan</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ads.map((ad) => {
          const dims = getAdSlotDimensions(ad.position);
          const schedule = getAdScheduleInfo(ad.startAt, ad.endAt);

          return (
            <TableRow key={ad.id} data-testid={`admin-ad-row-${ad.id}`}>
              <TableCell>
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ad.imageUrl}
                    alt=""
                    className="h-12 w-20 rounded object-cover border border-jepang-border shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold line-clamp-1">
                      {ad.title || "Tanpa judul"}
                    </p>
                    {ad.linkUrl ? (
                      <p className="text-xs text-jepang-muted truncate max-w-[200px]">
                        {ad.linkUrl}
                      </p>
                    ) : null}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <p className="text-xs font-mono">{getAdSlotLabel(ad.position)}</p>
                <p className="text-xs text-jepang-muted mt-0.5">
                  {dims.width}×{dims.height}px
                </p>
              </TableCell>

              <TableCell>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-jepang-muted">Mulai:</span> {schedule.startLabel}
                  </p>
                  <p>
                    <span className="text-jepang-muted">Berakhir:</span> {schedule.endLabel}
                  </p>
                  <p className="font-semibold text-jepang-navy">{schedule.daysRemainingLabel}</p>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col items-start gap-1.5">
                  <button type="button" onClick={() => onToggleActive(ad)}>
                    <Badge variant={ad.isActive ? "success" : "muted"}>
                      {ad.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </button>
                  <ScheduleBadge status={schedule.status} />
                </div>
              </TableCell>

              <TableCell className="font-mono text-sm">{ad.sortOrder}</TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/admin/ads/${ad.id}/edit`}>
                      <Pencil size={14} />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-jepang-red hover:text-jepang-red"
                    onClick={() => onDelete(ad)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
