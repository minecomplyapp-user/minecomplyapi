-- Storage RLS Policies for minecomplyapp-bucket
-- 
-- IMPORTANT: You CANNOT run this SQL directly in Supabase SQL Editor due to permission restrictions.
-- Instead, follow these steps:
--
-- METHOD 1 (Recommended - Use Supabase Storage UI):
-- 1. Go to Supabase Dashboard → Storage → minecomplyapp-bucket
-- 2. Click the "Policies" tab
-- 3. Click "New Policy" and add each policy below manually using the UI
--
-- METHOD 2 (Alternative - Use storage schema prefix and hope for the best):
-- The SQL below attempts to work around permissions, but may still fail.
-- If it fails, use METHOD 1 above.

-- Drop existing policies if they exist (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow authenticated uploads to minecomplyapp-bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from minecomplyapp-bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to minecomplyapp-bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from minecomplyapp-bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access to minecomplyapp-bucket" ON storage.objects;

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to minecomplyapp-bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'minecomplyapp-bucket'
);

-- Policy 2: Allow authenticated users to read their own files
CREATE POLICY "Allow authenticated reads from minecomplyapp-bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'minecomplyapp-bucket'
);

-- Policy 3: Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates to minecomplyapp-bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'minecomplyapp-bucket'
)
WITH CHECK (
  bucket_id = 'minecomplyapp-bucket'
);

-- Policy 4: Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes from minecomplyapp-bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'minecomplyapp-bucket'
);

-- Policy 5: Allow service role full access (for backend operations)
CREATE POLICY "Allow service role full access to minecomplyapp-bucket"
ON storage.objects
FOR ALL
TO service_role
USING (
  bucket_id = 'minecomplyapp-bucket'
)
WITH CHECK (
  bucket_id = 'minecomplyapp-bucket'
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%minecomplyapp-bucket%'
ORDER BY policyname;
