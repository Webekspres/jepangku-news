import sanitizeHtml from 'sanitize-html';

const allowedTags = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'figcaption',
  'figure',
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
  img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding', 'class'],
  figure: ['class'],
  figcaption: ['class'],
  '*': ['class'],
};

const allowedSchemes = ['http', 'https', 'mailto', 'tel'];

/** Decode HTML entities umum yang dihasilkan sanitize-html saat allowedTags: [] */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function sanitizeText(input: string) {
  const stripped = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
  return decodeHtmlEntities(stripped);
}

/** Plain text dengan batas panjang — untuk judul, bio, pertanyaan quiz/poll. */
export function sanitizePlainField(value: unknown, maxLen = 500): string {
  return sanitizeText(String(value ?? '')).slice(0, maxLen);
}

/** Hanya terima URL http/https — untuk thumbnail & gambar soal/opsi. */
export function sanitizeMediaUrl(value: unknown): string | null {
  if (value == null || value === '') return null;
  const url = sanitizeText(String(value));
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return url;
  } catch {
    return null;
  }
}

export function sanitizeHtmlContent(input: string) {
  return sanitizeHtml(input, {
    allowedTags,
    allowedAttributes,
    allowedSchemes,
    allowedSchemesByTag: {
      img: ['http', 'https'],
      a: ['http', 'https', 'mailto', 'tel'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'nofollow noreferrer noopener', target: '_blank' }),
      img: (_tagName, attribs) => ({
        tagName: 'img',
        attribs: {
          ...attribs,
          loading: attribs.loading || 'lazy',
          decoding: attribs.decoding || 'async',
          class: attribs.class
            ? `${attribs.class} article-inline-image`
            : 'article-inline-image',
        },
      }),
      figure: sanitizeHtml.simpleTransform('figure', { class: 'article-figure' }),
      figcaption: sanitizeHtml.simpleTransform('figcaption', { class: 'article-figure-caption' }),
    },
  });
}

type QuestionInput = {
  id?: string;
  questionText?: string;
  question_text?: string;
  imageUrl?: string | null;
  image_url?: string | null;
  sortOrder?: number;
  sort_order?: number;
  options?: OptionInput[];
};

type OptionInput = {
  id?: string;
  optionText?: string;
  option_text?: string;
  imageUrl?: string | null;
  image_url?: string | null;
  sortOrder?: number;
  sort_order?: number;
  is_correct?: boolean;
  isCorrect?: boolean;
};

/** Passthrough id eksisting (untuk edit in-place); abaikan nilai non-string/kosong. */
function sanitizeId(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

/** Sanitasi bundle pertanyaan + opsi (mendukung camelCase & snake_case dari builder).
 *  Menyertakan `id` opsional agar route edit bisa update in-place tanpa reset relasi. */
export function sanitizeQuestionBundle(questions: QuestionInput[]) {
  return questions.map((q, qi) => ({
    id: sanitizeId(q.id),
    questionText: sanitizePlainField(q.questionText ?? q.question_text, 1000),
    imageUrl: sanitizeMediaUrl(q.imageUrl ?? q.image_url),
    sortOrder: q.sortOrder ?? q.sort_order ?? qi,
    options: (q.options ?? []).map((o, oi) => ({
      id: sanitizeId(o.id),
      optionText: sanitizePlainField(o.optionText ?? o.option_text, 500),
      imageUrl: sanitizeMediaUrl(o.imageUrl ?? o.image_url),
      sortOrder: o.sortOrder ?? o.sort_order ?? oi,
      isCorrect: Boolean(o.is_correct ?? o.isCorrect),
    })),
  }));
}
