/*
  Warnings:

  - You are about to drop the column `bank_account_receiver` on the `donations` table. All the data in the column will be lost.
  - You are about to drop the column `bank_account_sender` on the `donations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."donations" DROP COLUMN "bank_account_receiver",
DROP COLUMN "bank_account_sender",
ADD COLUMN     "user_bank_account_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."donations" ADD CONSTRAINT "donations_user_bank_account_id_fkey" FOREIGN KEY ("user_bank_account_id") REFERENCES "public"."user_bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
