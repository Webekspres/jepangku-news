import {
  getArticleTimingDisplay,
  type ArticleTimingInput,
} from '@/lib/articles/format-published-date';
import { cn } from '@/lib/utils';

type ArticleTableTimingCellProps = {
  article: ArticleTimingInput;
  className?: string;
};

const KIND_CLASS: Record<string, string> = {
  published: 'text-foreground',
  scheduled: 'text-amber-700',
  submitted: 'text-jepang-muted',
  none: 'text-jepang-muted',
};

export default function ArticleTableTimingCell({
  article,
  className,
}: ArticleTableTimingCellProps) {
  const timing = getArticleTimingDisplay(article);

  if (timing.kind === 'none') {
    return (
      <span className={cn('font-mono text-xs text-jepang-muted', className)}>—</span>
    );
  }

  return (
    <div className={cn('min-w-38 max-w-44', className)}>
      <p
        className={cn(
          'text-[10px] font-mono uppercase tracking-wider',
          KIND_CLASS[timing.kind],
        )}
      >
        {timing.label}
      </p>
      <p className="mt-0.5 font-mono text-[11px] leading-snug text-jepang-muted">
        {timing.compact}
      </p>
    </div>
  );
}
