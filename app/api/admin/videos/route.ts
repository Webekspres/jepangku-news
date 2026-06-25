import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditAdminEntity } from "@/lib/audit-routes";
import { createSlug } from "@/lib/slug";
import { sanitizeMediaUrl, sanitizePlainField, sanitizeHtmlContent } from "@/lib/sanitizer";
import {
  parseVideoUrl,
  youtubeThumbnailUrl,
} from "@/lib/video/platform";
import { revalidateHomeTv } from "@/lib/video/revalidate";

async function clearOtherFeatured(exceptId?: string) {
  await db.video.updateMany({
    where: {
      isFeatured: true,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data: { isFeatured: false },
  });
}

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError("Admin access required", { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: { status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" } = {};
  if (status) where.status = status.toUpperCase() as typeof where.status;

  const videos = await db.video.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  return apiSuccess(videos, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError("Admin access required", { status: 403 });

  const body = await request.json();
  const {
    title,
    description,
    content,
    videoUrl: rawVideoUrl,
    thumbnailUrl,
    status = "DRAFT",
    isFeatured = false,
    publishedAt,
  } = body;

  const safeTitle = sanitizePlainField(title, 200);
  if (!safeTitle) return apiError("Title is required", { status: 400 });

  if (!rawVideoUrl || typeof rawVideoUrl !== "string" || !rawVideoUrl.trim()) {
    return apiError("URL video wajib diisi", { status: 400 });
  }

  const parsed = parseVideoUrl(rawVideoUrl.trim());
  if (!parsed) {
    return apiError(
      "URL video tidak valid. Masukkan URL YouTube, Facebook, TikTok, Instagram, atau URL video lainnya (harus http/https).",
      { status: 400 },
    );
  }

  const normalizedStatus = String(status).toUpperCase() as "DRAFT" | "PUBLISHED" | "ARCHIVED";
  const featured = Boolean(isFeatured);
  const slug = createSlug(safeTitle);

  // Thumbnail: manual upload > auto YouTube > kosong (platform lain perlu diisi manual)
  const safeThumbnail = sanitizeMediaUrl(thumbnailUrl);
  const resolvedThumbnail =
    safeThumbnail ??
    (parsed.platform === "YOUTUBE" && parsed.platformId
      ? youtubeThumbnailUrl(parsed.platformId)
      : null);

  if (!resolvedThumbnail && parsed.platform !== "YOUTUBE") {
    // Tidak wajib, tapi disarankan — biarkan null, komponen akan fallback ke placeholder
  }

  const resolvedPublishedAt =
    normalizedStatus === "PUBLISHED"
      ? publishedAt
        ? new Date(publishedAt)
        : new Date()
      : publishedAt
        ? new Date(publishedAt)
        : null;

  if (featured) await clearOtherFeatured();

  const video = await db.video.create({
    data: {
      title: safeTitle,
      slug,
      description: description ? sanitizePlainField(description, 2000) : null,
      content: content ? sanitizeHtmlContent(content) : null,
      videoUrl: parsed.originalUrl,
      platform: parsed.platform,
      youtubeId: parsed.platformId && parsed.platform === "YOUTUBE" ? parsed.platformId : null,
      thumbnailUrl: resolvedThumbnail ?? undefined,
      status: normalizedStatus,
      isFeatured: featured,
      publishedAt: resolvedPublishedAt,
      createdBy: admin.id,
    },
  });

  auditAdminEntity(admin, "video", "create", {
    type: "video",
    id: video.id,
    label: video.title,
    href: `/admin/videos/${video.id}/edit`,
  });

  revalidateHomeTv();

  return apiSuccess({ message: "Video created", id: video.id }, { status: 201 });
}
