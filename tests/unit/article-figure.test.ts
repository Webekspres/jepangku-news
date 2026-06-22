import { describe, expect, test } from 'bun:test';
import { ArticleFigure } from '@/lib/tiptap/article-figure';

describe('ArticleFigure — §19.4 rich text image embed', () => {
  test('renders figure with lazy-loaded img and optional caption', () => {
    const extension = ArticleFigure;
    const render = extension.config.renderHTML?.({
      HTMLAttributes: {
        src: 'https://cdn.example.com/article.webp',
        alt: 'Foto artikel',
        caption: 'Sumber: Kyodo News',
      },
      node: {} as never,
    });

    expect(render).toEqual([
      'figure',
      { class: 'article-figure' },
      [
        'img',
        expect.objectContaining({
          src: 'https://cdn.example.com/article.webp',
          alt: 'Foto artikel',
          loading: 'lazy',
          decoding: 'async',
          class: 'article-inline-image',
        }),
      ],
      [
        'figcaption',
        { class: 'article-figure-caption' },
        'Sumber: Kyodo News',
      ],
    ]);
  });

  test('parseHTML rule targets figure.article-figure', () => {
    const rules = ArticleFigure.config.parseHTML?.();
    expect(rules?.length).toBeGreaterThan(0);
    expect(rules?.[0]?.tag).toBe('figure.article-figure');

    const rule = rules![0];
    const mockFigure = {
      querySelector(sel: string) {
        if (sel === 'img') {
          return { getAttribute: (name: string) => (name === 'src' ? 'https://cdn.example.com/x.png' : name === 'alt' ? 'Alt text' : null) };
        }
        if (sel === 'figcaption') {
          return { textContent: 'Caption here' };
        }
        return null;
      },
    };
    const attrs =
      typeof rule.getAttrs === 'function' ? rule.getAttrs(mockFigure as HTMLElement) : null;
    expect(attrs).toEqual({
      src: 'https://cdn.example.com/x.png',
      alt: 'Alt text',
      caption: 'Caption here',
    });
  });
});
