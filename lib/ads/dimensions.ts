import { normalizeAdPosition, type AdSlotPosition } from '@/lib/ads/constants';

export type AdSlotDimensions = {
  width: number;
  height: number;
  label: string;
};

export const AD_SLOT_DIMENSIONS: Record<AdSlotPosition, AdSlotDimensions> = {
  center: { width: 1200, height: 280, label: 'Tengah' },
  sidebar: { width: 400, height: 360, label: 'Sidebar' },
};

export function getAdSlotDimensions(position: string): AdSlotDimensions {
  return AD_SLOT_DIMENSIONS[normalizeAdPosition(position)];
}

export function getAdSlotAspect(position: string): number {
  const { width, height } = getAdSlotDimensions(position);
  return width / height;
}
