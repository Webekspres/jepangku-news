import type { EmailTemplateId, EmailTemplatePayload } from '@/lib/email/types';
import { SITE_BRAND_NAME } from '@/lib/site-config';
import { toAbsoluteUrl } from '@/lib/site-url';

export type EmailTemplateVariable = {
  key: string;
  label: string;
  description: string;
};

export type EmailTemplateDefaultConfig = {
  subject: string;
  heading: string;
  bodyHtml: string;
  ctaLabel: string;
};

export type EmailTemplateDefinition = {
  id: EmailTemplateId;
  label: string;
  description: string;
  category: 'Artikel' | 'Kontributor' | 'Akun' | 'Newsletter';
  variables: EmailTemplateVariable[];
  defaultConfig: EmailTemplateDefaultConfig;
  samplePayload: EmailTemplatePayload[EmailTemplateId];
  resolveCtaUrl: (payload: EmailTemplatePayload[EmailTemplateId]) => string;
};

const SAMPLE = {
  userName: 'Budi Santoso',
  articleTitle: 'Panduan Membuat Onigiri di Rumah',
  note: 'Perbaiki paragraf pembuka dan tambahkan sumber referensi.',
  adminNote: 'Portofolio bagus — silakan mulai menulis artikel budaya.',
  previewUrl: '/preview-article/sample-id',
  articleUrl: '/articles/panduan-membuat-onigiri',
  submitUrl: '/submit-article',
  applyUrl: '/contributor/apply',
  homeUrl: '/',
  leaderboardUrl: '/leaderboard',
  unsubscribeUrl: '/newsletter/unsubscribe?token=sample-token',
  excerpt:
    'Onigiri adalah makanan praktis yang mudah dibuat. Artikel ini membahas bahan, bentuk, dan tips penyimpanan.',
  coverImageUrl: 'https://placehold.co/512x288/e5e7eb/1a1a2e?text=Cover+Artikel',
  categoryName: 'Kuliner',
} as const;

export const EMAIL_TEMPLATE_IDS = [
  'welcome_user',
  'article_approved',
  'article_rejected',
  'contributor_approved',
  'contributor_rejected',
  'newsletter_subscribed',
  'newsletter_new_article',
] as const satisfies readonly EmailTemplateId[];

