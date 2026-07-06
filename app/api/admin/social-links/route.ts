import { revalidateTag } from "next/cache";
import { apiError, apiSuccess } from '@/lib/api-response';
import { NextRequest } from 'next/server';
import { getCurrentAdmin } from "@/lib/auth";
import { auditAdminEntity } from "@/lib/audit-routes";
import {
  SOCIAL_LINKS_CACHE_TAG,
  getAdminSocialLinks,
  parseSocialLinkUpdates,
  saveSocialLinkUpdates,
} from "@/lib/social-links";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return apiError("Admin access required" , { status: 403 });
  }

  const links = await getAdminSocialLinks();
  return apiSuccess({ links });
}

export async function PUT(request: NextRequest) {
  const admin = await getCurrentAdmin(request);
  if (!admin) {
    return apiError("Admin access required" , { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseSocialLinkUpdates(body?.links);
  if (!parsed.ok) {
    return apiError(parsed.error , { status: 400 });
  }

  await saveSocialLinkUpdates(parsed.updates);
  revalidateTag(SOCIAL_LINKS_CACHE_TAG, "max");

  auditAdminEntity(admin, 'social_links', 'update', {
    type: 'social_links',
    id: 'global',
    label: 'Media sosial',
    href: '/admin/social-links',
  });

  const links = await getAdminSocialLinks();
  return apiSuccess({ links });
}
