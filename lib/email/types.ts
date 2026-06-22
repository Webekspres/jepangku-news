export type EmailTemplateId =
  | 'article_rejected'
  | 'article_approved'
  | 'contributor_approved'
  | 'contributor_rejected'
  | 'welcome_user'
  | 'newsletter_subscribed'
  | 'newsletter_new_article';

export type EmailTemplatePayload = {
  article_rejected: {
    userName: string;
    articleTitle: string;
    note: string | null;
    previewUrl: string;
  };
  article_approved: {
    userName: string;
    articleTitle: string;
    articleUrl: string;
  };
  contributor_approved: {
    userName: string;
    adminNote: string | null;
    submitUrl: string;
  };
  contributor_rejected: {
    userName: string;
    adminNote: string | null;
    applyUrl: string;
  };
  welcome_user: {
    userName: string;
    homeUrl: string;
    leaderboardUrl: string;
  };
  newsletter_subscribed: {
    userName: string;
    homeUrl: string;
    unsubscribeUrl: string;
  };
  newsletter_new_article: {
    userName: string;
    articleTitle: string;
    excerpt: string;
    articleUrl: string;
    unsubscribeUrl: string;
    coverImageUrl: string | null;
    categoryName: string | null;
  };
};

export type QueueEmailInput<T extends EmailTemplateId = EmailTemplateId> = {
  userId: string;
  toEmail: string;
  template: T;
  subject: string;
  payload: EmailTemplatePayload[T];
  dedupeKey?: string | null;
};
