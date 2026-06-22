import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SectionHeader from '@/components/SectionHeader';
import InfoPageSidebar from '@/components/InfoPageSidebar';
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

      <div className="px-4 mx-auto max-w-7xl py-12">
        <InfoPageSidebar slug={slug} variant="mobile" />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-0 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div
            className="article-content min-w-0 max-w-3xl lg:max-w-none"
            data-testid="info-page-content"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
          <InfoPageSidebar slug={slug} />
        </div>
      </div>
    </div>
  );
}
