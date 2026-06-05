import sanitizeHtml from 'sanitize-html';

const allowedTags = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
];

const allowedAttributes: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  '*': ['class'],
};

const allowedSchemes = ['http', 'https', 'mailto', 'tel', 'data'];

export function sanitizeText(input: string) {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

export function sanitizeHtmlContent(input: string) {
  return sanitizeHtml(input, {
    allowedTags,
    allowedAttributes,
    allowedSchemes,
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
      a: ['http', 'https', 'mailto', 'tel'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'nofollow noreferrer noopener', target: '_blank' }),
    },
  });
}
