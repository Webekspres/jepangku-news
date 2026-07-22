import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditAdminEntity } from "@/lib/audit-routes";
import { sanitizeMediaUrl, sanitizePlainField, sanitizeHtmlContent } from "@/lib/sanitizer";
import {
  isYoutubeHostedThumbnail,
  parseVideoUrl,
  youtubeThumbnailUrl,
} from "@/lib/video/platform";
import { ensureInstagramThumbnail } from "@/lib/video/fetch-external-thumbnail";
import { revalidateHomeTv } from "@/lib/video/revalidate";
import { withRequestLogging } from '@/lib/logging/request-logger';

type Params = { params: Promise<{ id: string }> };

async function clearOtherFeatured(exceptId: string) {
  await db.video.updateMany({
    where: { isFeatured: true, id: { not: exceptId } },
    data: { isFeatured: false },
  });
}

const GET = withRequestLogging(async (request: NextRequest, { params }: Params) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError("Admin access required", { status: 403 });

  const { id } = await params;
  const video = await db.video.findUnique({ where: { id } });
  if (!video) return apiError("Video not found", { status: 404 });

  return apiSuccess(video);
});

const PATCH = withRequestLogging(async (request: NextRequest, { params }: Params) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError("Admin access required", { status: 403 });

  const { id } = await params;
  const existing = await db.video.findUnique({ where: { id } });
  if (!existing) return apiError("Video not found", { status: 404 });

  const body = await request.json();
  const {
    title,
    description,
    content,
    videoUrl: rawVideoUrl,
    thumbnailUrl,
    status,
    isFeatured,
    publishedAt,
  } = body;

  const updateData: Record<string, unknown> = {};

  if (title !== undefined) {
    const safeTitle = sanitizePlainField(title, 200);
    if (!safeTitle) return apiError("Title is required", { status: 400 });
    updateData.title = safeTitle;
  }

  if (description !== undefined) {
    updateData.description = description ? sanitizePlainField(description, 2000) : null;
  }

  if (content !== undefined) {
    updateData.content = content ? sanitizeHtmlContent(content) : null;
  }

  // Update video URL / platform
  if (rawVideoUrl !== undefined) {
    if (!rawVideoUrl || !rawVideoUrl.trim()) {
      return apiError("URL video tidak boleh kosong", { status: 400 });
    }

    const parsed = parseVideoUrl(rawVideoUrl.trim());
    if (!parsed) {
      return apiError(
        "URL video tidak valid. Masukkan URL YouTube, Facebook, TikTok, Instagram, atau URL video lainnya (harus http/https).",
        { status: 400 },
      );
    }

    updateData.videoUrl = parsed.originalUrl;
    updateData.platform = parsed.platform;
    updateData.youtubeId =
      parsed.platform === "YOUTUBE" && parsed.platformId ? parsed.platformId : null;

    // Auto-update thumbnail hanya jika thumbnailUrl tidak dikirim sekaligus
    if (thumbnailUrl === undefined) {
      if (parsed.platform === "YOUTUBE" && parsed.platformId) {
        updateData.thumbnailUrl = youtubeThumbnailUrl(parsed.platformId);
      } else if (
        parsed.platform !== "YOUTUBE" &&
        isYoutubeHostedThumbnail(existing.thumbnailUrl)
      ) {
        // Hapus thumbnail YouTube stale saat pindah ke IG/FB/TikTok/Other
        updateData.thumbnailUrl = null;
      }
    }
  }

  if (thumbnailUrl !== undefined) {
    const safe = sanitizeMediaUrl(thumbnailUrl);
    if (thumbnailUrl && !safe) {
      return apiError("URL thumbnail tidak valid (harus http/https)", { status: 400 });
    }
    const nextPlatform =
      (updateData.platform as string | undefined) ?? existing.platform;
    if (
      nextPlatform !== "YOUTUBE" &&
      safe &&
      isYoutubeHostedThumbnail(safe)
    ) {
      updateData.thumbnailUrl = null;
    } else {
      updateData.thumbnailUrl = safe ?? null;
    }
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

  const updated = await db.video.findUnique({ where: { id } });
  const withThumb = updated ? await ensureInstagramThumbnail(updated) : null;

  auditAdminEntity(admin, "video", "update", {
    type: "video",
    id,
    label: (updateData.title as string | undefined) ?? existing.title,
    href: `/admin/videos/${id}/edit`,
  });

  revalidateHomeTv();

  return apiSuccess({ message: "Video updated", video: withThumb ?? updated });
});

const DELETE = withRequestLogging(async (request: NextRequest, { params }: Params) => {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError("Admin access required", { status: 403 });

  const { id } = await params;
  const video = await db.video.findUnique({ where: { id } });
  if (!video) return apiError("Video not found", { status: 404 });

  if (video.status !== "DRAFT") {
    return apiSuccess(
      { error: "Hanya video berstatus Draft yang dapat dihapus" },
      { status: 400 },
    );
  }

  auditAdminEntity(admin, "video", "delete", {
    type: "video",
    id: video.id,
    label: video.title,
    href: `/admin/videos/${id}/edit`,
  });

  await db.video.delete({ where: { id } });

  revalidateHomeTv();

  return apiSuccess({ message: "Video deleted" });
});

export { GET, PATCH, DELETE };
