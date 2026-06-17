/** Square avatar output — cocok untuk foto profil di navbar, leaderboard, komentar. */
export const AVATAR_OUTPUT_SIZE = 400;
export const AVATAR_OUTPUT_TYPE = 'image/jpeg';
export const AVATAR_OUTPUT_QUALITY = 0.92;

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const TO_RADIANS = Math.PI / 180;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.crossOrigin = 'anonymous';
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal memproses gambar'));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

/** Export cropped + rotated square avatar as JPEG blob. */
export async function getCroppedAvatarBlob(
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas tidak didukung di browser ini');
  }

  const rotRad = rotation * TO_RADIANS;
  const bBoxWidth =
    Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
  const bBoxHeight =
    Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('Canvas tidak didukung di browser ini');
  }

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  const output = document.createElement('canvas');
  output.width = AVATAR_OUTPUT_SIZE;
  output.height = AVATAR_OUTPUT_SIZE;
  const outputCtx = output.getContext('2d');

  if (!outputCtx) {
    throw new Error('Canvas tidak didukung di browser ini');
  }

  outputCtx.drawImage(
    croppedCanvas,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE,
  );

  return canvasToBlob(output, AVATAR_OUTPUT_TYPE, AVATAR_OUTPUT_QUALITY);
}
