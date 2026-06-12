-- Restore portal points ledger (Core v2.1 — points live in News DB only)
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source_app" TEXT NOT NULL DEFAULT 'news',
    "activity_type" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "point_transactions_user_activity_unique" ON "point_transactions"(
    "user_id",
    "source_app",
    "activity_type",
    "source_type",
    "source_id"
);

CREATE INDEX "point_transactions_user_id_occurred_at_idx" ON "point_transactions"("user_id", "occurred_at" DESC);
CREATE INDEX "point_transactions_occurred_at_idx" ON "point_transactions"("occurred_at");

ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
