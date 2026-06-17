-- CreateEnum
CREATE TYPE "EmailOutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "email_outbox" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "template" TEXT NOT NULL,
  "to_email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "dedupe_key" TEXT,
  "status" "EmailOutboxStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT,
  "scheduled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sent_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "email_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_outbox_status_scheduled_at_idx" ON "email_outbox" ("status", "scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_outbox_user_dedupe_unique" ON "email_outbox" ("user_id", "dedupe_key");

-- AddForeignKey
ALTER TABLE "email_outbox"
  ADD CONSTRAINT "email_outbox_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
