-- Fix migration names in _prisma_migrations table after renaming migration files
-- This script updates the migration_name column to match the renamed migration files

-- Step 1: Check current state
SELECT migration_name, finished_at, applied_steps_count 
FROM "_prisma_migrations" 
WHERE migration_name LIKE '%bank_account%' 
ORDER BY migration_name;

-- Step 2: Delete old migration records (they will be replaced)
DELETE FROM "_prisma_migrations"
WHERE migration_name IN (
  '20250115000000_add_bank_account_fields_to_donations',
  '20250115000001_remove_user_bank_account_id_from_donations',
  '20251003000000_add_bank_account_fields_to_donations',
  '20251003000001_remove_user_bank_account_id_from_donations'
);

-- Step 3: If new migrations don't exist yet, insert them as applied
-- (This handles the case where we renamed files but haven't marked them as applied)
INSERT INTO "_prisma_migrations" (id, migration_name, checksum, finished_at, applied_steps_count)
SELECT 
  gen_random_uuid(),
  '20251002175000_add_bank_account_fields_to_donations',
  encode(digest('-- Add bank account fields to donations table for data integrity', 'sha256'), 'hex'),
  NOW(),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" 
  WHERE migration_name = '20251002175000_add_bank_account_fields_to_donations'
);

INSERT INTO "_prisma_migrations" (id, migration_name, checksum, finished_at, applied_steps_count)
SELECT 
  gen_random_uuid(),
  '20251002175100_remove_user_bank_account_id_from_donations',
  encode(digest('-- Remove userBankAccountId field and foreign key constraint from donations table', 'sha256'), 'hex'),
  NOW(),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" 
  WHERE migration_name = '20251002175100_remove_user_bank_account_id_from_donations'
);

-- Step 4: Verify the updates
SELECT migration_name, finished_at, applied_steps_count 
FROM "_prisma_migrations" 
WHERE migration_name LIKE '%bank_account%' 
ORDER BY migration_name;
