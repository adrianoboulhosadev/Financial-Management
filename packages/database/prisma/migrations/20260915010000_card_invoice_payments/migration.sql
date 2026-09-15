-- What the owner did about ONE invoice of ONE card. Like recurrence_payments,
-- it records only the DEVIATION from the default: an invoice nobody ticked has
-- no row and reads as "still to pay", so a year of untouched invoices costs no
-- writes at all.
--
-- There is no amount column on purpose. What an invoice is worth is already
-- decided by the charges on it, and storing it again would only create a second
-- number to disagree with the first.
--
-- `period` is the CLOSING month and never the due month: closing is what the
-- charges belong to, and a card whose due day precedes its closing day pays in
-- the following month — keying on the due month would give one invoice two
-- names depending on the card.
-- CreateTable
CREATE TABLE "card_invoice_payments" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_invoice_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "card_invoice_payments_owner_id_period_idx" ON "card_invoice_payments"("owner_id", "period");

-- Ticking the same invoice twice is an upsert on this key, never a second row.
-- CreateIndex
CREATE UNIQUE INDEX "card_invoice_payments_card_id_period_key" ON "card_invoice_payments"("card_id", "period");

-- Intra-context relation, so it is a real FK. Cascade: a card that is gone has
-- no invoices left to have paid.
-- AddForeignKey
ALTER TABLE "card_invoice_payments" ADD CONSTRAINT "card_invoice_payments_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
