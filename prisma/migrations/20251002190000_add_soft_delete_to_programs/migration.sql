-- Migration: Add soft delete to programs
-- This migration adds a deleted_at column to the programs table

-- Add deleted_at column
ALTER TABLE "public"."programs" 
ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Add index for better query performance
CREATE INDEX "programs_deleted_at_idx" ON "public"."programs"("deleted_at");
