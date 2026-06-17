/** R2 keys unik per upload (timestamp + random) — aman di-cache browser/CDN secara immutable. */
export const R2_OBJECT_CACHE_CONTROL = 'public, max-age=31536000, immutable';

/** Sinkron dengan next.config images.minimumCacheTTL — cache optimizer Next sebelum re-fetch R2. */
export const NEXT_IMAGE_CACHE_TTL_SEC = 86_400;
