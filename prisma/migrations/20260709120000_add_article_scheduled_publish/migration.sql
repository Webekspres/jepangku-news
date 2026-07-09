-- AlterEnum
ALTER TYPE "ArticleStatus" ADD VALUE 'SCHEDULED' BEFORE 'PUBLISHED';

-- AlterTable
ALTER TABLE "articles" ADD COLUMN "scheduled_publish_at" TIMESTAMP(3),
ADD COLUMN "qstash_message_id" TEXT;

-- CreateIndex
CREATE INDEX "articles_status_scheduled_publish_at_idx" ON "articles" ("status", "scheduled_publish_at");
