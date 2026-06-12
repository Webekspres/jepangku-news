import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { isValidAdSlotPosition } from "@/lib/ads/constants";
import { db } from "@/lib/db";
import { sanitizeMediaUrl, sanitizePlainField } from "@/lib/sanitizer";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const position = searchParams.get("position");

  const where = position ? { position } : {};

  const ads = await db.adSlot.findMany({
    where,
    orderBy: [{ position: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  return NextResponse.json(ads);
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const body = await request.json();
  const {
    position,
    title,
    imageUrl,
    linkUrl,
    altText,
    isActive = true,
    startAt,
    endAt,
    sortOrder = 0,
  } = body;

  if (!position || !isValidAdSlotPosition(String(position))) {
    return NextResponse.json({ error: "Valid position is required" }, { status: 400 });
  }

  const safeImageUrl = sanitizeMediaUrl(imageUrl);
  if (!safeImageUrl) {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }

  const ad = await db.adSlot.create({
    data: {
      position: String(position),
      title: title ? sanitizePlainField(title, 200) : null,
      imageUrl: safeImageUrl,
      linkUrl: linkUrl ? sanitizeMediaUrl(linkUrl) ?? sanitizePlainField(linkUrl, 500) : null,
      altText: altText ? sanitizePlainField(altText, 200) : null,
      isActive: Boolean(isActive),
      startAt: startAt ? new Date(startAt) : null,
      endAt: endAt ? new Date(endAt) : null,
      sortOrder: Number(sortOrder) || 0,
      createdBy: admin.id,
    },
  });

  return NextResponse.json({ message: "Ad created", id: ad.id }, { status: 201 });
}
