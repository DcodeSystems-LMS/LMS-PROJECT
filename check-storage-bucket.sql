-- Check Storage Bucket Configuration
-- Run this in your Supabase SQL editor to verify bucket settings

-- Check if the course-materials bucket exists and its configuration
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE name = 'course-materials';

-- If the bucket doesn't exist, you'll need to create it through the Supabase dashboard
-- Go to Storage > Create bucket > Name: course-materials

-- Check storage policies for the course-materials bucket
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%course-materials%';

-- If no storage policies exist, create them
-- Note: These policies need to be created through the Supabase dashboard
-- Go to Storage > course-materials bucket > Policies tab

-- Example storage policies you should have:
-- 1. Allow authenticated users to upload files
-- 2. Allow authenticated users to view files
-- 3. Allow course instructors to manage files for their courses
