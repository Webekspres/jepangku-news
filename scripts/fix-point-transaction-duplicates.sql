-- Run manually if migrate deploy / db push fails on point_transactions unique constraint.
-- Keeps the oldest transaction per (user, activity, source); deletes the rest.

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
