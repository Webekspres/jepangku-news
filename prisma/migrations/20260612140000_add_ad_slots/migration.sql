-- CreateTable
CREATE TABLE "ad_slots" (
    "id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "title" TEXT,
    "image_url" TEXT NOT NULL,
    "link_url" TEXT,
    "alt_text" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ad_slots_position_is_active_idx" ON "ad_slots"("position", "is_active");
