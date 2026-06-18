-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NEW_ARTICLE_IN_CATEGORY';

-- CreateTable
CREATE TABLE "category_subscriptions" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "category_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_subscriptions_user_id_category_id_key" ON "category_subscriptions"("user_id", "category_id");

-- CreateIndex
CREATE INDEX "category_subscriptions_category_id_idx" ON "category_subscriptions"("category_id");

-- AddForeignKey
ALTER TABLE "category_subscriptions"
  ADD CONSTRAINT "category_subscriptions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_subscriptions"
  ADD CONSTRAINT "category_subscriptions_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
