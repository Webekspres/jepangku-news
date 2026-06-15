export const AD_SLOT_POSITIONS = [
  { value: "homepage-mid", label: "Homepage — Tengah (antara TV & LMS)" },
  { value: "homepage-sidebar", label: "Homepage — Sidebar (engagement)" },
  { value: "article-sidebar", label: "Artikel — Sidebar kanan" },
] as const;

export type AdSlotPosition = (typeof AD_SLOT_POSITIONS)[number]["value"];

export function isValidAdSlotPosition(value: string): value is AdSlotPosition {
  return AD_SLOT_POSITIONS.some((slot) => slot.value === value);
}

export function getAdSlotLabel(position: string): string {
  return AD_SLOT_POSITIONS.find((slot) => slot.value === position)?.label ?? position;
}
