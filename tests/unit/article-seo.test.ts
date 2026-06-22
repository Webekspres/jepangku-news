import { describe, expect, test } from 'bun:test';
import { buildArticleJsonLd } from '@/lib/article-seo';

describe('buildArticleJsonLd — metadata SEO (§3.2)', () => {
  test('returns NewsArticle schema with headline and description', () => {
    const jsonLd = buildArticleJsonLd({
      slug: 'test-artikel',
      title: 'Judul Artikel',
      description: 'Ringkasan artikel untuk SEO.',
      coverImageUrl: 'https://cdn.example.com/cover.jpg',
      publishedAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z',
      authorName: 'Penulis Jepangku',
    });

    expect(jsonLd['@type']).toBe('NewsArticle');
    expect(jsonLd.headline).toBe('Judul Artikel');
    expect(jsonLd.description).toBe('Ringkasan artikel untuk SEO.');
    expect(jsonLd.datePublished).toBe('2026-01-15T08:00:00.000Z');
    expect(jsonLd.dateModified).toBe('2026-06-01T12:00:00.000Z');
    expect(jsonLd.author).toEqual({ '@type': 'Person', name: 'Penulis Jepangku' });
    expect(jsonLd.image).toHaveLength(1);
    expect(jsonLd.mainEntityOfPage?.['@id']).toContain('/articles/test-artikel');
  });

  test('falls back to default image when cover is missing', () => {
    const jsonLd = buildArticleJsonLd({
      slug: 'no-cover',
      title: 'Tanpa Cover',
      description: 'Deskripsi',
      coverImageUrl: null,
      publishedAt: null,
      updatedAt: null,
      authorName: null,
    });

    expect(jsonLd.image[0]).toContain('web-app-manifest');
    expect(jsonLd.author).toBeUndefined();
  });
});
