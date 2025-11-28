-- Fix Course Materials Bucket to Support Video Files
-- This script updates the course-materials bucket to allow video MIME types
-- Run this in your Supabase SQL Editor

-- Step 1: Update the course-materials bucket to allow video files
UPDATE storage.buckets 
SET 
  file_size_limit = 524288000, -- 500MB limit for larger video files
  allowed_mime_types = ARRAY[
    'video/mp4', 
    'video/webm', 
    'video/avi', 
    'video/mov', 
    'video/quicktime',
    'application/pdf', 
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'application/zip', 
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
WHERE id = 'course-materials';

-- Step 2: If the bucket doesn't exist, create it with video support
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  524288000, -- 500MB limit
  ARRAY[
    'video/mp4', 
    'video/webm', 
    'video/avi', 
    'video/mov', 
    'video/quicktime',
    'application/pdf', 
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'application/zip', 
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY[
    'video/mp4', 
    'video/webm', 
    'video/avi', 
    'video/mov', 
    'video/quicktime',
    'application/pdf', 
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'application/zip', 
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

-- Step 3: Ensure RLS policies exist for course-materials bucket
DROP POLICY IF EXISTS "Users can upload course materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can view course materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own course materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own course materials" ON storage.objects;

-- Create RLS policies for course-materials bucket
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

-- Step 4: Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 5: Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Step 6: Verify the configuration
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE id = 'course-materials';

-- Step 7: Check RLS policies
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
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%course-materials%'
ORDER BY policyname;
