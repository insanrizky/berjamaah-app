-- Remove userBankAccountId field and foreign key constraint from donations table
-- This field is no longer needed since we're using denormalized bank account fields

-- Drop the foreign key constraint first
ALTER TABLE "donations" DROP CONSTRAINT IF EXISTS "donations_user_bank_account_id_fkey";

-- Drop the column
ALTER TABLE "donations" DROP COLUMN IF EXISTS "user_bank_account_id";

-- Drop the index if it exists
DROP INDEX IF EXISTS "donations_user_bank_account_id_idx";
