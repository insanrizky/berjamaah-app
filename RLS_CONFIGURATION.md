# Row Level Security (RLS) Configuration Guide

## Overview

This document explains the RLS configuration for your berjamaah-app database. The migration `20250929032848_configure_rls_public_access` provides two approaches for making all tables publicly accessible.

## Current Migration Analysis

### ✅ Tables Configured for Public Access

All tables in your schema are configured for public access:

1. **user** - User accounts and profiles
2. **session** - NextAuth session data
3. **account** - OAuth account connections
4. **verification_token** - NextAuth verification tokens
5. **verification** - Custom email verification tokens
6. **donations** - Donation records
7. **programs** - Donation programs
8. **program_periods** - Recurring donation cycles

## Two Approaches Available

### 🔧 Approach 1: DISABLE RLS (Currently Active)

```sql
-- This completely disables RLS, making all tables fully public
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "donations" DISABLE ROW LEVEL SECURITY;
-- ... for all tables
```

**Pros:**
- ✅ Simplest configuration
- ✅ No performance overhead
- ✅ No policy complexity
- ✅ Full public access guaranteed

**Cons:**
- ❌ No security layer at database level
- ❌ Can't implement granular access control later without migration
- ❌ All data is completely public

### 🔧 Approach 2: ENABLE RLS with Public Policies (Alternative)

```sql
-- Enable RLS but create policies that allow everything
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_users_select" ON "user" FOR SELECT USING (true);
CREATE POLICY "public_users_insert" ON "user" FOR INSERT WITH CHECK (true);
-- ... for all operations and tables
```

**Pros:**
- ✅ RLS infrastructure in place for future granular controls
- ✅ Can easily modify policies later
- ✅ Better security foundation
- ✅ Supabase dashboard integration

**Cons:**
- ❌ Slight performance overhead
- ❌ More complex configuration
- ❌ Requires policy management

## Supabase-Specific Roles

The migration includes grants for Supabase's built-in roles:

### `authenticated` Role
- Users who are logged in via Supabase Auth
- Gets full access to all tables

### `anon` Role  
- Anonymous/unauthenticated users
- Also gets full access to all tables (for public access)

## How to Switch Between Approaches

### To Use Approach 1 (Disable RLS) - Current
The migration is already configured for this. Simply apply it:

```bash
npx prisma migrate dev
```

### To Use Approach 2 (Enable RLS with Public Policies)
1. Edit the migration file:
   - Comment out the `DISABLE ROW LEVEL SECURITY` section
   - Uncomment the policy creation section
2. Apply the migration

## Security Considerations

### ⚠️ Warning: Complete Public Access

Both approaches provide **complete public access** to all data:

- Anyone can SELECT, INSERT, UPDATE, DELETE any row
- No authentication required
- No data protection at database level

### When This is Appropriate:
- ✅ Development/testing environments
- ✅ Public data applications (like donation platforms)
- ✅ When application-level security is sufficient
- ✅ MVP/prototype phases

### When to Implement Granular RLS:
- 🔒 Production environments with sensitive data
- 🔒 User-specific data access requirements
- 🔒 Admin-only operations
- 🔒 Compliance requirements

## Future Migration to Granular RLS

If you later want to implement proper access controls, here's an example for user-specific data:

```sql
-- Example: Users can only access their own donations
CREATE POLICY "users_own_donations" ON "donations" 
FOR SELECT USING (auth.uid()::text = user_id);

-- Example: Only admins can verify donations
CREATE POLICY "admin_verify_donations" ON "donations" 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM "user" 
    WHERE id = auth.uid()::text AND role = 'admin'
  )
);
```

## Testing RLS Configuration

### Test Public Access:
```sql
-- These should all work without authentication:
SELECT * FROM programs WHERE status = 'active';
INSERT INTO donations (...) VALUES (...);
UPDATE programs SET status = 'active' WHERE id = '...';
```

### Test with Supabase Client:
```typescript
// This should work without authentication
const { data, error } = await supabase
  .from('programs')
  .select('*')
  .eq('status', 'active');
```

## Performance Impact

### Approach 1 (Disabled RLS):
- 🚀 Zero RLS overhead
- 🚀 Direct table access
- 🚀 Fastest possible queries

### Approach 2 (Enabled RLS with Public Policies):
- ⚡ Minimal overhead (~1-5ms per query)
- ⚡ Policy evaluation for each query
- ⚡ Still very fast for simple policies

## Recommended Usage

### For Development:
Use **Approach 1** (Disabled RLS) for simplicity

### For Production:
Consider **Approach 2** if you might need granular controls later

### For MVP/Demo:
Either approach works fine

## Migration Commands

```bash
# Apply the RLS configuration
npx prisma migrate dev

# Reset and reapply if needed
npx prisma migrate reset

# Deploy to production
npx prisma migrate deploy
```

## Troubleshooting

### Common Issues:

1. **"permission denied for table"**
   - Check if grants were applied correctly
   - Verify Supabase roles exist

2. **"row-level security policy violation"** 
   - RLS is enabled but no matching policy
   - Switch to Approach 1 or add proper policies

3. **"relation does not exist"**
   - Table names might be case-sensitive
   - Check exact table names in schema

### Debug Commands:
```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- List policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check grants
SELECT * FROM information_schema.role_table_grants WHERE table_schema = 'public';
```
