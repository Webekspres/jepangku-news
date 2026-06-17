-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
  'ARTICLE_APPROVED',
  'ARTICLE_REJECTED',
  'ARTICLE_PENDING_REVIEW',
  'CONTRIBUTOR_APPLICATION_PENDING',
  'CONTRIBUTOR_APPROVED',
  'CONTRIBUTOR_REJECTED',
  'COMMENT_ON_ARTICLE',
  'COMMENT_REPLY',
  'WELCOME'
);

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('NORMAL', 'HIGH');

-- AlterTable
ALTER TABLE "user_profiles"
  ADD COLUMN "welcomed_at" TIMESTAMP(3),
  ADD COLUMN "last_daily_points_modal_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "link" TEXT,
  "metadata" JSONB,
  "dedupe_key" TEXT,
  "group_key" TEXT,
  "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
  "read_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_created_at_idx"
  ON "notifications" ("user_id", "read_at", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_user_id_group_key_created_at_idx"
  ON "notifications" ("user_id", "group_key", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_expires_at_idx" ON "notifications" ("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_user_dedupe_unique"
  ON "notifications" ("user_id", "dedupe_key");

-- AddForeignKey
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
