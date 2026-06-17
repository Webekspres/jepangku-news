export type RevisionSnapshot = {
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  categoryId: string | null;
  status: string;
};

export type RevisionFieldChange = {
  field: keyof RevisionSnapshot;
  label: string;
  before: string;
  after: string;
};

const FIELD_LABELS: Record<keyof RevisionSnapshot, string> = {
  title: 'Judul',
  excerpt: 'Ringkasan',
  content: 'Konten',
  coverImageUrl: 'Gambar cover',
  categoryId: 'Kategori',
  status: 'Status',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draf',
  PENDING_REVIEW: 'Menunggu Review',
  PUBLISHED: 'Dipublikasikan',
  REJECTED: 'Ditolak',
  ARCHIVED: 'Diarsipkan',
};

function displayValue(field: keyof RevisionSnapshot, value: string | null): string {
  if (value == null || value === '') return '—';
  if (field === 'status') return STATUS_LABELS[value] || value;
  return value;
}

export function diffRevisionSnapshots(
  before: RevisionSnapshot | null,
  after: RevisionSnapshot,
): RevisionFieldChange[] {
  const fields = Object.keys(FIELD_LABELS) as (keyof RevisionSnapshot)[];
  return fields
    .map((field) => {
      const prev = before ? before[field] : null;
      const next = after[field];
      const prevNorm = prev ?? null;
      const nextNorm = next ?? null;
      if (prevNorm === nextNorm) return null;
      return {
        field,
        label: FIELD_LABELS[field],
        before: displayValue(field, prevNorm),
        after: displayValue(field, nextNorm),
      };
    })
    .filter((item): item is RevisionFieldChange => item !== null);
}
