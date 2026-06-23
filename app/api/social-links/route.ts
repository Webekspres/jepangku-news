import { NextResponse } from "next/server";
import { apiError, apiSuccess } from '@/lib/api-response';
import { getPublicSocialLinks } from "@/lib/social-links";

export async function GET() {
  const links = await getPublicSocialLinks();
  return apiSuccess(
    { links },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
