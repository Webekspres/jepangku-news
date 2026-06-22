/** Square avatar output — cocok untuk foto profil di navbar, leaderboard, komentar. */
export const AVATAR_OUTPUT_SIZE = 400;
export const AVATAR_OUTPUT_TYPE = 'image/jpeg';
export const AVATAR_OUTPUT_QUALITY = 0.92;

export type { CropArea } from '@/lib/image-crop';
export { getCroppedImageBlob } from '@/lib/image-crop';

import { getCroppedImageBlob, type CropArea } from '@/lib/image-crop';

/** Export cropped + rotated square avatar as JPEG blob. */
export async function getCroppedAvatarBlob(
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0,
): Promise<Blob> {
  return getCroppedImageBlob(
    imageSrc,
    pixelCrop,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE,
    rotation,
    AVATAR_OUTPUT_TYPE,
    AVATAR_OUTPUT_QUALITY,
  );
}
