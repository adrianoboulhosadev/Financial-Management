-- A credit card gains its invoice calendar (the day it closes, the day it is
-- due) and its limit. All three are NULLABLE: every card already stored was
-- registered before invoices existed, and a debit card never has any of them —
-- a NOT NULL with a made-up default would put a closing day on cards that do
-- not close and a limit on cards that have none.
--
-- The limit is in INTEGER CENTS, like every other amount in the schema.
-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "closing_day" INTEGER,
ADD COLUMN     "due_day" INTEGER,
ADD COLUMN     "limit_cents" INTEGER;
