import VideoDetailClient from "@/components/videos/VideoDetailClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TvDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <VideoDetailClient slug={slug} />;
}
