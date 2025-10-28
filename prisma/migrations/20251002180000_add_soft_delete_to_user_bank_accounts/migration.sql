-- Migration: Add soft delete to user_bank_accounts
-- This migration adds a deleted_at column to the user_bank_accounts table

-- Add deleted_at column
ALTER TABLE "public"."user_bank_accounts" 
ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Add index for better query performance
CREATE INDEX "user_bank_accounts_deleted_at_idx" ON "public"."user_bank_accounts"("deleted_at");
