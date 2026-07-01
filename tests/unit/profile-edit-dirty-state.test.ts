import { describe, expect, it } from 'bun:test';
import { shouldApplyProfileSnapshot } from '../../lib/profile-form-state';

describe('shouldApplyProfileSnapshot', () => {
  it('applies the initial profile snapshot when the form is still pristine', () => {
    const currentForm = {
      name: '',
      username: '',
      displayName: '',
      bio: '',
      avatarUrl: '',
    };

    const incoming = {
      name: 'Budi',
      username: 'budi',
      displayName: 'Budi',
      bio: 'Halo',
      avatarUrl: '',
    };

    expect(shouldApplyProfileSnapshot(incoming, false, currentForm)).toBe(true);
  });

  it('does not overwrite a form that the user has already edited', () => {
    const currentForm = {
      name: 'Budi',
      username: 'budi',
      displayName: 'Budi',
      bio: 'Bio yang sedang diedit',
      avatarUrl: '',
    };

    const incoming = {
      name: 'Budi',
      username: 'budi',
      displayName: 'Budi',
      bio: 'Bio lama dari server',
      avatarUrl: '',
    };

    expect(shouldApplyProfileSnapshot(incoming, true, currentForm)).toBe(false);
  });
});
