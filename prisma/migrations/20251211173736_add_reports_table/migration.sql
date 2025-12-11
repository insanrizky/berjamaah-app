/*
  Warnings:

  - You are about to drop the column `program_period_id` on the `donations` table. All the data in the column will be lost.
  - You are about to drop the column `approved_at` on the `programs` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `programs` table. All the data in the column will be lost.
  - You are about to drop the column `program_type` on the `programs` table. All the data in the column will be lost.
  - You are about to drop the column `rejected_at` on the `programs` table. All the data in the column will be lost.
  - You are about to drop the column `rejected_by` on the `programs` table. All the data in the column will be lost.
  - You are about to drop the column `rejection_reason` on the `programs` table. All the data in the column will be lost.
  - You are about to drop the `program_periods` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."donations" DROP CONSTRAINT "donations_program_period_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."program_periods" DROP CONSTRAINT "program_periods_program_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."programs" DROP CONSTRAINT "programs_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."programs" DROP CONSTRAINT "programs_rejected_by_fkey";

-- DropIndex
DROP INDEX "public"."donations_account_holder_idx";

-- DropIndex
DROP INDEX "public"."donations_account_number_idx";

-- DropIndex
DROP INDEX "public"."donations_bank_name_idx";

-- AlterTable
ALTER TABLE "public"."donations" DROP COLUMN "program_period_id",
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "public"."programs" DROP COLUMN "approved_at",
DROP COLUMN "approved_by",
DROP COLUMN "program_type",
DROP COLUMN "rejected_at",
DROP COLUMN "rejected_by",
DROP COLUMN "rejection_reason";

-- DropTable
DROP TABLE "public"."program_periods";

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "file_url" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_deleted_at_idx" ON "public"."reports"("deleted_at");

-- CreateIndex
CREATE INDEX "reports_created_at_idx" ON "public"."reports"("created_at");

-- CreateIndex
CREATE INDEX "programs_created_by_idx" ON "public"."programs"("created_by");
