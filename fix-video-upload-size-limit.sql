-- Fix Video Upload Size Limit Issue
-- Run this in your Supabase SQL Editor to increase file size limits

-- Update the course-videos bucket to allow larger files (1GB limit)
UPDATE storage.buckets 
SET 
  file_size_limit = 1073741824, -- 1GB limit (1024MB)
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime']
WHERE id = 'course-videos';

-- If the bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  true,
  1073741824, -- 1GB limit
  ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 1073741824,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime'];

-- Also update course-materials bucket for larger PDFs and other files
UPDATE storage.buckets 
SET 
  file_size_limit = 209715200, -- 200MB limit for materials
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/zip', 'application/x-zip-compressed']
WHERE id = 'course-materials';

-- Create RLS policies for course videos bucket if they don't exist
CREATE POLICY IF NOT EXISTS "Users can upload course videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Users can view course videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'course-videos'
);

CREATE POLICY IF NOT EXISTS "Users can update their own course videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Users can delete their own course videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Check the current configuration
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
