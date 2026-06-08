-- Migrasi: tambah tabel poll_questions, ubah poll_options & poll_votes ke relasi per-pertanyaan
-- Data polling lama dihapus terlebih dahulu karena perubahan struktur tidak kompatibel backward.
-- Data akan di-reseed setelah migration.

-- 1. Hapus data lama
DELETE FROM "poll_votes";
DELETE FROM "poll_options";

-- 2. Drop foreign keys lama
ALTER TABLE "poll_options" DROP CONSTRAINT IF EXISTS "poll_options_poll_id_fkey";
ALTER TABLE "poll_votes"   DROP CONSTRAINT IF EXISTS "poll_votes_poll_id_fkey";
ALTER TABLE "poll_votes"   DROP CONSTRAINT IF EXISTS "poll_votes_option_id_fkey";
ALTER TABLE "poll_votes"   DROP CONSTRAINT IF EXISTS "poll_votes_user_id_fkey";

-- 3. Buat tabel poll_questions
CREATE TABLE "poll_questions" (
    "id"           TEXT         NOT NULL,
    "poll_id"      TEXT         NOT NULL,
    "question_text" TEXT        NOT NULL,
    "image_url"    TEXT,
    "sort_order"   INTEGER      NOT NULL DEFAULT 0,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "poll_questions_pkey" PRIMARY KEY ("id")
);

-- 4. Modifikasi poll_options
ALTER TABLE "poll_options" DROP COLUMN "poll_id";
ALTER TABLE "poll_options" ADD COLUMN "question_id" TEXT NOT NULL DEFAULT '';
-- Hapus default setelah kolom ditambahkan
ALTER TABLE "poll_options" ALTER COLUMN "question_id" DROP DEFAULT;

-- 5. Modifikasi poll_votes
ALTER TABLE "poll_votes" ADD COLUMN "question_id" TEXT NOT NULL DEFAULT '';
ALTER TABLE "poll_votes" ALTER COLUMN "question_id" DROP DEFAULT;

-- 6. Tambah foreign keys baru
ALTER TABLE "poll_questions" ADD CONSTRAINT "poll_questions_poll_id_fkey"
    FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "poll_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "poll_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_poll_id_fkey"
    FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_fkey"
    FOREIGN KEY ("option_id") REFERENCES "poll_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Tambah unique constraint baru
CREATE UNIQUE INDEX "poll_votes_poll_id_question_id_user_id_key"
    ON "poll_votes"("poll_id", "question_id", "user_id");
