# Fix Payment Methods Database Schema

## Problem
The payment_methods table may have been created with UUID IDs instead of text IDs, causing errors when trying to add payment methods with kebab-case IDs like "gcash", "maya", etc.

## Solution
Run the migration file to fix the database schema.

## How to Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20250108000000_fix_payment_methods_schema.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message ✅

### Option 2: Using Supabase CLI
```bash
supabase db push
```

### Option 3: Manual SQL Execution
1. Connect to your Supabase database
2. Run the SQL from `supabase/migrations/20250108000000_fix_payment_methods_schema.sql`

## What This Migration Does
- ✅ Checks if payment_methods table exists
- ✅ Converts UUID ID to text ID (if needed)
- ✅ Creates table with text ID (if it doesn't exist)
- ✅ Sets up RLS policies correctly
- ✅ Creates update trigger
- ✅ Inserts default payment methods (gcash, maya, bank-transfer)

## After Running Migration
1. Try adding a payment method again
2. The error should be resolved
3. You should see specific error messages if there are still issues

## Verification
After running the migration, verify the table structure:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_methods'
ORDER BY ordinal_position;
```

The `id` column should be `text`, not `uuid`.

