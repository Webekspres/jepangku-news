export const AD_SLOT_POSITIONS = [
  { value: "center", label: "Tengah — Homepage (antara TV & LMS)" },
  { value: "sidebar", label: "Sidebar — semua halaman" },
] as const;

export type AdSlotPosition = (typeof AD_SLOT_POSITIONS)[number]["value"];

/** Posisi lama (sebelum konsolidasi) → kanonik. Dipakai agar baris DB lama
 *  tetap tampil tanpa perlu migrasi data. */
const LEGACY_POSITION_MAP: Record<string, AdSlotPosition> = {
  "homepage-mid": "center",
  "homepage-sidebar": "sidebar",
  "article-sidebar": "sidebar",
};

export function normalizeAdPosition(value: string): AdSlotPosition {
  if (value === "center" || value === "sidebar") return value;
  return LEGACY_POSITION_MAP[value] ?? "center";
}

/** Semua nilai `position` di DB (kanonik + legacy) yang termasuk satu slot. */
export function adPositionDbValues(position: string): string[] {
  const canonical = normalizeAdPosition(position);
  const legacy = Object.entries(LEGACY_POSITION_MAP)
    .filter(([, mapped]) => mapped === canonical)
    .map(([legacyKey]) => legacyKey);
  return [canonical, ...legacy];
}

export function isValidAdSlotPosition(value: string): value is AdSlotPosition {
  return value === "center" || value === "sidebar";
}

export function getAdSlotLabel(position: string): string {
  const canonical = normalizeAdPosition(position);
  return (
    AD_SLOT_POSITIONS.find((slot) => slot.value === canonical)?.label ?? position
  );
}
