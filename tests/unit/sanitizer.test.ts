import { describe, expect, test } from 'bun:test';
import {
  sanitizeHtmlContent,
  sanitizeMediaUrl,
  sanitizePlainField,
  sanitizeQuestionBundle,
  sanitizeText,
} from '@/lib/sanitizer';

const XSS_PAYLOADS = [
  '<script>alert("xss")</script><p>safe</p>',
  '<img src=x onerror="alert(1)">',
  '<a href="javascript:alert(1)">click</a>',
  '<div onclick="alert(1)">hover</div>',
  '<iframe src="https://evil.com"></iframe>',
  '<svg onload="alert(1)"><circle /></svg>',
  '<<script>script>alert(1)<</script>/script>',
  '<p style="background:url(javascript:alert(1))">text</p>',
];

describe('sanitizeText', () => {
  test('strips all HTML tags', () => {
    expect(sanitizeText('<b>hello</b> <i>world</i>')).toBe('hello world');
  });

  test('decodes HTML entities safely', () => {
    expect(sanitizeText('hello &amp; world')).toBe('hello & world');
    expect(sanitizeText('foo &amp;amp; bar')).toBe('foo &amp; bar');
  });

  for (const payload of XSS_PAYLOADS) {
    test(`neutralizes XSS payload: ${payload.slice(0, 40)}`, () => {
      const result = sanitizeText(payload);
      expect(result).not.toMatch(/<script/i);
      expect(result).not.toMatch(/onerror/i);
      expect(result).not.toMatch(/javascript:/i);
      expect(result).not.toMatch(/onclick/i);
    });
  }
});

describe('sanitizePlainField', () => {
  test('trims and limits length', () => {
    expect(sanitizePlainField('  <b>hi</b>  ', 10)).toBe('hi');
    expect(sanitizePlainField('a'.repeat(20), 5)).toBe('aaaaa');
  });

  test('handles nullish values', () => {
    expect(sanitizePlainField(null)).toBe('');
    expect(sanitizePlainField(undefined)).toBe('');
  });
});

describe('sanitizeMediaUrl', () => {
  test('accepts http and https URLs', () => {
    expect(sanitizeMediaUrl('https://cdn.example.com/img.png')).toBe(
      'https://cdn.example.com/img.png',
    );
    expect(sanitizeMediaUrl('http://localhost/img.jpg')).toBe('http://localhost/img.jpg');
  });

  test('rejects javascript, data, and invalid URLs', () => {
    expect(sanitizeMediaUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeMediaUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(sanitizeMediaUrl('not-a-url')).toBeNull();
    expect(sanitizeMediaUrl('')).toBeNull();
    expect(sanitizeMediaUrl(null)).toBeNull();
  });

  test('strips HTML from URL strings', () => {
    expect(sanitizeMediaUrl('<script>alert(1)</script>https://ok.com/a.png')).toBe(
      'https://ok.com/a.png',
    );
  });
});

describe('sanitizeHtmlContent', () => {
  for (const payload of XSS_PAYLOADS) {
    test(`removes dangerous markup from: ${payload.slice(0, 40)}`, () => {
      const result = sanitizeHtmlContent(payload);
      expect(result).not.toMatch(/<script/i);
      expect(result).not.toMatch(/<iframe/i);
      expect(result).not.toMatch(/onerror=/i);
      expect(result).not.toMatch(/javascript:/i);
    });
  }

  test('preserves safe article markup', () => {
    const html = '<p>Hello <strong>world</strong></p><ul><li>one</li></ul>';
    expect(sanitizeHtmlContent(html)).toContain('<p>');
    expect(sanitizeHtmlContent(html)).toContain('<strong>');
    expect(sanitizeHtmlContent(html)).toContain('<ul>');
  });

  test('adds rel and target on links', () => {
    const result = sanitizeHtmlContent('<a href="https://example.com">link</a>');
    expect(result).toContain('rel="nofollow noreferrer noopener"');
    expect(result).toContain('target="_blank"');
  });

  test('blocks javascript: link schemes', () => {
    const result = sanitizeHtmlContent('<a href="javascript:alert(1)">bad</a>');
    expect(result).not.toContain('javascript:');
  });

  test('enriches images with lazy loading defaults', () => {
    const result = sanitizeHtmlContent('<img src="https://cdn.example.com/a.jpg" alt="a">');
    expect(result).toContain('loading="lazy"');
    expect(result).toContain('article-inline-image');
  });

  test('wraps figures with article classes', () => {
    const result = sanitizeHtmlContent('<figure><figcaption>cap</figcaption></figure>');
    expect(result).toContain('article-figure');
    expect(result).toContain('article-figure-caption');
  });
});

describe('sanitizeQuestionBundle', () => {
  test('sanitizes camelCase and snake_case question fields', () => {
    const result = sanitizeQuestionBundle([
      {
        question_text: '<script>x</script>Pertanyaan?',
        image_url: 'javascript:alert(1)',
        sort_order: 2,
        options: [
          {
            option_text: '<b>A</b>',
            image_url: 'https://cdn.example.com/o.png',
            is_correct: true,
          },
        ],
      },
    ]);

    expect(result[0].questionText).toBe('Pertanyaan?');
    expect(result[0].imageUrl).toBeNull();
    expect(result[0].sortOrder).toBe(2);
    expect(result[0].options[0].optionText).toBe('A');
    expect(result[0].options[0].imageUrl).toBe('https://cdn.example.com/o.png');
    expect(result[0].options[0].isCorrect).toBe(true);
  });

  test('defaults sort order from array index', () => {
    const result = sanitizeQuestionBundle([{ questionText: 'Q1', options: [{ optionText: 'O1' }] }]);
    expect(result[0].sortOrder).toBe(0);
    expect(result[0].options[0].sortOrder).toBe(0);
  });
});
