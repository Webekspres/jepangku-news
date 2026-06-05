import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SectionHeader from '@/components/SectionHeader';
import { INFO_PAGE_SLUGS, isInfoPageSlug } from '@/lib/info-pages';
import { getPublishedInfoPage } from '@/lib/info-page-data';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return INFO_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isInfoPageSlug(slug)) return {};

  const page = await getPublishedInfoPage(slug);
  if (!page) return {};

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.subtitle || undefined,
  };
}

export default async function InfoPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isInfoPageSlug(slug)) notFound();

  const page = await getPublishedInfoPage(slug);
  if (!page) notFound();

  return (
    <div data-testid={`info-page-${slug}`}>
      <SectionHeader
        label="情報 / INFO"
        title={page.title}
        subtitle={page.subtitle ?? undefined}
        className="border-b-2 border-foreground bg-jepang-off-white"
      />

      <div className="px-4 mx-auto max-w-3xl py-12">
        <div
          className="article-content"
          data-testid="info-page-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
