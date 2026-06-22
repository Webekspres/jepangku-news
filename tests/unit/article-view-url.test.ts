import { describe, expect, test } from 'bun:test';
import {
  getArticleViewHref,
  getArticleViewLabel,
  isArticleLiveView,
} from '@/lib/article-view-url';

describe('getArticleViewHref', () => {
  test('published article with slug links to public page', () => {
    expect(
      getArticleViewHref({ id: 'art-1', slug: 'berita-jepang', status: 'PUBLISHED' }),
    ).toBe('/articles/berita-jepang');
  });

  test('published without slug falls back to preview', () => {
    expect(getArticleViewHref({ id: 'art-2', slug: null, status: 'PUBLISHED' })).toBe(
      '/preview-article/art-2',
    );
    expect(getArticleViewHref({ id: 'art-2', status: 'PUBLISHED' })).toBe(
      '/preview-article/art-2',
    );
  });

  test('non-published statuses use preview route', () => {
    expect(getArticleViewHref({ id: 'art-3', slug: 'draft-slug', status: 'DRAFT' })).toBe(
      '/preview-article/art-3',
    );
    expect(
      getArticleViewHref({ id: 'art-4', slug: 'pending-slug', status: 'PENDING_REVIEW' }),
    ).toBe('/preview-article/art-4');
    expect(getArticleViewHref({ id: 'art-5', slug: 'rej-slug', status: 'REJECTED' })).toBe(
      '/preview-article/art-5',
    );
  });
});

describe('isArticleLiveView', () => {
  test('true only for PUBLISHED with slug', () => {
    expect(isArticleLiveView({ id: 'a', slug: 'x', status: 'PUBLISHED' })).toBe(true);
    expect(isArticleLiveView({ id: 'a', slug: null, status: 'PUBLISHED' })).toBe(false);
    expect(isArticleLiveView({ id: 'a', slug: 'x', status: 'DRAFT' })).toBe(false);
  });
});

describe('getArticleViewLabel', () => {
  test('public label for live articles', () => {
    expect(getArticleViewLabel({ id: 'a', slug: 'x', status: 'PUBLISHED' })).toBe('Lihat di Situs');
  });

  test('preview label for non-live articles', () => {
    expect(getArticleViewLabel({ id: 'a', slug: 'x', status: 'DRAFT' })).toBe('Pratinjau');
    expect(getArticleViewLabel({ id: 'a', slug: null, status: 'PUBLISHED' })).toBe('Pratinjau');
  });
});
