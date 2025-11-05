-- CMVRReport RLS policies
-- This enables RLS on public."CMVRReport" and allows:
-- 1) Internal server (no JWT on the DB connection) to SELECT/INSERT/UPDATE/DELETE
-- 2) Authenticated users (with Supabase JWT) to operate only on their own rows (createdById = auth.uid())

-- Enable and force RLS
ALTER TABLE "public"."CMVRReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CMVRReport" FORCE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "CMVR internal read or owner" ON "public"."CMVRReport";
DROP POLICY IF EXISTS "CMVR internal insert or owner" ON "public"."CMVRReport";
DROP POLICY IF EXISTS "CMVR internal update or owner" ON "public"."CMVRReport";
DROP POLICY IF EXISTS "CMVR internal delete or owner" ON "public"."CMVRReport";

-- Helper predicate: when no JWT is present on the connection, current_setting('request.jwt.claims', true) returns NULL
-- That is the case for Prisma/Node direct connections using DATABASE_URL.

-- SELECT: allow internal (no JWT) or owner
CREATE POLICY "CMVR internal read or owner"
  ON "public"."CMVRReport"
  FOR SELECT
  USING (
    current_setting('request.jwt.claims', true) IS NULL
    OR "createdById" = auth.uid()::text
  );

-- INSERT: allow internal (no JWT) or owner (createdById must match jwt uid)
CREATE POLICY "CMVR internal insert or owner"
  ON "public"."CMVRReport"
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true) IS NULL
    OR "createdById" = auth.uid()::text
  );

-- UPDATE: allow internal (no JWT) or owner
CREATE POLICY "CMVR internal update or owner"
  ON "public"."CMVRReport"
  FOR UPDATE
  USING (
    current_setting('request.jwt.claims', true) IS NULL
    OR "createdById" = auth.uid()::text
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true) IS NULL
    OR "createdById" = auth.uid()::text
  );

-- DELETE: allow internal (no JWT) or owner
CREATE POLICY "CMVR internal delete or owner"
  ON "public"."CMVRReport"
  FOR DELETE
  USING (
    current_setting('request.jwt.claims', true) IS NULL
    OR "createdById" = auth.uid()::text
  );

-- Optional: quick inspection query (run manually in SQL editor)
-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'CMVRReport'
-- ORDER BY policyname;
