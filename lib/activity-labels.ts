import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookOpen,
  Bookmark,
  LogIn,
  MessageSquare,
  Share2,
  Zap,
} from 'lucide-react';

export const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  article_read: BookOpen,
  article_bookmarked: Bookmark,
  quiz_completed: Zap,
  quiz_correct_answer: Award,
  poll_voted: MessageSquare,
  comment_created: MessageSquare,
  daily_login: LogIn,
  article_shared: Share2,
};

export const ACTIVITY_LABELS: Record<string, string> = {
  article_read: 'Baca Artikel',
  article_bookmarked: 'Artikel di-Bookmark',
  quiz_completed: 'Kuis Selesai',
  quiz_correct_answer: 'Jawaban Benar Kuis',
  poll_voted: 'Vote di Polling',
  comment_created: 'Komentar',
  daily_login: 'Login Harian',
  article_shared: 'Artikel Dibagikan',
};

export function getActivityLabel(activityType: string, description?: string | null): string {
  if (description?.trim()) return description.trim();
  const baseType = activityType.replace(/_\d+$/, '');
  return ACTIVITY_LABELS[baseType] ?? activityType;
}

export function getActivityIcon(activityType: string): LucideIcon {
  const baseType = activityType.replace(/_\d+$/, '');
  return ACTIVITY_ICONS[baseType] ?? Award;
}
