-- A card is identified by its network and its last four digits ("Visa ····1234"),
-- which is how it reads on a statement — so the invented nickname goes away and
-- the brand takes its place. Existing rows get 'other' until their owner edits
-- them, because a brand nobody told us is not one we may guess.
-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT 'other';

-- The natural key moves with it: two different cards of the same bank do not
-- share their last four digits, and the nickname is no longer there to key on.
-- DropIndex
DROP INDEX "cards_owner_id_bank_id_name_key";

-- Cards of the same bank that happen to share their last four digits cannot
-- both survive the new key. Keeping the OLDEST is the safe half of the choice:
-- it is the one the existing movements were filed against.
DELETE FROM "cards" a
USING "cards" b
WHERE a."owner_id" = b."owner_id"
  AND a."bank_id" = b."bank_id"
  AND a."last_four_digits" = b."last_four_digits"
  AND a."created_at" > b."created_at";

-- CreateIndex
CREATE UNIQUE INDEX "cards_owner_id_bank_id_last_four_digits_key" ON "cards"("owner_id", "bank_id", "last_four_digits");

-- AlterTable
ALTER TABLE "cards" DROP COLUMN "name";

-- A fixed movement that ends on a known date (a course paid over 8 months).
-- NULL is the ordinary case — it repeats forever — so every row already stored
-- keeps behaving exactly as it does today.
-- AlterTable
ALTER TABLE "recurrences" ADD COLUMN     "ends_on" DATE;

-- CreateTable
CREATE TABLE "investment_contributions" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "investment_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "occurred_on" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "investment_contributions_owner_id_occurred_on_idx" ON "investment_contributions"("owner_id", "occurred_on");

-- CreateIndex
CREATE INDEX "investment_contributions_investment_id_idx" ON "investment_contributions"("investment_id");

-- AddForeignKey
ALTER TABLE "investment_contributions" ADD CONSTRAINT "investment_contributions_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
