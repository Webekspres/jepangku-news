import { Node, mergeAttributes } from '@tiptap/core';

export type ArticleFigureAttrs = {
  src: string | null;
  alt: string;
  caption: string;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    articleFigure: {
      insertArticleFigure: (attrs: ArticleFigureAttrs) => ReturnType;
      updateArticleFigure: (attrs: Partial<ArticleFigureAttrs>) => ReturnType;
    };
  }
}

export const ArticleFigure = Node.create({
  name: 'articleFigure',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      caption: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure.article-figure',
        getAttrs: (node) => {
          const el = node as HTMLElement;
          const img = el.querySelector('img');
          const figcaption = el.querySelector('figcaption');
          return {
            src: img?.getAttribute('src') ?? null,
            alt: img?.getAttribute('alt') ?? '',
            caption: figcaption?.textContent?.trim() ?? '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src as string | null;
    const alt = (HTMLAttributes.alt as string) || '';
    const caption = (HTMLAttributes.caption as string) || '';

    const children: (string | [string, Record<string, string>, ...unknown[]])[] = [
      [
        'img',
        mergeAttributes({
          src: src ?? '',
          alt,
          loading: 'lazy',
          decoding: 'async',
          class: 'article-inline-image',
        }),
      ],
    ];

    if (caption) {
      children.push([
        'figcaption',
        { class: 'article-figure-caption' },
        caption,
      ]);
    }

    return ['figure', { class: 'article-figure' }, ...children];
  },

  addCommands() {
    return {
      insertArticleFigure:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
      updateArticleFigure:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
    };
  },
});
