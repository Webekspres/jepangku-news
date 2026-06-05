import type { Metadata } from 'next';
import {
  InfoPageServer,
  generateInfoPageMetadata,
} from '@/components/InfoPageServer';
import type { InfoPageSlug } from '@/lib/info-pages';

export function createInfoPage(slug: InfoPageSlug) {
  async function generateMetadata(): Promise<Metadata> {
    return generateInfoPageMetadata(slug);
  }

  async function Page() {
    return <InfoPageServer slug={slug} />;
  }

  return { generateMetadata, default: Page };
}
