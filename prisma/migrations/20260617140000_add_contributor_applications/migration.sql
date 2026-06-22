-- CreateEnum
CREATE TYPE "ContributorApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "contributor_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "portfolio_url" TEXT,
    "status" "ContributorApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "admin_note" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributor_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contributor_applications_status_created_at_idx" ON "contributor_applications"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "contributor_applications_user_id_created_at_idx" ON "contributor_applications"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "contributor_applications" ADD CONSTRAINT "contributor_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_applications" ADD CONSTRAINT "contributor_applications_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
