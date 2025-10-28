-- DropIndex
DROP INDEX "public"."idx_donations_created_at";

-- DropIndex
DROP INDEX "public"."idx_donations_donor_email";

-- DropIndex
DROP INDEX "public"."idx_donations_program_id_created_at";

-- DropIndex
DROP INDEX "public"."idx_donations_program_id_status";

-- DropIndex
DROP INDEX "public"."idx_donations_program_status_amount";

-- DropIndex
DROP INDEX "public"."idx_donations_status";

-- DropIndex
DROP INDEX "public"."idx_donations_status_donor_email";

-- DropIndex
DROP INDEX "public"."idx_donations_status_program_id";

-- DropIndex
DROP INDEX "public"."idx_donations_user_id_created_at";

-- DropIndex
DROP INDEX "public"."idx_donations_user_program_created";

-- DropIndex
DROP INDEX "public"."idx_donations_verified_by_admin_id";

-- DropIndex
DROP INDEX "public"."idx_program_periods_next_activation_date";

-- DropIndex
DROP INDEX "public"."idx_program_periods_program_id_start_date";

-- DropIndex
DROP INDEX "public"."idx_program_periods_start_date";

-- DropIndex
DROP INDEX "public"."idx_programs_category_status";

-- DropIndex
DROP INDEX "public"."idx_programs_created_by";

-- DropIndex
DROP INDEX "public"."idx_programs_status";

-- DropIndex
DROP INDEX "public"."idx_programs_status_created_at";

-- DropIndex
DROP INDEX "public"."idx_user_role";

-- DropIndex
DROP INDEX "public"."idx_user_role_status";

-- DropIndex
DROP INDEX "public"."idx_verification_expires_at";

-- DropIndex
DROP INDEX "public"."idx_verification_identifier";

-- CreateTable
CREATE TABLE "public"."user_bank_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_holder" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_bank_accounts_user_id_idx" ON "public"."user_bank_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_bank_accounts_user_id_account_number_key" ON "public"."user_bank_accounts"("user_id", "account_number");

-- AddForeignKey
ALTER TABLE "public"."user_bank_accounts" ADD CONSTRAINT "user_bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Configure RLS for user_bank_accounts (consistent with other tables)
ALTER TABLE "public"."user_bank_accounts" DISABLE ROW LEVEL SECURITY;

-- Grant privileges to Supabase roles
GRANT ALL ON "public"."user_bank_accounts" TO authenticated;
GRANT ALL ON "public"."user_bank_accounts" TO anon;
