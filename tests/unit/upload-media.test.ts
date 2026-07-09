import { describe, expect, it } from 'bun:test';
import { ARTICLE_IMAGE_MAX_BYTES } from '@/lib/article-form-helpers';
import { stageFile } from '@/lib/upload-media';

describe('stageFile', () => {
  it('rejects files over 5 MB for every upload purpose', () => {
    const file = new File(
      [new ArrayBuffer(ARTICLE_IMAGE_MAX_BYTES + 1)],
      'big-cover.jpg',
      { type: 'image/jpeg' },
    );

    expect(() => stageFile(file, 'cover')).toThrow(/melebihi batas/i);
    expect(() => stageFile(file, 'avatar')).toThrow(/melebihi batas/i);
    expect(() => stageFile(file, 'banner')).toThrow(/melebihi batas/i);
  });

  it('stages valid files under the size limit', () => {
    const file = new File([new ArrayBuffer(1024)], 'ok.jpg', {
      type: 'image/jpeg',
    });

    const stagedUrl = stageFile(file, 'cover');
    expect(stagedUrl.startsWith('blob:')).toBe(true);
  });
});
