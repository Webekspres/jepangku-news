import HomePageClient from "./HomePageClient";

/** Harus di Server Component — `force-dynamic` diabaikan jika di file `"use client"`. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  return <HomePageClient />;
}
