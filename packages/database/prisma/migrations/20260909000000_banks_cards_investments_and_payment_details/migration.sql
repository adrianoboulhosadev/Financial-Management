-- Payment details on a movement: which bank/card it went through, how it was
-- paid, and (for a credit purchase) which instalment of how many. Every column
-- is nullable or defaulted, so every row already recorded stays valid exactly
-- as it is.
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "bank_id" TEXT,
ADD COLUMN     "card_id" TEXT,
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "installments" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "installment_number" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "installment_group_id" TEXT;

-- A recurrence now knows whether its amount varies month to month (the light
-- bill), whether it settles by itself (pix/direct debit) and through which
-- bank/card it is paid.
-- AlterTable
ALTER TABLE "recurrences" ADD COLUMN     "variable_amount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "auto_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bank_id" TEXT,
ADD COLUMN     "card_id" TEXT,
ADD COLUMN     "payment_method" TEXT;

-- CreateTable
CREATE TABLE "recurrence_payments" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "recurrence_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amount" INTEGER,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurrence_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "agency" TEXT,
    "account_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "bank_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "last_four_digits" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "bank_id" TEXT,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "invested_amount" INTEGER NOT NULL,
    "current_amount" INTEGER,
    "started_on" DATE NOT NULL,
    "maturity_on" DATE,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_owner_id_bank_id_idx" ON "transactions"("owner_id", "bank_id");

-- CreateIndex
CREATE INDEX "transactions_installment_group_id_idx" ON "transactions"("installment_group_id");

-- CreateIndex
CREATE INDEX "recurrence_payments_owner_id_period_idx" ON "recurrence_payments"("owner_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "recurrence_payments_recurrence_id_period_key" ON "recurrence_payments"("recurrence_id", "period");

-- CreateIndex
CREATE INDEX "banks_owner_id_idx" ON "banks"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "banks_owner_id_name_key" ON "banks"("owner_id", "name");

-- CreateIndex
CREATE INDEX "cards_owner_id_idx" ON "cards"("owner_id");

-- CreateIndex
CREATE INDEX "cards_bank_id_idx" ON "cards"("bank_id");

-- CreateIndex
CREATE UNIQUE INDEX "cards_owner_id_bank_id_name_key" ON "cards"("owner_id", "bank_id", "name");

-- CreateIndex
CREATE INDEX "investments_owner_id_idx" ON "investments"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "investments_owner_id_name_key" ON "investments"("owner_id", "name");

-- AddForeignKey
ALTER TABLE "recurrence_payments" ADD CONSTRAINT "recurrence_payments_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "recurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
