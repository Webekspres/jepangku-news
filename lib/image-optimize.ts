import sharp from 'sharp';

export type ImageOptimizePreset = 'avatar' | 'cover' | 'content' | 'banner';

type PresetConfig = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'webp' | 'jpeg';
};

const PRESETS: Record<ImageOptimizePreset, PresetConfig> = {
  avatar: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 92,
    format: 'jpeg',
  },
  cover: {
    maxWidth: 1600,
    maxHeight: 1200,
    quality: 85,
    format: 'webp',
  },
  content: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 82,
    format: 'webp',
  },
  banner: {
    maxWidth: 1920,
    maxHeight: 576,
    quality: 90,
    format: 'webp',
  },
};

export function parseUploadPurpose(value: unknown): ImageOptimizePreset {
  if (value === 'avatar' || value === 'cover' || value === 'content' || value === 'banner') {
    return value;
  }
  return 'content';
}

/** Resize, strip metadata, and convert to WebP/JPEG — skip animated GIF. */
export async function optimizeImageBuffer(
  buffer: Buffer,
  preset: ImageOptimizePreset,
  sourceExt: string,
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  if (sourceExt === 'gif') {
    return { buffer, contentType: 'image/gif', ext: 'gif' };
  }

  const config = PRESETS[preset];
  let pipeline = sharp(buffer, { animated: false }).rotate();

  pipeline = pipeline.resize({
    width: config.maxWidth,
    height: config.maxHeight,
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (config.format === 'webp') {
    const optimized = await pipeline
      .webp({ quality: config.quality, effort: 4 })
      .toBuffer();
    return { buffer: optimized, contentType: 'image/webp', ext: 'webp' };
  }

  const optimized = await pipeline
    .jpeg({ quality: config.quality, mozjpeg: true })
    .toBuffer();
  return { buffer: optimized, contentType: 'image/jpeg', ext: 'jpg' };
}
