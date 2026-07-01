export interface ProfileFormSnapshot {
  name: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
}

export function shouldApplyProfileSnapshot(
  incoming: Partial<ProfileFormSnapshot>,
  hasUserEditedForm: boolean,
  currentForm: ProfileFormSnapshot,
): boolean {
  if (hasUserEditedForm) {
    return false;
  }

  const hasChanged =
    incoming.name !== currentForm.name ||
    incoming.username !== currentForm.username ||
    incoming.displayName !== currentForm.displayName ||
    incoming.bio !== currentForm.bio ||
    incoming.avatarUrl !== currentForm.avatarUrl;

  return hasChanged;
}
