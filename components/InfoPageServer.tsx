import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SectionHeader from '@/components/SectionHeader';
import { getPublishedInfoPage } from '@/lib/info-page-data';
import type { InfoPageSlug } from '@/lib/info-pages';

export async function generateInfoPageMetadata(
  slug: InfoPageSlug,
): Promise<Metadata> {
  const page = await getPublishedInfoPage(slug);
  if (!page) return {};

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.subtitle || undefined,
  };
}

export async function InfoPageServer({ slug }: { slug: InfoPageSlug }) {
  const page = await getPublishedInfoPage(slug);
  if (!page) notFound();

  return (
    <div data-testid={`info-page-${slug}`}>
      <SectionHeader
        label="情報 / INFO"
        title={page.title}
        subtitle={page.subtitle ?? undefined}
        className="border-b border-jepang-border bg-jepang-off-white"
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
