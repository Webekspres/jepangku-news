-- AlterTable: add video_url and platform to support multi-platform video embeds
-- youtube_id becomes nullable (existing rows keep their value)
ALTER TABLE "videos"
  ADD COLUMN "video_url"  TEXT,
  ADD COLUMN "platform"   TEXT NOT NULL DEFAULT 'YOUTUBE';

-- Backfill video_url from existing youtube_id values
UPDATE "videos"
  SET "video_url" = 'https://www.youtube.com/watch?v=' || "youtube_id"
  WHERE "youtube_id" IS NOT NULL AND "youtube_id" <> '';

-- Make youtube_id nullable now that video_url is the source of truth
ALTER TABLE "videos"
  ALTER COLUMN "youtube_id" DROP NOT NULL;

-- Index for platform filter
CREATE INDEX "videos_platform_idx" ON "videos"("platform");
