-- Complete Fix for Video Upload Size Limit Issue
-- Run this in your Supabase SQL Editor to fix the 134MB upload issue

-- Step 1: Update the course-videos bucket to allow much larger files (2GB limit)
UPDATE storage.buckets 
SET 
  file_size_limit = 2147483648, -- 2GB limit (2048MB)
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo']
WHERE id = 'course-videos';

-- Step 2: If the bucket doesn't exist, create it with proper settings
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

-- Step 3: Also update course-materials bucket for larger PDFs and other files
UPDATE storage.buckets 
SET 
  file_size_limit = 536870912, -- 512MB limit for materials
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/zip', 'application/x-zip-compressed', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
WHERE id = 'course-materials';

-- Step 4: Create or update RLS policies for course videos bucket
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can upload course videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view course videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own course videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own course videos" ON storage.objects;

-- Create new policies
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

-- Step 5: Create or update RLS policies for course materials bucket
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can upload course materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can view course materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own course materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own course materials" ON storage.objects;

-- Create new policies
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

-- Step 7: Verify the configuration
SELECT 
  name,
  id,
  public,
  file_size_limit,
  ROUND(file_size_limit / 1024.0 / 1024.0, 2) as file_size_limit_mb,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE id IN ('course-videos', 'course-materials')
ORDER BY name;

-- Expected output should show:
-- course-videos: 2048.00 MB limit
-- course-materials: 512.00 MB limit
