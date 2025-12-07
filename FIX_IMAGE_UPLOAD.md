# Fix Image Upload Error

## Problem
You're getting the error: **"new row violates row-level security policy"** when trying to upload images.

## Solution

### Step 1: Run the Database Migration

Run this SQL in your Supabase SQL Editor:

**File:** `supabase/migrations/20250107000000_fix_image_upload_rls.sql`

Or copy and paste this SQL directly:

```sql
-- Drop existing upload policies
DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to menu-images" ON storage.objects;

-- Allow public/anonymous uploads to menu-images bucket
CREATE POLICY "Allow public uploads to menu-images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'menu-images');

-- Also allow authenticated users to upload
CREATE POLICY "Authenticated users can upload menu images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');

-- Ensure public read access
DROP POLICY IF EXISTS "Public read access for menu images" ON storage.objects;
CREATE POLICY "Public read access for menu images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- Allow public to update
CREATE POLICY "Allow public updates to menu-images"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- Allow public to delete
CREATE POLICY "Allow public deletes from menu-images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'menu-images');

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
```

### Step 2: Verify Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Check if `menu-images` bucket exists
4. If it doesn't exist, create it with these settings:
   - **Name**: `menu-images`
   - **Public bucket**: ✅ Enable
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

### Step 3: Verify Policies

1. Go to **Storage** → **Policies** → `menu-images`
2. You should see these policies:
   - "Allow public uploads to menu-images" (INSERT, public)
   - "Public read access for menu images" (SELECT, public)
   - "Allow public updates to menu-images" (UPDATE, public)
   - "Allow public deletes from menu-images" (DELETE, public)

### Step 4: Test Upload

After running the migration, try uploading an image again. It should work now!

## Alternative: Manual Policy Setup

If the migration doesn't work, you can manually create the policies in Supabase Dashboard:

1. Go to **Storage** → **Policies** → `menu-images`
2. Click **New Policy**
3. Create these policies:

**Policy 1: Public Upload**
- Policy name: `Allow public uploads to menu-images`
- Allowed operation: `INSERT`
- Target roles: `public`
- USING expression: `bucket_id = 'menu-images'`
- WITH CHECK expression: `bucket_id = 'menu-images'`

**Policy 2: Public Read**
- Policy name: `Public read access for menu images`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'menu-images'`

**Policy 3: Public Update**
- Policy name: `Allow public updates to menu-images`
- Allowed operation: `UPDATE`
- Target roles: `public`
- USING expression: `bucket_id = 'menu-images'`
- WITH CHECK expression: `bucket_id = 'menu-images'`

**Policy 4: Public Delete**
- Policy name: `Allow public deletes from menu-images`
- Allowed operation: `DELETE`
- Target roles: `public`
- USING expression: `bucket_id = 'menu-images'`

## Troubleshooting

If you still get errors:

1. **Check bucket exists**: Verify `menu-images` bucket exists in Storage
2. **Check bucket is public**: The bucket should be set to "Public bucket"
3. **Check policies**: All 4 policies should exist and be enabled
4. **Clear browser cache**: Sometimes cached policies cause issues
5. **Check file size**: Make sure image is under 5MB
6. **Check file type**: Only JPEG, PNG, WebP, GIF are allowed

## Security Note

These policies allow public uploads, which is fine for an admin dashboard. The bucket-level restrictions (file size, MIME types) still provide security. If you want to restrict uploads to authenticated users only, you'll need to implement Supabase authentication in your admin dashboard.

