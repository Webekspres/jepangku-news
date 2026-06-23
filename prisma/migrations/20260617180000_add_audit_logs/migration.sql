-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "source_app" TEXT NOT NULL DEFAULT 'news',
    "category" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_role" "Role",
    "target_type" TEXT,
    "target_id" TEXT,
    "target_label" TEXT,
    "target_href" TEXT,
    "summary" TEXT NOT NULL,
    "note" TEXT,
    "metadata" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_occurred_at_idx" ON "audit_logs"("occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_category_occurred_at_idx" ON "audit_logs"("category", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_occurred_at_idx" ON "audit_logs"("actor_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_target_type_target_id_idx" ON "audit_logs"("target_type", "target_id");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill article reviews
INSERT INTO "audit_logs" (
    "id", "source_app", "category", "action", "actor_id", "actor_role",
    "target_type", "target_id", "target_label", "target_href", "summary", "note",
    "occurred_at", "created_at"
)
SELECT
    ar."id",
    'news',
    'article',
    'status_change',
    ar."reviewer_id",
    u."role",
    'article',
    ar."article_id",
    a."title",
    '/admin/articles/' || ar."article_id",
    ar."previous_status" || ' -> ' || ar."new_status",
    ar."note",
    ar."reviewed_at",
    ar."created_at"
FROM "article_reviews" ar
INNER JOIN "users" u ON u."id" = ar."reviewer_id"
INNER JOIN "articles" a ON a."id" = ar."article_id";

-- Backfill contributor reviews
INSERT INTO "audit_logs" (
    "id", "source_app", "category", "action", "actor_id", "actor_role",
    "target_type", "target_id", "target_label", "target_href", "summary", "note",
    "occurred_at", "created_at"
)
SELECT
    'contrib-' || ca."id",
    'news',
    'contributor',
    CASE WHEN ca."status" = 'APPROVED' THEN 'approve' ELSE 'reject' END,
    ca."reviewed_by_id",
    u."role",
    'user',
    ca."user_id",
    applicant."name",
    '/admin/contributors',
    CASE
        WHEN ca."status" = 'APPROVED' THEN 'Permohonan kontributor disetujui'
        ELSE 'Permohonan kontributor ditolak'
    END,
    ca."admin_note",
    ca."reviewed_at",
    ca."updated_at"
FROM "contributor_applications" ca
INNER JOIN "users" u ON u."id" = ca."reviewed_by_id"
INNER JOIN "users" applicant ON applicant."id" = ca."user_id"
WHERE ca."reviewed_at" IS NOT NULL AND ca."reviewed_by_id" IS NOT NULL;
