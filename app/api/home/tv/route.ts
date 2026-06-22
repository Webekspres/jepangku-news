import { NextResponse } from "next/server";
import { fetchHomeTv } from "@/lib/home/queries/tv";
import type { HomeTvResponse } from "@/lib/home/types";

export async function GET(): Promise<NextResponse<HomeTvResponse>> {
  const data = await fetchHomeTv();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
