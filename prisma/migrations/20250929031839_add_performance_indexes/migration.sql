-- Performance indexes based on query patterns analysis

-- Programs table indexes
-- For filtering by status and category (getAll query)
CREATE INDEX "idx_programs_status_created_at" ON "programs"("status", "created_at");
CREATE INDEX "idx_programs_category_status" ON "programs"("category", "status");
CREATE INDEX "idx_programs_status" ON "programs"("status");
CREATE INDEX "idx_programs_created_by" ON "programs"("created_by");

-- Donations table indexes
-- For filtering by status (critical for aggregations and admin queries)
CREATE INDEX "idx_donations_status" ON "donations"("status");
CREATE INDEX "idx_donations_status_program_id" ON "donations"("status", "program_id");
CREATE INDEX "idx_donations_program_id_status" ON "donations"("program_id", "status");
CREATE INDEX "idx_donations_user_id_created_at" ON "donations"("user_id", "created_at");
CREATE INDEX "idx_donations_donor_email" ON "donations"("donor_email");
CREATE INDEX "idx_donations_verified_by_admin_id" ON "donations"("verified_by_admin_id");
CREATE INDEX "idx_donations_created_at" ON "donations"("created_at");

-- Program periods indexes
-- For program-period relationships and date filtering
CREATE INDEX "idx_program_periods_program_id_start_date" ON "program_periods"("program_id", "start_date");
CREATE INDEX "idx_program_periods_start_date" ON "program_periods"("start_date");
CREATE INDEX "idx_program_periods_next_activation_date" ON "program_periods"("next_activation_date");


-- User role index for admin queries
CREATE INDEX "idx_user_role" ON "user"("role");
CREATE INDEX "idx_user_role_status" ON "user"("role", "status");

-- Verification table indexes
CREATE INDEX "idx_verification_identifier" ON "verification"("identifier");
CREATE INDEX "idx_verification_expires_at" ON "verification"("expires_at");

-- Composite indexes for complex queries
-- For donation aggregations by program and status
CREATE INDEX "idx_donations_program_status_amount" ON "donations"("program_id", "status", "amount");

-- For user donation history queries
CREATE INDEX "idx_donations_user_program_created" ON "donations"("user_id", "program_id", "created_at");

-- For admin dashboard stats
CREATE INDEX "idx_donations_status_donor_email" ON "donations"("status", "donor_email");

-- For program listing with donation counts
CREATE INDEX "idx_donations_program_id_created_at" ON "donations"("program_id", "created_at");