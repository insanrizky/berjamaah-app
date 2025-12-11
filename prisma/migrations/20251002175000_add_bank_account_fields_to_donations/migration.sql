-- Add bank account fields to donations table for data integrity
ALTER TABLE "donations" ADD COLUMN "bank_name" TEXT;
ALTER TABLE "donations" ADD COLUMN "account_number" TEXT;
ALTER TABLE "donations" ADD COLUMN "account_holder" TEXT;

-- Migrate existing data from user_bank_accounts to donations
UPDATE "donations" 
SET 
  "bank_name" = uba."bank_name",
  "account_number" = uba."account_number",
  "account_holder" = uba."account_holder"
FROM "user_bank_accounts" uba
WHERE "donations"."user_bank_account_id" = uba."id";

-- Add indexes for better performance on the new fields
CREATE INDEX "donations_bank_name_idx" ON "donations"("bank_name");
CREATE INDEX "donations_account_number_idx" ON "donations"("account_number");
CREATE INDEX "donations_account_holder_idx" ON "donations"("account_holder");
