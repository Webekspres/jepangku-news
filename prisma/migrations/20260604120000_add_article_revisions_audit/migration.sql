-- AlterTable (idempotent — columns may exist from prior db push)
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "last_edited_by_id" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "last_edited_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "article_revisions" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "revision_number" INTEGER NOT NULL,
    "editor_id" TEXT NOT NULL,
    "change_note" TEXT,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "category_id" TEXT,
    "status" "ArticleStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "article_revisions_article_id_created_at_idx"
  ON "article_revisions"("article_id", "created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "article_revisions_article_id_revision_number_key"
  ON "article_revisions"("article_id", "revision_number");

-- AddForeignKey (skip if already present)
DO $$ BEGIN
  ALTER TABLE "articles"
    ADD CONSTRAINT "articles_last_edited_by_id_fkey"
    FOREIGN KEY ("last_edited_by_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "article_revisions"
    ADD CONSTRAINT "article_revisions_article_id_fkey"
    FOREIGN KEY ("article_id") REFERENCES "articles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "article_revisions"
    ADD CONSTRAINT "article_revisions_editor_id_fkey"
    FOREIGN KEY ("editor_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "article_reviews"
    ADD CONSTRAINT "article_reviews_reviewer_id_fkey"
    FOREIGN KEY ("reviewer_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
