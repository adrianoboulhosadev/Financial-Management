-- The product is open to the public: anyone signs up and logs in right away.
-- With no gate there is nothing to approve, and with nothing to approve there is
-- no privileged role left to hold — both columns go.
-- AlterTable
ALTER TABLE "users" DROP COLUMN "approval_status",
DROP COLUMN "role";

-- The two notification types the gate produced no longer exist in the domain
-- (see Notification.for), so the lines they wrote would render as an inbox entry
-- the code can no longer explain.
DELETE FROM "notifications" WHERE "type" IN ('account_approved', 'admin_signup_pending');
