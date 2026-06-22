-- Phase 3: User.id = Clerk ID; drop local points tables; remove obsolete columns

-- Legacy portal-only users (no Clerk) cannot join global identity — remove before cutover.
-- Production: run `bun run db:sync-clerk` in jepangku-core first so real users keep clerk_id.
DELETE FROM "users" WHERE "clerk_id" IS NULL;

-- Drop local gamification tables (source of truth moves to jepangku-core)
DROP TABLE IF EXISTS "daily_login_rewards";
DROP TABLE IF EXISTS "point_transactions";

-- Repoint FK columns from legacy UUID to clerk_id
UPDATE "user_profiles" up
SET "user_id" = u."clerk_id"
FROM "users" u
WHERE up."user_id" = u."id";

UPDATE "articles" a
SET "author_id" = u."clerk_id"
FROM "users" u
WHERE a."author_id" = u."id";

UPDATE "articles" a
SET "last_edited_by_id" = u."clerk_id"
FROM "users" u
WHERE a."last_edited_by_id" = u."id" AND a."last_edited_by_id" IS NOT NULL;

UPDATE "article_views" av
SET "user_id" = u."clerk_id"
FROM "users" u
WHERE av."user_id" = u."id";

UPDATE "article_reviews" ar
SET "reviewer_id" = u."clerk_id"
FROM "users" u
WHERE ar."reviewer_id" = u."id";

UPDATE "article_revisions" ar
SET "editor_id" = u."clerk_id"
FROM "users" u
WHERE ar."editor_id" = u."id";

UPDATE "bookmarks" b
SET "user_id" = u."clerk_id"
FROM "users" u
WHERE b."user_id" = u."id";

UPDATE "article_shares" s
SET "user_id" = u."clerk_id"
FROM "users" u
WHERE s."user_id" = u."id";

UPDATE "quiz_attempts" qa
SET "user_id" = u."clerk_id"
FROM "users" u
WHERE qa."user_id" = u."id";

UPDATE "poll_votes" pv
SET "user_id" = u."clerk_id"
FROM "users" u
WHERE pv."user_id" = u."id";

UPDATE "files" f
SET "user_id" = u."clerk_id"
FROM "users" u
WHERE f."user_id" = u."id";

UPDATE "comments" c
SET "user_id" = u."clerk_id"
FROM "users" u
WHERE c."user_id" = u."id";

UPDATE "info_pages" ip
SET "updated_by_id" = u."clerk_id"
FROM "users" u
WHERE ip."updated_by_id" = u."id" AND ip."updated_by_id" IS NOT NULL;

UPDATE "reactions" r
SET "user_id" = u."clerk_id"
FROM "users" u
WHERE r."user_id" = u."id";

UPDATE "quizzes" q
SET "created_by" = u."clerk_id"
FROM "users" u
WHERE q."created_by" = u."id";

UPDATE "polls" p
SET "created_by" = u."clerk_id"
FROM "users" u
WHERE p."created_by" = u."id";

-- Drop FK constraints referencing users
ALTER TABLE "user_profiles" DROP CONSTRAINT IF EXISTS "user_profiles_user_id_fkey";
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_author_id_fkey";
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_last_edited_by_id_fkey";
ALTER TABLE "article_views" DROP CONSTRAINT IF EXISTS "article_views_user_id_fkey";
ALTER TABLE "article_reviews" DROP CONSTRAINT IF EXISTS "article_reviews_reviewer_id_fkey";
ALTER TABLE "article_revisions" DROP CONSTRAINT IF EXISTS "article_revisions_editor_id_fkey";
ALTER TABLE "bookmarks" DROP CONSTRAINT IF EXISTS "bookmarks_user_id_fkey";
ALTER TABLE "article_shares" DROP CONSTRAINT IF EXISTS "article_shares_user_id_fkey";
ALTER TABLE "quiz_attempts" DROP CONSTRAINT IF EXISTS "quiz_attempts_user_id_fkey";
ALTER TABLE "poll_votes" DROP CONSTRAINT IF EXISTS "poll_votes_user_id_fkey";
ALTER TABLE "files" DROP CONSTRAINT IF EXISTS "files_user_id_fkey";
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_user_id_fkey";
ALTER TABLE "info_pages" DROP CONSTRAINT IF EXISTS "info_pages_updated_by_id_fkey";
ALTER TABLE "reactions" DROP CONSTRAINT IF EXISTS "reactions_user_id_fkey";

-- Replace users PK with Clerk ID
ALTER TABLE "users" DROP CONSTRAINT "users_pkey";
DROP INDEX IF EXISTS "users_clerk_id_key";

UPDATE "users" SET "id" = "clerk_id";

ALTER TABLE "users" DROP COLUMN "clerk_id";
ALTER TABLE "users" DROP COLUMN IF EXISTS "total_points";
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash";

ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- Restore FK constraints
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "articles" ADD CONSTRAINT "articles_last_edited_by_id_fkey" FOREIGN KEY ("last_edited_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "article_reviews" ADD CONSTRAINT "article_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_revisions" ADD CONSTRAINT "article_revisions_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "article_shares" ADD CONSTRAINT "article_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "info_pages" ADD CONSTRAINT "info_pages_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
