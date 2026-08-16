-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "nickname" TEXT,
    "avatar_url" TEXT,
    "approval_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "verifier_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "reference_id" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category_id" TEXT,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "occurred_on" DATE NOT NULL,
    "attachment_url" TEXT,
    "recurrence_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrences" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category_id" TEXT,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "day_of_month" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "next_run_at" TIMESTAMP(3) NOT NULL,
    "last_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "income_sources" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "payday" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions"("user_id");

-- CreateIndex
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_account_id_key" ON "oauth_accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_user_id_type_reference_id_key" ON "notifications"("user_id", "type", "reference_id");

-- CreateIndex
CREATE INDEX "categories_owner_id_idx" ON "categories"("owner_id");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "transactions_owner_id_occurred_on_idx" ON "transactions"("owner_id", "occurred_on");

-- CreateIndex
CREATE INDEX "transactions_owner_id_category_id_occurred_on_idx" ON "transactions"("owner_id", "category_id", "occurred_on");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_recurrence_id_occurred_on_key" ON "transactions"("recurrence_id", "occurred_on");

-- CreateIndex
CREATE INDEX "recurrences_owner_id_idx" ON "recurrences"("owner_id");

-- CreateIndex
CREATE INDEX "recurrences_active_next_run_at_idx" ON "recurrences"("active", "next_run_at");

-- CreateIndex
CREATE INDEX "budgets_owner_id_idx" ON "budgets"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_owner_id_category_id_key" ON "budgets"("owner_id", "category_id");

-- CreateIndex
CREATE INDEX "income_sources_owner_id_idx" ON "income_sources"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "income_sources_owner_id_name_key" ON "income_sources"("owner_id", "name");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "recurrences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

