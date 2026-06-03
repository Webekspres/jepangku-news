-- Add unique constraint to prevent duplicate point transactions
ALTER TABLE "point_transactions"
ADD CONSTRAINT "point_transactions_user_activity_unique" UNIQUE ("user_id", "source_app", "activity_type", "source_type", "source_id");
