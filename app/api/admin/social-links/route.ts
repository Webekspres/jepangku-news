import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  SOCIAL_LINKS_CACHE_TAG,
  getAdminSocialLinks,
  parseSocialLinkUpdates,
  saveSocialLinkUpdates,
} from "@/lib/social-links";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const links = await getAdminSocialLinks();
  return NextResponse.json({ links });
}

export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseSocialLinkUpdates(body?.links);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  await saveSocialLinkUpdates(parsed.updates);
  revalidateTag(SOCIAL_LINKS_CACHE_TAG, "max");

  const links = await getAdminSocialLinks();
  return NextResponse.json({ links });
}
