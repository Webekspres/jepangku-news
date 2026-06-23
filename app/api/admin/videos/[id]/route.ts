import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditAdminEntity } from "@/lib/audit-routes";
import { sanitizeMediaUrl, sanitizePlainField } from "@/lib/sanitizer";
import { extractYoutubeId, youtubeThumbnailUrl } from "@/lib/video/youtube";
import { revalidateHomeTv } from "@/lib/video/revalidate";

type Params = { params: Promise<{ id: string }> };

async function clearOtherFeatured(exceptId: string) {
  await db.video.updateMany({
    where: { isFeatured: true, id: { not: exceptId } },
    data: { isFeatured: false },
  });
}

export async function GET(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError("Admin access required" , { status: 403 });

  const { id } = await params;
  const video = await db.video.findUnique({ where: { id } });
  if (!video) return apiError("Video not found" , { status: 404 });

  return apiSuccess(video);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError("Admin access required" , { status: 403 });

  const { id } = await params;
  const existing = await db.video.findUnique({ where: { id } });
  if (!existing) return apiError("Video not found" , { status: 404 });

  const body = await request.json();
  const {
    title,
    description,
    youtubeUrl,
    youtubeId: rawYoutubeId,
    thumbnailUrl,
    status,
    isFeatured,
    publishedAt,
  } = body;

  const updateData: Record<string, unknown> = {};

  if (title !== undefined) {
    const safeTitle = sanitizePlainField(title, 200);
    if (!safeTitle) return apiError("Title is required" , { status: 400 });
    updateData.title = safeTitle;
  }

  if (description !== undefined) {
    updateData.description = description ? sanitizePlainField(description, 2000) : null;
  }

  if (youtubeUrl !== undefined || rawYoutubeId !== undefined) {
    const youtubeId =
      extractYoutubeId(rawYoutubeId ?? "") ?? extractYoutubeId(youtubeUrl ?? "");
    if (!youtubeId) {
      return apiError("Valid YouTube URL or ID is required" , { status: 400 });
    }
    updateData.youtubeId = youtubeId;
    if (thumbnailUrl === undefined) {
      updateData.thumbnailUrl = youtubeThumbnailUrl(youtubeId);
    }
  }

  if (thumbnailUrl !== undefined) {
    updateData.thumbnailUrl = sanitizeMediaUrl(thumbnailUrl) ?? youtubeThumbnailUrl(existing.youtubeId);
  }

  if (status !== undefined) {
    const normalizedStatus = String(status).toUpperCase();
    updateData.status = normalizedStatus;
    if (normalizedStatus === "PUBLISHED" && !existing.publishedAt && publishedAt === undefined) {
      updateData.publishedAt = new Date();
    }
    if (normalizedStatus !== "PUBLISHED" && existing.isFeatured) {
      updateData.isFeatured = false;
    }
  }

  if (publishedAt !== undefined) {
    updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;
  }

  if (isFeatured !== undefined) {
    const featured = Boolean(isFeatured);
    const effectiveStatus = (updateData.status ?? existing.status) as string;
    if (featured && effectiveStatus !== "PUBLISHED") {
      return apiSuccess(
        { error: "Hanya video terbit yang bisa dijadikan featured" },
        { status: 400 },
      );
    }
    updateData.isFeatured = featured;
    if (featured) await clearOtherFeatured(id);
  }

  await db.video.update({ where: { id }, data: updateData });

  auditAdminEntity(admin, "video", "update", {
    type: "video",
    id,
    label: (updateData.title as string | undefined) ?? existing.title,
    href: `/admin/videos/${id}/edit`,
  });

  revalidateHomeTv();

  const updated = await db.video.findUnique({ where: { id } });
  return apiSuccess({ message: "Video updated", video: updated });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError("Admin access required" , { status: 403 });

  const { id } = await params;
  const video = await db.video.findUnique({ where: { id } });
  if (!video) return apiError("Video not found" , { status: 404 });

  if (video.status !== "DRAFT") {
    return apiSuccess(
      { error: "Hanya video berstatus Draft yang dapat dihapus" },
      { status: 400 },
    );
  }

  auditAdminEntity(admin, "video", "delete", { type: "video", id: video.id, label: video.title, href: `/admin/videos/${id}/edit` });

  await db.video.delete({ where: { id } });

  revalidateHomeTv();

  return apiSuccess({ message: "Video deleted" });
}
