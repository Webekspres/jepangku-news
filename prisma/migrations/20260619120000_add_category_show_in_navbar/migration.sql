-- AlterTable
ALTER TABLE "categories" ADD COLUMN "show_in_navbar" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: first 9 active categories by sort order
UPDATE "categories"
SET "show_in_navbar" = true
WHERE "id" IN (
  SELECT "id"
  FROM "categories"
  WHERE "is_active" = true
  ORDER BY "sort_order" ASC, "name" ASC
  LIMIT 9
);
