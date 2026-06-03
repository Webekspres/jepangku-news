-- CreateTable
CREATE TABLE "article_shares" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "share_method" TEXT NOT NULL,
    "points_awarded" INTEGER NOT NULL DEFAULT 5,
    "is_point_awarded" BOOLEAN NOT NULL DEFAULT false,
    "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "article_shares_user_id_article_id_key" ON "article_shares"("user_id", "article_id");

-- AddForeignKey
ALTER TABLE "article_shares" ADD CONSTRAINT "article_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_shares" ADD CONSTRAINT "article_shares_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
