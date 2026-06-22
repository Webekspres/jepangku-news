import { beforeEach, describe, expect, mock, test } from 'bun:test';

const mockQueueEmail = mock(async () => undefined);

mock.module('@/lib/newsletter/email', () => ({
  queueNewsletterConfirmEmail: mockQueueEmail,
}));

const mockFindUnique = mock(() => Promise.resolve(null));
const mockCreate = mock(() => Promise.resolve({ id: 'sub-1', email: 'a@b.com', unsubscribeToken: 'tok', userId: null }));
const mockUpdate = mock(() => Promise.resolve({ id: 'sub-1', email: 'a@b.com', unsubscribeToken: 'tok', userId: null }));

mock.module('@/lib/db', () => ({
  db: {
    newsletterSubscription: {
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

const {
  displayNameFromEmail,
  isValidNewsletterEmail,
  normalizeNewsletterEmail,
  subscribeToNewsletter,
} = await import('@/lib/newsletter');

describe('normalizeNewsletterEmail', () => {
  test('trims and lowercases', () => {
    expect(normalizeNewsletterEmail('  User@Example.COM  ')).toBe('user@example.com');
  });
});

describe('isValidNewsletterEmail', () => {
  test('accepts standard addresses', () => {
    expect(isValidNewsletterEmail('reader@jepangku.id')).toBe(true);
    expect(isValidNewsletterEmail('name+tag@domain.co.id')).toBe(true);
  });

  test('rejects invalid formats', () => {
    expect(isValidNewsletterEmail('not-an-email')).toBe(false);
    expect(isValidNewsletterEmail('@missing-local.com')).toBe(false);
    expect(isValidNewsletterEmail('missing-at.com')).toBe(false);
  });

  test('rejects emails over 320 characters', () => {
    const longLocal = 'a'.repeat(315);
    expect(isValidNewsletterEmail(`${longLocal}@x.com`)).toBe(false);
  });
});

describe('displayNameFromEmail', () => {
  test('derives readable name from local part', () => {
    expect(displayNameFromEmail('budi.santoso@mail.com')).toBe('budi santoso');
    expect(displayNameFromEmail('user_name-test@x.com')).toBe('user name test');
  });

  test('falls back to Pembaca for empty local part', () => {
    expect(displayNameFromEmail('@domain.com')).toBe('Pembaca');
  });
});

describe('subscribeToNewsletter', () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockQueueEmail.mockClear();
  });

  test('returns alreadySubscribed for active duplicate email', async () => {
    mockFindUnique.mockImplementation(() =>
      Promise.resolve({ id: 'sub-existing', isActive: true, email: 'dup@x.com' }),
    );

    const result = await subscribeToNewsletter('  DUP@x.com  ');

    expect(result).toEqual({ ok: true, alreadySubscribed: true });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'dup@x.com' } });
  });

  test('reactivates inactive subscription', async () => {
    mockFindUnique.mockImplementation(() =>
      Promise.resolve({
        id: 'sub-old',
        isActive: false,
        email: 'old@x.com',
        userId: 'user-1',
        unsubscribeToken: 'tok-old',
      }),
    );
    mockUpdate.mockImplementation(() =>
      Promise.resolve({
        id: 'sub-old',
        email: 'old@x.com',
        unsubscribeToken: 'tok-old',
        userId: 'user-2',
      }),
    );

    const result = await subscribeToNewsletter('old@x.com', 'user-2');

    expect(result).toEqual({ ok: true, alreadySubscribed: false });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-old' },
        data: expect.objectContaining({ isActive: true, userId: 'user-2' }),
      }),
    );
    expect(mockQueueEmail).toHaveBeenCalled();
  });

  test('creates new subscription when email not found', async () => {
    mockFindUnique.mockImplementation(() => Promise.resolve(null));
    mockCreate.mockImplementation(() =>
      Promise.resolve({
        id: 'sub-new',
        email: 'new@x.com',
        unsubscribeToken: 'tok-new',
        userId: null,
      }),
    );

    const result = await subscribeToNewsletter('new@x.com');

    expect(result).toEqual({ ok: true, alreadySubscribed: false });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'new@x.com' }),
      }),
    );
    expect(mockQueueEmail).toHaveBeenCalled();
  });
});
