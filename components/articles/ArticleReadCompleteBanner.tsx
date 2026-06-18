import { Award } from "lucide-react";

export default function ArticleReadCompleteBanner() {
  return (
    <div
      className="mt-8 p-4 bg-jepang-red text-white flex items-center gap-3"
      data-testid="read-complete-banner"
    >
      <Award size={20} strokeWidth={1.5} />
      <p className="text-xs font-semibold uppercase tracking-[0.2em]">
        +2 POIN DIBERIKAN UNTUK MEMBACA
      </p>
    </div>
  );
}
