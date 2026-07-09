import { describe, expect, test } from 'bun:test';
import {
  USER_PORTAL_EDITABLE_STATUSES,
  canEditOnUserPortal,
  getUserPortalSubmitStatuses,
  isAdminAuthor,
  resolveUserPortalSubmitStatus,
  submitSuccessMessage,
  userPortalCreateSubtitle,
  userPortalEditSubtitle,
} from '@/lib/article-workflow';

describe('USER_PORTAL_EDITABLE_STATUSES', () => {
  test('allows DRAFT and REJECTED for user portal editing', () => {
    expect(USER_PORTAL_EDITABLE_STATUSES).toEqual(['DRAFT', 'REJECTED']);
  });
});

describe('isAdminAuthor', () => {
  test('true for ADMIN role', () => {
    expect(isAdminAuthor({ role: 'ADMIN' })).toBe(true);
  });

  test('false for CONTRIBUTOR, USER, and null', () => {
    expect(isAdminAuthor({ role: 'CONTRIBUTOR' })).toBe(false);
    expect(isAdminAuthor({ role: 'USER' })).toBe(false);
    expect(isAdminAuthor(null)).toBe(false);
    expect(isAdminAuthor(undefined)).toBe(false);
  });
});

describe('canEditOnUserPortal', () => {
  test('DRAFT and REJECTED are editable', () => {
    expect(canEditOnUserPortal('DRAFT')).toBe(true);
    expect(canEditOnUserPortal('REJECTED')).toBe(true);
  });

  test('PENDING_REVIEW and PUBLISHED are not editable on user portal', () => {
    expect(canEditOnUserPortal('PENDING_REVIEW')).toBe(false);
    expect(canEditOnUserPortal('PUBLISHED')).toBe(false);
    expect(canEditOnUserPortal('SCHEDULED')).toBe(false);
  });
});

describe('workflow transitions DRAFT → PENDING → PUBLISHED/REJECTED', () => {
  test('contributor submits DRAFT → PENDING_REVIEW', () => {
    const allowed = getUserPortalSubmitStatuses(false);
    expect(allowed).toEqual(['DRAFT', 'PENDING_REVIEW']);
    expect(resolveUserPortalSubmitStatus('PENDING_REVIEW', false)).toBe('PENDING_REVIEW');
    expect(submitSuccessMessage('PENDING_REVIEW', false)).toBe(
      'Artikel berhasil dikirim untuk direview',
    );
  });

  test('contributor cannot directly publish from portal', () => {
    expect(resolveUserPortalSubmitStatus('PUBLISHED', false)).toBe('DRAFT');
    expect(getUserPortalSubmitStatuses(false)).not.toContain('PUBLISHED');
  });

  test('admin can submit DRAFT, PUBLISHED, or SCHEDULED (skip review queue)', () => {
    const allowed = getUserPortalSubmitStatuses(true);
    expect(allowed).toEqual(['DRAFT', 'PUBLISHED', 'SCHEDULED']);
    expect(resolveUserPortalSubmitStatus('PUBLISHED', true)).toBe('PUBLISHED');
    expect(resolveUserPortalSubmitStatus('SCHEDULED', true)).toBe('SCHEDULED');
    expect(submitSuccessMessage('PUBLISHED', true)).toBe('Artikel berhasil dipublikasikan');
    expect(submitSuccessMessage('SCHEDULED', true)).toBe('Artikel berhasil dijadwalkan tayang');
  });

  test('invalid submit status falls back to DRAFT', () => {
    expect(resolveUserPortalSubmitStatus('REJECTED', false)).toBe('DRAFT');
    expect(resolveUserPortalSubmitStatus('PENDING_REVIEW', true)).toBe('DRAFT');
    expect(resolveUserPortalSubmitStatus('bogus', false)).toBe('DRAFT');
  });

  test('REJECTED articles remain editable for resubmission', () => {
    expect(canEditOnUserPortal('REJECTED')).toBe(true);
    expect(resolveUserPortalSubmitStatus('PENDING_REVIEW', false)).toBe('PENDING_REVIEW');
  });

  test('draft save message for both roles', () => {
    expect(submitSuccessMessage('DRAFT', false)).toBe('Draft berhasil disimpan');
    expect(submitSuccessMessage('DRAFT', true)).toBe('Draft berhasil disimpan');
  });
});

describe('portal subtitles', () => {
  test('admin vs contributor create copy', () => {
    expect(userPortalCreateSubtitle(true)).toContain('jadwalkan');
    expect(userPortalCreateSubtitle(false)).toContain('direview admin');
  });

  test('admin vs contributor edit copy', () => {
    expect(userPortalEditSubtitle(true)).toContain('jadwalkan');
    expect(userPortalEditSubtitle(false)).toContain('direview ulang');
  });
});
