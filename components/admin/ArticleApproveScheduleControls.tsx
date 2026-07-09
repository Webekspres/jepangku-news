"use client";

import { useState } from "react";
import { parseApiResponse } from "@/lib/fetch-api";
import { toast } from "sonner";
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { defaultScheduleInputValue, scheduleInputToIso, getScheduleInputError } from "@/lib/articles/schedule-input";
import SchedulePublishInput from "@/components/admin/SchedulePublishInput";
import { useConfirm, ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";

type ArticleApproveScheduleControlsProps = {
  articleId: string;
  onComplete?: () => void | Promise<void>;
  layout?: "panel" | "inline";
  disabled?: boolean;
  className?: string;
};

export default function ArticleApproveScheduleControls({
  articleId,
  onComplete,
  layout = "panel",
  disabled = false,
  className,
}: ArticleApproveScheduleControlsProps) {
  const [scheduleInput, setScheduleInput] = useState(defaultScheduleInputValue);
  const [loading, setLoading] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const { confirm, confirmProps } = useConfirm();

  const scheduleError = getScheduleInputError(scheduleInput);

  const runApprove = async (mode: "immediate" | "schedule") => {
    if (mode === "schedule" && scheduleError) {
      toast.error(scheduleError);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "schedule"
            ? { mode: "schedule", scheduledPublishAt: scheduleInputToIso(scheduleInput) }
            : { mode: "immediate" },
        ),
      });
      if (!res.ok) {
        const data = await parseApiResponse(res);
        throw new Error(data.error || data.message || "Gagal memproses artikel");
      }
      toast.success(
        mode === "schedule"
          ? "Artikel disetujui dan dijadwalkan tayang"
          : "Artikel dipublikasikan sekarang",
      );
      setScheduleDialogOpen(false);
      await onComplete?.();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal memproses artikel");
    } finally {
      setLoading(false);
    }
  };

  const confirmApproveNow = () => {
    confirm({
      title: "Publikasikan artikel sekarang?",
      description:
        "Artikel akan langsung tayang di situs. Notifikasi dan newsletter dikirim saat artikel live.",
      confirmLabel: "Publikasikan Sekarang",
      variant: "info",
      onConfirm: () => runApprove("immediate"),
    });
  };

  const confirmSchedule = () => {
    if (scheduleError) {
      toast.error(scheduleError);
      return;
    }
    confirm({
      title: "Jadwalkan tayang artikel?",
      description:
        "Artikel disetujui dan akan tayang otomatis pada waktu yang dipilih (WIB). Notifikasi dikirim saat artikel benar-benar live.",
      confirmLabel: "Jadwalkan Tayang",
      variant: "info",
      onConfirm: () => runApprove("schedule"),
    });
  };

  const isBusy = disabled || loading;
  const isPanel = layout === "panel";

  if (!isPanel) {
    return (
      <>
        <ConfirmModal {...confirmProps} />
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogPortal open={scheduleDialogOpen}>
            <DialogOverlay />
            <DialogContent className="w-full max-w-sm rounded-lg border border-jepang-border bg-white p-5 shadow-jepang-lg">
              <DialogTitle className="font-heading text-lg font-bold">
                Jadwalkan Tayang
              </DialogTitle>
              <DialogDescription className="text-sm text-jepang-muted mt-1 mb-4">
                Pilih tanggal dan jam tayang (WIB). Artikel disetujui dan akan live
                otomatis pada waktu tersebut.
              </DialogDescription>
              <SchedulePublishInput
                id={`schedule-dialog-${articleId}`}
                value={scheduleInput}
                onChange={setScheduleInput}
                disabled={isBusy}
                testId={`schedule-input-${articleId}`}
              />
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  onClick={confirmSchedule}
                  disabled={isBusy || !!scheduleError}
                  data-testid={`schedule-article-${articleId}`}
                >
                  <Clock size={14} className="mr-1" />
                  {loading ? "Memproses..." : "Jadwalkan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={isBusy}
                  onClick={() => setScheduleDialogOpen(false)}
                >
                  Batal
                </Button>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        <div className={cn("flex flex-wrap gap-1", className)}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setScheduleDialogOpen(true)}
            disabled={isBusy}
            data-testid={`open-schedule-${articleId}`}
          >
            <Clock size={14} className="mr-1" />
            Jadwalkan
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={confirmApproveNow}
            disabled={isBusy}
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid={`approve-article-${articleId}`}
          >
            <Check size={14} className="mr-1" />
            Publikasikan
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <ConfirmModal {...confirmProps} />
      <div
        className={cn(
          "space-y-3 rounded border border-jepang-border bg-jepang-off-white p-3",
          className,
        )}
      >
        <p className="text-[11px] leading-snug text-jepang-muted">
          Setujui artikel ini untuk tayang. Pilih publikasi langsung atau jadwalkan
          waktu tayang (WIB).
        </p>

        <SchedulePublishInput
          id={`schedule-${articleId}`}
          value={scheduleInput}
          onChange={setScheduleInput}
          disabled={isBusy}
          inputClassName="w-full"
          testId={`schedule-input-${articleId}`}
        />

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={confirmSchedule}
            disabled={isBusy || !!scheduleError}
            className="w-full justify-center"
            data-testid={`schedule-article-${articleId}`}
          >
            <Clock size={14} className="mr-1" />
            {loading ? "Memproses..." : "Jadwalkan Tayang"}
          </Button>
          <Button
            type="button"
            onClick={confirmApproveNow}
            disabled={isBusy}
            className="w-full justify-center bg-green-600 hover:bg-green-700 text-white"
            data-testid={`approve-article-${articleId}`}
          >
            <Check size={14} className="mr-1" />
            Publikasikan Sekarang
          </Button>
        </div>
      </div>
    </>
  );
}
