import type { GamificationPatch } from '@/lib/auth/types';
import type { AwardPointsResult } from '@/lib/points';

export function gamificationFieldsFromAward(
  award: AwardPointsResult,
): { currentPoints: number | null; totalXp: number | null; currentLevel: number | null } {
  return {
    currentPoints: award.currentPoints,
    totalXp: award.totalXp,
    currentLevel: award.currentLevel,
  };
}

export function gamificationPatchFromResponse(data: {
  currentPoints?: number | null;
  totalXp?: number | null;
  currentLevel?: number | null;
}): GamificationPatch | undefined {
  if (data.currentPoints == null) return undefined;
  return {
    totalPoints: data.currentPoints,
    ...(data.totalXp != null ? { totalXp: data.totalXp } : {}),
    ...(data.currentLevel != null ? { currentLevel: data.currentLevel } : {}),
  };
}
