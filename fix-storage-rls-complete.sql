-- Complete Fix for Storage RLS Policies
-- Run this in your Supabase SQL Editor to fix video upload issues

-- Step 1: Create or update the course-videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  true,
  2147483648, -- 2GB limit
  ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 2147483648,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo'];

-- Step 2: Create or update the course-materials bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  209715200, -- 200MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/zip', 'application/x-zip-compressed']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 209715200,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/zip', 'application/x-zip-compressed'];

-- Step 3: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload course videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view course videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own course videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own course videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload course materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can view course materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own course materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own course materials" ON storage.objects;

-- Step 4: Create new RLS policies for course videos
CREATE POLICY "Users can upload course videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view course videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'course-videos'
);

CREATE POLICY "Users can update their own course videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own course videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

-- Step 5: Create new RLS policies for course materials
CREATE POLICY "Users can upload course materials" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view course materials" ON storage.objects
FOR SELECT USING (
  bucket_id = 'course-materials'
);

CREATE POLICY "Users can update their own course materials" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own course materials" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);

-- Step 6: Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Step 7: Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 8: Verify the configuration
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE id IN ('course-videos', 'course-materials')
ORDER BY name;

-- Step 9: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
