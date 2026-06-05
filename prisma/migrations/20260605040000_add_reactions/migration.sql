-- CreateEnum
CREATE TYPE "ReactionTargetType" AS ENUM ('ARTICLE', 'POLL', 'QUIZ', 'COMMENT');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LOVE', 'LOL', 'CUTE', 'WIN', 'WTF', 'OMG', 'GEEKY', 'SCARY', 'FAIL', 'THUMB_UP', 'THUMB_DOWN');

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "source_app" TEXT NOT NULL DEFAULT 'news',
    "target_type" "ReactionTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reactions_target_type_target_id_idx" ON "reactions"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_target_type_target_id_user_id_key" ON "reactions"("target_type", "target_id", "user_id");

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
