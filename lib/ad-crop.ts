import { getAdSlotDimensions } from '@/lib/ads/dimensions';
import {
  getCroppedImageBlob,
  type CropArea,
} from '@/lib/image-crop';

export const AD_OUTPUT_TYPE = 'image/jpeg';
export const AD_OUTPUT_QUALITY = 0.92;

export async function getCroppedAdBannerBlob(
  imageSrc: string,
  pixelCrop: CropArea,
  position: string,
  rotation = 0,
): Promise<Blob> {
  const { width, height } = getAdSlotDimensions(position);
  return getCroppedImageBlob(
    imageSrc,
    pixelCrop,
    width,
    height,
    rotation,
    AD_OUTPUT_TYPE,
    AD_OUTPUT_QUALITY,
  );
}
