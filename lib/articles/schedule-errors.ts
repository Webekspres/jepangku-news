import { ArticleScheduleEnqueueError } from '@/lib/articles/schedule';

export function getArticleScheduleErrorResponse(error: unknown): {
  message: string;
  status: number;
} {
  if (error instanceof ArticleScheduleEnqueueError) {
    return { message: error.message, status: 503 };
  }

  return {
    message: error instanceof Error ? error.message : 'Gagal menjadwalkan artikel',
    status: 500,
  };
}
