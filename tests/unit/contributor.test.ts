import { describe, expect, test } from 'bun:test';
import {
  CONTRIBUTOR_APPLY_PATH,
  canCreateArticles,
  getContributorCta,
  isApprovedContributor,
} from '@/lib/contributor';

describe('canCreateArticles', () => {
  test('false for null/undefined guest', () => {
    expect(canCreateArticles(null)).toBe(false);
    expect(canCreateArticles(undefined)).toBe(false);
  });

  test('false for regular USER', () => {
    expect(canCreateArticles({ role: 'USER' })).toBe(false);
    expect(canCreateArticles({ role: 'USER', contributorApplicationStatus: 'PENDING' })).toBe(
      false,
    );
  });

  test('true for CONTRIBUTOR and ADMIN', () => {
    expect(canCreateArticles({ role: 'CONTRIBUTOR' })).toBe(true);
    expect(canCreateArticles({ role: 'ADMIN' })).toBe(true);
  });
});

describe('isApprovedContributor', () => {
  test('mirrors canCreateArticles', () => {
    expect(isApprovedContributor({ role: 'CONTRIBUTOR' })).toBe(true);
    expect(isApprovedContributor({ role: 'USER' })).toBe(false);
  });
});

describe('getContributorCta', () => {
  test('approved contributor sees submit article link', () => {
    expect(getContributorCta({ role: 'CONTRIBUTOR' })).toEqual({
      href: '/submit-article',
      label: 'Buat Artikel',
    });
    expect(getContributorCta({ role: 'ADMIN' })).toEqual({
      href: '/submit-article',
      label: 'Buat Artikel',
    });
  });

  test('pending application shows disabled processing state', () => {
    expect(
      getContributorCta({ role: 'USER', contributorApplicationStatus: 'PENDING' }),
    ).toEqual({
      href: CONTRIBUTOR_APPLY_PATH,
      label: 'Permohonan Diproses',
      disabled: true,
    });
  });

  test('rejected application can re-apply', () => {
    expect(
      getContributorCta({ role: 'USER', contributorApplicationStatus: 'REJECTED' }),
    ).toEqual({
      href: CONTRIBUTOR_APPLY_PATH,
      label: 'Ajukan Ulang Kontributor',
    });
  });

  test('default user is prompted to apply', () => {
    expect(getContributorCta({ role: 'USER' })).toEqual({
      href: CONTRIBUTOR_APPLY_PATH,
      label: 'Daftar sebagai Kontributor',
    });
    expect(getContributorCta(null)).toEqual({
      href: CONTRIBUTOR_APPLY_PATH,
      label: 'Daftar sebagai Kontributor',
    });
  });
});
