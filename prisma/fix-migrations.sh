#!/bin/bash

# Script to fix migration order mismatch after renaming migration files
# This resolves the mismatch between database migration records and renamed files

echo "Fixing migration order mismatch..."

# Step 1: Mark old migration records as rolled back (removes them from active history)
echo "Removing old migration records..."
npx prisma migrate resolve --rolled-back 20250115000000_add_bank_account_fields_to_donations 2>/dev/null || true
npx prisma migrate resolve --rolled-back 20250115000001_remove_user_bank_account_id_from_donations 2>/dev/null || true
npx prisma migrate resolve --rolled-back 20251003000000_add_bank_account_fields_to_donations 2>/dev/null || true
npx prisma migrate resolve --rolled-back 20251003000001_remove_user_bank_account_id_from_donations 2>/dev/null || true

# Step 2: Mark the correctly named migrations as applied
echo "Marking renamed migrations as applied..."
npx prisma migrate resolve --applied 20251002175000_add_bank_account_fields_to_donations 2>/dev/null || true
npx prisma migrate resolve --applied 20251002175100_remove_user_bank_account_id_from_donations 2>/dev/null || true

# Step 3: Check migration status
echo ""
echo "Checking migration status..."
npx prisma migrate status

echo ""
echo "Done! If you see any remaining issues, you may need to manually update the _prisma_migrations table."
