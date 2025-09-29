-- Configure Row Level Security (RLS) with Public Access for All Tables
-- This migration enables RLS on all tables and creates policies for public access

-- =====================================================
-- DISABLE RLS ON ALL TABLES (for public access)
-- =====================================================

-- User table - disable RLS for public access
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;


-- Verification table - disable RLS for public access
ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;

-- Donations table - disable RLS for public access
ALTER TABLE "donations" DISABLE ROW LEVEL SECURITY;

-- Programs table - disable RLS for public access
ALTER TABLE "programs" DISABLE ROW LEVEL SECURITY;

-- Program periods table - disable RLS for public access
ALTER TABLE "program_periods" DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- ALTERNATIVE: ENABLE RLS WITH PUBLIC POLICIES
-- Uncomment this section if you want RLS enabled with public access policies
-- =====================================================

/*
-- Enable RLS on all tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "donations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "programs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "program_periods" ENABLE ROW LEVEL SECURITY;

-- Create public access policies for all tables

-- User table policies
CREATE POLICY "public_users_select" ON "user" FOR SELECT USING (true);
CREATE POLICY "public_users_insert" ON "user" FOR INSERT WITH CHECK (true);
CREATE POLICY "public_users_update" ON "user" FOR UPDATE USING (true);
CREATE POLICY "public_users_delete" ON "user" FOR DELETE USING (true);


-- Verification table policies
CREATE POLICY "public_verifications_select" ON "verification" FOR SELECT USING (true);
CREATE POLICY "public_verifications_insert" ON "verification" FOR INSERT WITH CHECK (true);
CREATE POLICY "public_verifications_update" ON "verification" FOR UPDATE USING (true);
CREATE POLICY "public_verifications_delete" ON "verification" FOR DELETE USING (true);

-- Donations table policies
CREATE POLICY "public_donations_select" ON "donations" FOR SELECT USING (true);
CREATE POLICY "public_donations_insert" ON "donations" FOR INSERT WITH CHECK (true);
CREATE POLICY "public_donations_update" ON "donations" FOR UPDATE USING (true);
CREATE POLICY "public_donations_delete" ON "donations" FOR DELETE USING (true);

-- Programs table policies
CREATE POLICY "public_programs_select" ON "programs" FOR SELECT USING (true);
CREATE POLICY "public_programs_insert" ON "programs" FOR INSERT WITH CHECK (true);
CREATE POLICY "public_programs_update" ON "programs" FOR UPDATE USING (true);
CREATE POLICY "public_programs_delete" ON "programs" FOR DELETE USING (true);

-- Program periods table policies
CREATE POLICY "public_program_periods_select" ON "program_periods" FOR SELECT USING (true);
CREATE POLICY "public_program_periods_insert" ON "program_periods" FOR INSERT WITH CHECK (true);
CREATE POLICY "public_program_periods_update" ON "program_periods" FOR UPDATE USING (true);
CREATE POLICY "public_program_periods_delete" ON "program_periods" FOR DELETE USING (true);
*/

-- =====================================================
-- GRANT PUBLIC ACCESS TO ALL TABLES
-- =====================================================

-- Grant all privileges to authenticated users (if using Supabase auth)
GRANT ALL ON "user" TO authenticated;
GRANT ALL ON "verification" TO authenticated;
GRANT ALL ON "donations" TO authenticated;
GRANT ALL ON "programs" TO authenticated;
GRANT ALL ON "program_periods" TO authenticated;

-- Grant all privileges to anonymous users (for public access)
GRANT ALL ON "user" TO anon;
GRANT ALL ON "verification" TO anon;
GRANT ALL ON "donations" TO anon;
GRANT ALL ON "programs" TO anon;
GRANT ALL ON "program_periods" TO anon;

-- Grant usage on sequences (for auto-incrementing IDs if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
