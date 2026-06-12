import { getLmsTeaserData } from "@/lib/home/lms-teaser-data";
import type { HomeLmsTeaserResponse } from "@/lib/home/types";

export async function fetchHomeLmsTeaser(): Promise<HomeLmsTeaserResponse> {
  return getLmsTeaserData();
}
