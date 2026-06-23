import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { getCurrentAdmin } from "@/lib/auth";
import { isValidAdSlotPosition } from "@/lib/ads/constants";
import { revalidateAdSlots } from "@/lib/ads/revalidate";
import { auditAdminEntity } from "@/lib/audit-routes";
import { db } from "@/lib/db";
import { sanitizeMediaUrl, sanitizePlainField } from "@/lib/sanitizer";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError("Admin access required" , { status: 403 });

  const { id } = await params;
  const ad = await db.adSlot.findUnique({ where: { id } });
  if (!ad) return apiError("Ad not found" , { status: 404 });

  return apiSuccess(ad);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError("Admin access required" , { status: 403 });

  const { id } = await params;
  const existing = await db.adSlot.findUnique({ where: { id } });
  if (!existing) return apiError("Ad not found" , { status: 404 });

  const body = await request.json();
  const {
    position,
    title,
    imageUrl,
    linkUrl,
    altText,
    isActive,
    startAt,
    endAt,
    sortOrder,
  } = body;

  const updateData: Record<string, unknown> = {};

  if (position !== undefined) {
    if (!isValidAdSlotPosition(String(position))) {
      return apiError("Valid position is required" , { status: 400 });
    }
    updateData.position = String(position);
  }

  if (title !== undefined) {
    updateData.title = title ? sanitizePlainField(title, 200) : null;
  }

  if (imageUrl !== undefined) {
    const safeImageUrl = sanitizeMediaUrl(imageUrl);
    if (!safeImageUrl) {
      return apiError("Image URL is required" , { status: 400 });
    }
    updateData.imageUrl = safeImageUrl;
  }

  if (linkUrl !== undefined) {
    updateData.linkUrl = linkUrl
      ? sanitizeMediaUrl(linkUrl) ?? sanitizePlainField(linkUrl, 500)
      : null;
  }

  if (altText !== undefined) {
    updateData.altText = altText ? sanitizePlainField(altText, 200) : null;
  }

  if (isActive !== undefined) updateData.isActive = Boolean(isActive);
  if (startAt !== undefined) updateData.startAt = startAt ? new Date(startAt) : null;
  if (endAt !== undefined) updateData.endAt = endAt ? new Date(endAt) : null;
  if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder) || 0;

  await db.adSlot.update({ where: { id }, data: updateData });
  revalidateAdSlots(existing.position);
  if (updateData.position && updateData.position !== existing.position) {
    revalidateAdSlots(String(updateData.position));
  }

  auditAdminEntity(admin, "ad", "update", {
    type: "ad",
    id,
    label: existing.title ?? existing.position,
    href: `/admin/ads/${id}/edit`,
  });

  return apiSuccess({ message: "Ad updated" });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return apiError("Admin access required" , { status: 403 });

  const { id } = await params;
  const ad = await db.adSlot.findUnique({ where: { id } });
  if (!ad) return apiError("Ad not found" , { status: 404 });

  auditAdminEntity(admin, "ad", "delete", {
    type: "ad",
    id: ad.id,
    label: ad.title ?? ad.position,
    href: `/admin/ads/${id}/edit`,
  });

  await db.adSlot.delete({ where: { id } });
  revalidateAdSlots(ad.position);

  return apiSuccess({ message: "Ad deleted" });
}
