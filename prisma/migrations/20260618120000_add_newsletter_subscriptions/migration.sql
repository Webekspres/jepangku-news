-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "user_id" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "unsubscribe_token" TEXT NOT NULL,
  "subscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unsubscribed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "newsletter_subscriptions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_unsubscribe_token_key" ON "newsletter_subscriptions"("unsubscribe_token");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_is_active_subscribed_at_idx" ON "newsletter_subscriptions"("is_active", "subscribed_at" DESC);

-- AddForeignKey
ALTER TABLE "newsletter_subscriptions"
  ADD CONSTRAINT "newsletter_subscriptions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