export const EMAIL_TEMPLATE_DEFINITIONS: Record<EmailTemplateId, EmailTemplateDefinition> = {
  welcome_user: {
    id: 'welcome_user',
    label: 'Selamat Datang',
    description: 'Dikirim saat user baru mendaftar via Clerk.',
    category: 'Akun',
    variables: [
      { key: 'userName', label: 'Nama user', description: 'Nama tampilan penerima' },
      { key: 'homeUrl', label: 'URL beranda', description: 'Link ke homepage' },
      { key: 'leaderboardUrl', label: 'URL leaderboard', description: 'Link ke halaman leaderboard' },
    ],
    defaultConfig: {
      subject: `Selamat datang di ${SITE_BRAND_NAME}!`,
      heading: 'Halo, {{userName}}!',
      bodyHtml: `<p>Terima kasih sudah bergabung di ${SITE_BRAND_NAME}.</p><p>Baca artikel, kumpulkan poin, ikuti kuis &amp; polling, dan jelajahi komunitas pecinta Jepang.</p>`,
      ctaLabel: 'Mulai jelajah',
    },
    samplePayload: {
      userName: SAMPLE.userName,
      homeUrl: SAMPLE.homeUrl,
      leaderboardUrl: SAMPLE.leaderboardUrl,
    },
    resolveCtaUrl: (p) => toAbsoluteUrl((p as EmailTemplatePayload['welcome_user']).homeUrl),
  },
  article_approved: {
    id: 'article_approved',
    label: 'Artikel Disetujui',
    description: 'Dikirim ke penulis saat artikel dipublikasikan.',
    category: 'Artikel',
    variables: [
      { key: 'userName', label: 'Nama penulis', description: 'Nama penulis artikel' },
      { key: 'articleTitle', label: 'Judul artikel', description: 'Judul artikel yang dipublikasikan' },
      { key: 'articleUrl', label: 'URL artikel', description: 'Link publik artikel' },
    ],
    defaultConfig: {
      subject: 'Artikel dipublikasikan: {{articleTitle}}',
      heading: 'Artikel Anda telah dipublikasikan!',
      bodyHtml:
        '<p>Halo {{userName}},</p><p>Artikel <strong>{{articleTitle}}</strong> telah disetujui dan sudah tersedia untuk pembaca.</p>',
      ctaLabel: 'Baca artikel',
    },
    samplePayload: {
      userName: SAMPLE.userName,
      articleTitle: SAMPLE.articleTitle,
      articleUrl: toAbsoluteUrl(SAMPLE.articleUrl),
    },
    resolveCtaUrl: (p) => (p as EmailTemplatePayload['article_approved']).articleUrl,
  },
  article_rejected: {
    id: 'article_rejected',
    label: 'Artikel Ditolak',
    description: 'Dikirim ke penulis saat artikel ditolak admin.',
    category: 'Artikel',
    variables: [
      { key: 'userName', label: 'Nama penulis', description: 'Nama penulis artikel' },
      { key: 'articleTitle', label: 'Judul artikel', description: 'Judul artikel yang ditolak' },
      { key: 'note', label: 'Catatan editor', description: 'Alasan / catatan penolakan (bisa kosong)' },
      { key: 'previewUrl', label: 'URL pratinjau', description: 'Link pratinjau artikel untuk penulis' },
    ],
    defaultConfig: {
      subject: 'Artikel ditolak: {{articleTitle}}',
      heading: 'Artikel Anda perlu perbaikan',
      bodyHtml:
        '<p>Halo {{userName}},</p><p>Artikel <strong>{{articleTitle}}</strong> belum dapat dipublikasikan.</p><p><strong>Catatan editor:</strong> {{note}}</p>',
      ctaLabel: 'Buka pratinjau artikel',
    },
    samplePayload: {
      userName: SAMPLE.userName,
      articleTitle: SAMPLE.articleTitle,
      note: SAMPLE.note,
      previewUrl: toAbsoluteUrl(SAMPLE.previewUrl),
    },
    resolveCtaUrl: (p) => (p as EmailTemplatePayload['article_rejected']).previewUrl,
  },
  contributor_approved: {
    id: 'contributor_approved',
    label: 'Kontributor Disetujui',
    description: 'Dikirim saat lamaran kontributor disetujui.',
    category: 'Kontributor',
    variables: [
      { key: 'userName', label: 'Nama pelamar', description: 'Nama user yang melamar' },
      { key: 'adminNote', label: 'Catatan admin', description: 'Catatan opsional dari admin' },
      { key: 'submitUrl', label: 'URL submit artikel', description: 'Link halaman tulis artikel' },
    ],
    defaultConfig: {
      subject: `Lamaran kontributor disetujui — ${SITE_BRAND_NAME}`,
      heading: 'Selamat, Anda kini kontributor!',
      bodyHtml:
        '<p>Halo {{userName}},</p><p>Lamaran kontributor Anda disetujui. Anda sudah dapat menulis dan mengirim artikel.</p><p><strong>Catatan:</strong> {{adminNote}}</p>',
      ctaLabel: 'Tulis artikel',
    },
    samplePayload: {
      userName: SAMPLE.userName,
      adminNote: SAMPLE.adminNote,
      submitUrl: SAMPLE.submitUrl,
    },
    resolveCtaUrl: (p) => toAbsoluteUrl((p as EmailTemplatePayload['contributor_approved']).submitUrl),
  },
  contributor_rejected: {
    id: 'contributor_rejected',
    label: 'Kontributor Ditolak',
    description: 'Dikirim saat lamaran kontributor ditolak.',
    category: 'Kontributor',
    variables: [
      { key: 'userName', label: 'Nama pelamar', description: 'Nama user yang melamar' },
      { key: 'adminNote', label: 'Catatan admin', description: 'Alasan penolakan' },
      { key: 'applyUrl', label: 'URL apply ulang', description: 'Link halaman apply kontributor' },
    ],
    defaultConfig: {
      subject: `Update lamaran kontributor — ${SITE_BRAND_NAME}`,
      heading: 'Lamaran kontributor belum disetujui',
      bodyHtml:
        '<p>Halo {{userName}},</p><p>Lamaran kontributor Anda belum dapat disetujui saat ini.</p><p><strong>Catatan:</strong> {{adminNote}}</p>',
      ctaLabel: 'Ajukan ulang',
    },
    samplePayload: {
      userName: SAMPLE.userName,
      adminNote: SAMPLE.adminNote,
      applyUrl: SAMPLE.applyUrl,
    },
    resolveCtaUrl: (p) => toAbsoluteUrl((p as EmailTemplatePayload['contributor_rejected']).applyUrl),
  },
  newsletter_subscribed: {
    id: 'newsletter_subscribed',
    label: 'Konfirmasi Newsletter',
    description: 'Dikirim saat user/guest berlangganan newsletter.',
    category: 'Newsletter',
    variables: [
      { key: 'userName', label: 'Nama penerima', description: 'Nama dari email atau profil' },
      { key: 'homeUrl', label: 'URL beranda', description: 'Link ke homepage' },
      { key: 'unsubscribeUrl', label: 'URL unsubscribe', description: 'Link berhenti berlangganan' },
    ],
    defaultConfig: {
      subject: `Anda berlangganan newsletter ${SITE_BRAND_NAME}`,
      heading: 'Terima kasih sudah berlangganan!',
      bodyHtml: `<p>Halo {{userName}},</p><p>Anda akan menerima update artikel, kuis, dan highlight terbaru dari ${SITE_BRAND_NAME}.</p><p style="font-size:12px;color:#9ca3af;margin-top:16px;">Tidak ingin menerima email ini? <a href="{{unsubscribeUrl}}" style="color:#FF4B2B;">Berhenti berlangganan</a></p>`,
      ctaLabel: 'Jelajahi Jepangku',
    },
    samplePayload: {
      userName: SAMPLE.userName,
      homeUrl: SAMPLE.homeUrl,
      unsubscribeUrl: toAbsoluteUrl(SAMPLE.unsubscribeUrl),
    },
    resolveCtaUrl: (p) => toAbsoluteUrl((p as EmailTemplatePayload['newsletter_subscribed']).homeUrl),
  },
  newsletter_new_article: {
    id: 'newsletter_new_article',
    label: 'Artikel Baru (Newsletter)',
    description: 'Dikirim ke semua subscriber saat artikel baru dipublikasikan.',
    category: 'Newsletter',
    variables: [
      { key: 'userName', label: 'Nama subscriber', description: 'Nama dari email subscriber' },
      { key: 'articleTitle', label: 'Judul artikel', description: 'Judul artikel baru' },
      { key: 'excerpt', label: 'Ringkasan', description: 'Excerpt atau ringkasan artikel' },
      { key: 'categoryName', label: 'Nama kategori', description: 'Kategori artikel (bisa kosong)' },
      { key: 'coverImageUrl', label: 'URL cover', description: 'URL gambar cover (bisa kosong)' },
      { key: 'articleUrl', label: 'URL artikel', description: 'Link baca artikel' },
      { key: 'unsubscribeUrl', label: 'URL unsubscribe', description: 'Link berhenti berlangganan' },
    ],
    defaultConfig: {
      subject: 'Artikel baru: {{articleTitle}}',
      heading: '{{articleTitle}}',
      bodyHtml:
        '<p>Halo {{userName}},</p><p style="font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.08em;color:#FF4B2B;">{{categoryName}}</p><p><img src="{{coverImageUrl}}" alt="" width="512" style="max-width:100%;height:auto;border-radius:8px;" /></p><p>{{excerpt}}</p><p style="font-size:12px;color:#9ca3af;margin-top:16px;"><a href="{{unsubscribeUrl}}" style="color:#FF4B2B;">Berhenti berlangganan newsletter</a></p>',
      ctaLabel: 'Baca artikel',
    },
    samplePayload: {
      userName: SAMPLE.userName,
      articleTitle: SAMPLE.articleTitle,
      excerpt: SAMPLE.excerpt,
      articleUrl: toAbsoluteUrl(SAMPLE.articleUrl),
      unsubscribeUrl: toAbsoluteUrl(SAMPLE.unsubscribeUrl),
      coverImageUrl: SAMPLE.coverImageUrl,
      categoryName: SAMPLE.categoryName,
    },
    resolveCtaUrl: (p) => (p as EmailTemplatePayload['newsletter_new_article']).articleUrl,
  },
};

export function isEmailTemplateId(value: string): value is EmailTemplateId {
  return (EMAIL_TEMPLATE_IDS as readonly string[]).includes(value);
}

export function getEmailTemplateDefinition(templateId: EmailTemplateId): EmailTemplateDefinition {
  return EMAIL_TEMPLATE_DEFINITIONS[templateId];
}
