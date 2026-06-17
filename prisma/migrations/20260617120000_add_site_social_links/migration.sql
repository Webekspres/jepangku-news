-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'X', 'YOUTUBE', 'TIKTOK');

-- CreateTable
CREATE TABLE "site_social_links" (
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_social_links_pkey" PRIMARY KEY ("platform")
);

-- Seed default brand links
INSERT INTO "site_social_links" ("platform", "url", "is_enabled", "sort_order", "updated_at") VALUES
  ('INSTAGRAM', 'https://www.instagram.com/jepangku', true, 0, CURRENT_TIMESTAMP),
  ('FACEBOOK', 'https://www.facebook.com/jepangku', true, 1, CURRENT_TIMESTAMP),
  ('X', 'https://x.com/jepangku', true, 2, CURRENT_TIMESTAMP),
  ('YOUTUBE', 'https://www.youtube.com/@jepangku', true, 3, CURRENT_TIMESTAMP),
  ('TIKTOK', 'https://www.tiktok.com/@jepangku', true, 4, CURRENT_TIMESTAMP);
