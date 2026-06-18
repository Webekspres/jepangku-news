export type EmailTemplateId =
  | 'article_rejected'
  | 'contributor_approved'
  | 'contributor_rejected'
  | 'welcome_user'
  | 'newsletter_subscribed';

export type EmailTemplatePayload = {
  article_rejected: {
    userName: string;
    articleTitle: string;
    note: string | null;
    previewUrl: string;
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
};

export type QueueEmailInput<T extends EmailTemplateId = EmailTemplateId> = {
  userId: string;
  toEmail: string;
  template: T;
  subject: string;
  payload: EmailTemplatePayload[T];
  dedupeKey?: string | null;
};
