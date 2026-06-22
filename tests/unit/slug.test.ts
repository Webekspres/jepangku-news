import { describe, expect, test } from 'bun:test';
import { createAdminSlug, createSlug } from '@/lib/slug';

describe('createSlug', () => {
  test('lowercases and hyphenates title', () => {
    const slug = createSlug('Hello World Article');
    expect(slug).toMatch(/^hello-world-article-[a-z0-9]+$/);
  });

  test('removes special characters', () => {
    const slug = createSlug('Berita Jepang: 日本語 & More!');
    expect(slug).toMatch(/^berita-jepang-more-[a-z0-9]+$/);
  });

  test('collapses multiple spaces and hyphens', () => {
    const slug = createSlug('foo   bar---baz');
    expect(slug).toMatch(/^foo-bar-baz-[a-z0-9]+$/);
  });

  test('trims leading and trailing hyphens from title portion', () => {
    const slug = createSlug('---hello---');
    expect(slug).toMatch(/^hello-[a-z0-9]+$/);
  });

  test('appends random suffix for uniqueness', () => {
    const a = createSlug('same title');
    const b = createSlug('same title');
    expect(a).not.toBe(b);
    expect(a.split('-').length).toBeGreaterThanOrEqual(3);
  });
});

describe('createAdminSlug', () => {
  test('produces deterministic slug without random suffix', () => {
    expect(createAdminSlug('Admin Category Name')).toBe('admin-category-name');
    expect(createAdminSlug('Admin Category Name')).toBe('admin-category-name');
  });

  test('strips non-alphanumeric characters', () => {
    expect(createAdminSlug('Kategori #1 (Utama)')).toBe('kategori-1-utama');
  });

  test('handles empty-after-sanitize input', () => {
    expect(createAdminSlug('!!!')).toBe('');
  });
});
