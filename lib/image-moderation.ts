const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function detectImageType(buffer: Buffer) {
  if (buffer.length >= 4) {
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { ext: 'jpg', mime: 'image/jpeg' };
    }
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return { ext: 'png', mime: 'image/png' };
    }
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return { ext: 'gif', mime: 'image/gif' };
    }
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return { ext: 'webp', mime: 'image/webp' };
    }
  }

  return null;
}

export function validateImageBuffer(buffer: Buffer, contentType: string) {
  const detected = detectImageType(buffer);
  if (!detected) {
    throw new Error('Uploaded file is not a valid image.');
  }

  if (!allowedMimeTypes.includes(contentType)) {
    throw new Error('Invalid image MIME type.');
  }

  const normalizedContentType = contentType === 'image/jpg' ? 'image/jpeg' : contentType;
  if (detected.mime !== normalizedContentType) {
    throw new Error('Image MIME type does not match file contents.');
  }

  return detected;
}

export async function moderateImage(buffer: Buffer, contentType: string) {
  validateImageBuffer(buffer, contentType);

  const moderationEndpoint = process.env.IMAGE_MODERATION_ENDPOINT;
  const moderationKey = process.env.IMAGE_MODERATION_API_KEY;

  if (!moderationEndpoint || !moderationKey) {
    return true;
  }

  const payload = {
    contentType,
    imageBase64: buffer.toString('base64'),
  };

  const response = await fetch(moderationEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': moderationKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Image moderation service rejected the request.');
  }

  const result = await response.json();
  if (result?.decision === 'reject' || result?.moderation === 'unsafe') {
    throw new Error('Uploaded image was rejected by moderation.');
  }

  return true;
}
