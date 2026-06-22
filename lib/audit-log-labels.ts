export const AUDIT_CATEGORIES = {
  article: 'Artikel',
  contributor: 'Kontributor',
  comment: 'Komentar',
  reaction: 'Reaksi',
  poll: 'Polling',
  quiz: 'Kuis',
  bookmark: 'Bookmark',
  share: 'Bagikan',
  user: 'Pengguna',
  category: 'Kategori',
  tag: 'Tag',
  video: 'Video',
  ad: 'Iklan',
  info_page: 'Halaman Info',
  social: 'Media Sosial',
  file: 'File',
  auth: 'Autentikasi',
} as const;

export type AuditCategory = keyof typeof AUDIT_CATEGORIES;

export const AUDIT_CATEGORY_FILTERS = [
  { value: '', label: 'Semua' },
  ...Object.entries(AUDIT_CATEGORIES).map(([value, label]) => ({ value, label })),
];

export const AUDIT_CATEGORY_BADGE: Record<string, string> = {
  article: 'bg-blue-100 text-blue-800',
  contributor: 'bg-purple-100 text-purple-800',
  comment: 'bg-emerald-100 text-emerald-800',
  reaction: 'bg-pink-100 text-pink-800',
  poll: 'bg-amber-100 text-amber-800',
  quiz: 'bg-orange-100 text-orange-800',
  bookmark: 'bg-cyan-100 text-cyan-800',
  share: 'bg-sky-100 text-sky-800',
  user: 'bg-slate-100 text-slate-800',
  category: 'bg-stone-100 text-stone-800',
  tag: 'bg-stone-100 text-stone-800',
  video: 'bg-indigo-100 text-indigo-800',
  ad: 'bg-yellow-100 text-yellow-800',
  info_page: 'bg-teal-100 text-teal-800',
  social: 'bg-violet-100 text-violet-800',
  file: 'bg-gray-100 text-gray-800',
  auth: 'bg-neutral-100 text-neutral-800',
};

const ARTICLE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Menunggu Review',
  PUBLISHED: 'Dipublikasikan',
  REJECTED: 'Ditolak',
  ARCHIVED: 'Diarsipkan',
};

export function formatArticleStatusChange(previous: string, next: string): string {
  const from = ARTICLE_STATUS_LABELS[previous] ?? previous;
  const to = ARTICLE_STATUS_LABELS[next] ?? next;
  return `${from} → ${to}`;
}

const ACTION_LABELS: Record<string, Record<string, string>> = {
  article: {
    create: 'Artikel dibuat',
    update: 'Artikel diperbarui',
    draft_update: 'Draft artikel disimpan',
    delete: 'Artikel dihapus',
    status_change: 'Status artikel diubah',
    approve: 'Artikel disetujui',
    reject: 'Artikel ditolak',
    archive: 'Artikel diarsipkan',
    bulk_approve: 'Artikel disetujui (massal)',
    bulk_reject: 'Artikel ditolak (massal)',
    bulk_archive: 'Artikel diarsipkan (massal)',
    bulk_delete: 'Artikel dihapus (massal)',
    set_featured: 'Artikel ditandai unggulan',
    set_hot: 'Artikel ditandai hot',
    content_revision: 'Konten artikel direvisi',
    share: 'Artikel dibagikan',
    read_complete: 'Artikel selesai dibaca',
  },
  contributor: {
    apply: 'Mengajukan menjadi kontributor',
    approve: 'Permohonan kontributor disetujui',
    reject: 'Permohonan kontributor ditolak',
  },
  comment: {
    create: 'Komentar dibuat',
    update: 'Komentar diperbarui',
    delete: 'Komentar dihapus',
    moderate: 'Komentar dimoderasi',
    hard_delete: 'Komentar dihapus permanen',
  },
  reaction: {
    created: 'Reaksi ditambahkan',
    switched: 'Reaksi diubah',
    removed: 'Reaksi dihapus',
  },
  poll: {
    create: 'Polling dibuat',
    update: 'Polling diperbarui',
    delete: 'Polling dihapus',
    vote: 'Vote polling',
  },
  quiz: {
    create: 'Kuis dibuat',
    update: 'Kuis diperbarui',
    delete: 'Kuis dihapus',
    attempt_submit: 'Kuis diselesaikan',
  },
  bookmark: {
    create: 'Artikel di-bookmark',
    delete: 'Bookmark dihapus',
  },
  share: {
    create: 'Konten dibagikan',
  },
  user: {
    update: 'Pengguna diperbarui',
    profile_update: 'Profil diperbarui',
  },
  category: {
    create: 'Kategori dibuat',
    update: 'Kategori diperbarui',
    delete: 'Kategori dihapus',
  },
  tag: {
    create: 'Tag dibuat',
    delete: 'Tag dihapus',
  },
  video: {
    create: 'Video dibuat',
    update: 'Video diperbarui',
    delete: 'Video dihapus',
  },
  ad: {
    create: 'Iklan dibuat',
    update: 'Iklan diperbarui',
    delete: 'Iklan dihapus',
  },
  info_page: {
    update: 'Halaman info diperbarui',
  },
  social: {
    update: 'Tautan media sosial diperbarui',
  },
  file: {
    upload: 'File diunggah',
  },
  auth: {
    logout: 'Keluar dari sesi',
  },
};

export function getAuditActionLabel(category: string, action: string): string {
  return ACTION_LABELS[category]?.[action] ?? `${category}.${action}`;
}
