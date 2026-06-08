-- AlterTable: Clerk bridge - optional clerk_id + password only for legacy local auth
ALTER TABLE "users" ADD COLUMN "clerk_id" TEXT;

CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
