import {
  sanitizeHtmlContent,
  sanitizeMediaUrl,
  sanitizePlainField,
  sanitizeText,
} from './sanitizer';

type StringField = {
  key: string;
  sanitize: (value: string) => string | null;
};

type NullableUrlField = {
  key: string;
  sanitize: (value: string | null) => string | null;
};

export type BackfillTable =
  | 'articles'
  | 'article_revisions'
  | 'comments'
  | 'info_pages'
  | 'quizzes'
  | 'quiz_questions'
  | 'quiz_options'
  | 'polls'
  | 'poll_questions'
  | 'poll_options'
  | 'user_profiles'
  | 'users'
  | 'videos'
  | 'ad_slots';

export const BACKFILL_TABLES: BackfillTable[] = [
  'articles',
  'article_revisions',
  'comments',
  'info_pages',
  'quizzes',
  'quiz_questions',
  'quiz_options',
  'polls',
  'poll_questions',
  'poll_options',
  'user_profiles',
  'users',
  'videos',
  'ad_slots',
];

function plain(maxLen: number) {
  return (value: string) => sanitizePlainField(value, maxLen);
}

function text() {
  return (value: string) => sanitizeText(value);
}

function html() {
  return (value: string) => sanitizeHtmlContent(value);
}

function mediaUrl(value: string | null) {
  return sanitizeMediaUrl(value);
}

function mediaUrlOrPlain(maxLen: number) {
  return (value: string | null) => {
    if (value == null || value === '') return null;
    return sanitizeMediaUrl(value) ?? sanitizePlainField(value, maxLen);
  };
}

export function sanitizeRowFields(
  row: Record<string, unknown>,
  stringFields: StringField[],
  urlFields: NullableUrlField[] = [],
): { changed: boolean; data: Record<string, string | null> } {
  const data: Record<string, string | null> = {};
  let changed = false;

  for (const field of stringFields) {
    const raw = row[field.key];
    if (raw == null) continue;
    const next = field.sanitize(String(raw));
    data[field.key] = next;
    if (next !== String(raw)) changed = true;
  }

  for (const field of urlFields) {
    if (!(field.key in row)) continue;
    const raw = row[field.key] as string | null;
    const next = field.sanitize(raw);
    data[field.key] = next;
    if (next !== raw) changed = true;
  }

  return { changed, data };
}

export const BACKFILL_SPECS: Record<
  BackfillTable,
  { stringFields: StringField[]; urlFields?: NullableUrlField[] }
> = {
  articles: {
    stringFields: [
      { key: 'title', sanitize: text() },
      { key: 'excerpt', sanitize: (v) => (v ? text()(v) : '') },
      { key: 'content', sanitize: html() },
    ],
    urlFields: [{ key: 'coverImageUrl', sanitize: mediaUrl }],
  },
  article_revisions: {
    stringFields: [
      { key: 'title', sanitize: text() },
      { key: 'excerpt', sanitize: (v) => (v ? text()(v) : '') },
      { key: 'content', sanitize: html() },
    ],
    urlFields: [{ key: 'coverImageUrl', sanitize: mediaUrl }],
  },
  comments: {
    stringFields: [{ key: 'content', sanitize: text() }],
  },
  info_pages: {
    stringFields: [
      { key: 'title', sanitize: text() },
      { key: 'subtitle', sanitize: (v) => (v ? text()(v) : '') },
      { key: 'content', sanitize: html() },
      { key: 'metaTitle', sanitize: (v) => (v ? text()(v) : '') },
      { key: 'metaDescription', sanitize: (v) => (v ? text()(v) : '') },
    ],
  },
  quizzes: {
    stringFields: [
      { key: 'title', sanitize: plain(200) },
      { key: 'description', sanitize: (v) => (v ? plain(1000)(v) : '') },
    ],
    urlFields: [{ key: 'thumbnailUrl', sanitize: mediaUrl }],
  },
  quiz_questions: {
    stringFields: [{ key: 'questionText', sanitize: plain(1000) }],
    urlFields: [{ key: 'imageUrl', sanitize: mediaUrl }],
  },
  quiz_options: {
    stringFields: [{ key: 'optionText', sanitize: plain(500) }],
    urlFields: [{ key: 'imageUrl', sanitize: mediaUrl }],
  },
  polls: {
    stringFields: [
      { key: 'title', sanitize: plain(200) },
      { key: 'description', sanitize: (v) => (v ? plain(1000)(v) : '') },
    ],
    urlFields: [{ key: 'thumbnailUrl', sanitize: mediaUrl }],
  },
  poll_questions: {
    stringFields: [{ key: 'questionText', sanitize: plain(1000) }],
    urlFields: [{ key: 'imageUrl', sanitize: mediaUrl }],
  },
  poll_options: {
    stringFields: [{ key: 'optionText', sanitize: plain(500) }],
    urlFields: [{ key: 'imageUrl', sanitize: mediaUrl }],
  },
  user_profiles: {
    stringFields: [
      { key: 'displayName', sanitize: plain(100) },
      { key: 'bio', sanitize: (v) => (v ? plain(300)(v) : '') },
    ],
  },
  users: {
    stringFields: [{ key: 'name', sanitize: plain(100) }],
    urlFields: [{ key: 'avatarUrl', sanitize: mediaUrl }],
  },
  videos: {
    stringFields: [
      { key: 'title', sanitize: plain(200) },
      { key: 'description', sanitize: (v) => (v ? plain(2000)(v) : '') },
    ],
    urlFields: [{ key: 'thumbnailUrl', sanitize: mediaUrl }],
  },
  ad_slots: {
    stringFields: [
      { key: 'title', sanitize: (v) => (v ? plain(200)(v) : '') },
      { key: 'altText', sanitize: (v) => (v ? plain(200)(v) : '') },
    ],
    urlFields: [
      { key: 'imageUrl', sanitize: mediaUrl },
      { key: 'linkUrl', sanitize: mediaUrlOrPlain(500) },
    ],
  },
};
