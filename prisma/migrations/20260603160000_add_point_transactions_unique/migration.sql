-- Remove duplicate point awards (keep earliest row per activity key)
DELETE FROM "point_transactions" pt
WHERE pt."id" IN (
  SELECT "id"
  FROM (
    SELECT
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "user_id", "source_app", "activity_type", "source_type", "source_id"
        ORDER BY "created_at" ASC, "id" ASC
      ) AS rn
    FROM "point_transactions"
  ) ranked
  WHERE rn > 1
);

-- Add unique constraint to prevent duplicate point transactions
ALTER TABLE "point_transactions"
ADD CONSTRAINT "point_transactions_user_activity_unique" UNIQUE (
  "user_id",
  "source_app",
  "activity_type",
  "source_type",
  "source_id"
);
